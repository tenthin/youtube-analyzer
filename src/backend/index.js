import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import OpenAI from "openai";

dotenv.config();

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("YouTube Analyzer backend running");
});

app.post("/analyze", async (req, res) => {
  const { url } = req.body;

  // 1️⃣ Validate input
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    let channelId = null;
    let videoId = null;

    // Detect video URL
    if (url.includes("watch?v=") || url.includes("youtu.be")) {
      if (url.includes("watch?v=")) {
        videoId = new URL(url).searchParams.get("v");
      } else {
        videoId = url.split("youtu.be/")[1];
      }
    }

    // 2 Detect channel ID URL
    else if (url.includes("/channel/")) {
      channelId = url.split("/channel/")[1].split("/")[0];
    }

    // Detect handle URL (@username)
    else if (url.includes("/@")) {
      const handle = url.split("/@")[1].split("/")[0];

      const handleResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: handle,
            type: "channel",
            key: process.env.YOUTUBE_API_KEY,
          },
        },
      );

      if (!handleResponse.data.items.length) {
        return res.status(404).json({ error: "Channel not found" });
      }

      channelId = handleResponse.data.items[0].snippet.channelId;
    }

    // Unsupported URL
    else {
      return res.status(400).json({ error: "Unsupported YouTube URL" });
    }

    // 3 Get channelId from video
    if (!channelId) {
      const videoResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            part: "snippet",
            id: videoId,
            key: process.env.YOUTUBE_API_KEY,
          },
        },
      );

      if (!videoResponse.data.items.length) {
        return res.status(404).json({ error: "Video not found" });
      }

      channelId = videoResponse.data.items[0].snippet.channelId;
    }

    if (videoId) {
      //  Fetch full video details
      const videoDetailsResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            part: "snippet,statistics,contentDetails",
            id: videoId,
            key: process.env.YOUTUBE_API_KEY,
          },
        },
      );

      if (!videoDetailsResponse.data.items.length) {
        return res.status(404).json({ error: "Video not found" });
      }

      const video = videoDetailsResponse.data.items[0];

      //  Clean video object
      const cleanVideo = {
        title: video.snippet.title,
        views: Number(video.statistics.viewCount),
        uploadedAt: video.snippet.publishedAt,
        channelName: video.snippet.channelTitle,
        description: video.snippet.description,
      };

      //  Fetch top comments
      let comments = [];
      let commentsDisabled = false;

      try {
        const commentsResponse = await axios.get(
          "https://www.googleapis.com/youtube/v3/commentThreads",
          {
            params: {
              part: "snippet",
              videoId,
              maxResults: 20,
              order: "relevance",
              textFormat: "plainText",
              key: process.env.YOUTUBE_API_KEY,
            },
          },
        );

        comments = commentsResponse.data.items.map(
          (item) => item.snippet.topLevelComment.snippet.textDisplay,
        );
      } catch (err) {
        if (err.response?.status === 403) {
          commentsDisabled = true;
          console.log("Comments unavailable for this video.");
        } else {
          console.error(
            "Comment fetch error:",
            err.response?.data || err.message,
          );
          commentsDisabled = true; // fallback instead of crashing
        }
      }

      //  AI prompt for video
      const aiPrompt = `
You are a YouTube video analyst.

Return ONLY valid JSON with:
- summary
- goodCommentsPercent
- badCommentsPercent
- worthWatching ("Yes","Maybe","No")
- improvementSuggestions

Video description:
${cleanVideo.description || "No description"}

Viewer comments:
${commentsDisabled ? "Comments are disabled." : comments.join("\n")}
`;

      //  Call OpenAI
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You output only valid JSON." },
          { role: "user", content: aiPrompt },
        ],
        temperature: 0.4,
      });

      //  Parse AI
      let analysis;
      try {
        analysis = JSON.parse(aiResponse.choices[0].message.content);
      } catch {
        analysis = {
          summary: "AI analysis failed.",
          goodCommentsPercent: null,
          badCommentsPercent: null,
          worthWatching: "Unknown",
          improvementSuggestions: "Could not generate suggestions.",
        };
      }

      //  RETURN VIDEO RESPONSE (IMPORTANT)
      return res.json({
        type: "video",
        video: cleanVideo,
        analysis,
        commentsDisabled,
      });
    }

    // 4 Fetch last 10 videos (for upload frequency)
    const searchResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          channelId,
          order: "date",
          type: "video",
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY,
        },
      },
    );

    // 5️ Extract publish dates
    const publishDates = searchResponse.data.items
      .map((item) => new Date(item.snippet.publishedAt))
      .filter((date) => !isNaN(date));

    // 6️ Calculate gaps between uploads
    const gapsInDays = [];
    for (let i = 0; i < publishDates.length - 1; i++) {
      const diffMs = publishDates[i] - publishDates[i + 1];
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      gapsInDays.push(diffDays);
    }

    // 7️ Determine upload frequency
    let uploadFrequency = "Unknown";
    if (gapsInDays.length > 0) {
      const avgGap =
        gapsInDays.reduce((sum, g) => sum + g, 0) / gapsInDays.length;

      if (avgGap <= 2) uploadFrequency = "Daily";
      else if (avgGap <= 7) uploadFrequency = "Weekly";
      else if (avgGap <= 20) uploadFrequency = "Bi-weekly";
      else uploadFrequency = "Monthly / Irregular";
    }

    // 8️ Fetch channel details
    const channelResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/channels",
      {
        params: {
          part: "snippet,statistics",
          id: channelId,
          key: process.env.YOUTUBE_API_KEY,
        },
      },
    );

    const rawChannel = channelResponse.data.items[0];

    // 9️ Build clean channel object
    const cleanChannel = {
      id: rawChannel.id,
      name: rawChannel.snippet.title,
      subscribers: rawChannel.statistics.hiddenSubscriberCount
        ? null
        : Number(rawChannel.statistics.subscriberCount),
      totalVideos: Number(rawChannel.statistics.videoCount),
      description: rawChannel.snippet.description,
      createdAt: rawChannel.snippet.publishedAt,
      uploadFrequency,
    };

    // 10 Prepare AI input
    const aiPrompt = `
You are a YouTube channel analyst.

Analyze the channel below and return ONLY valid JSON with:
- summary (2–3 sentences)
- score (0–100)
- worthFollowing ("Yes", "Maybe", "No")
- reason (short explanation)

Channel info:
Name: ${cleanChannel.name}
Subscribers: ${cleanChannel.subscribers ?? "Hidden"}
Upload frequency: ${cleanChannel.uploadFrequency}
Description: ${cleanChannel.description || "No description"}
`;

    // 1️1 Call OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You output only valid JSON." },
        { role: "user", content: aiPrompt },
      ],
      temperature: 0.4,
    });

    // 1️2 Parse AI output safely
    let analysis;
    try {
      analysis = JSON.parse(aiResponse.choices[0].message.content);
    } catch {
      analysis = {
        summary: "AI analysis failed.",
        score: null,
        worthFollowing: "Unknown",
        reason: "Could not parse AI output.",
      };
    }

    // 1️3 Final response
    res.json({
      type: "channel",
      channel: cleanChannel,
      analysis,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze YouTube channel" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
