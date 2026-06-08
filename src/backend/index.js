import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

           // 1 Validate input
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
              // Fetch full video details
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

                   // Clean video object
                   const cleanVideo = {
                             title: video.snippet.title,
                             views: Number(video.statistics.viewCount),
                             uploadedAt: video.snippet.publishedAt,
                             channelName: video.snippet.channelTitle,
                             description: video.snippet.description,
                   };

                   // Fetch top comments
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

                   // AI prompt for video
                   const aiPrompt = `You are a YouTube video analyst.

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

                   // Call Gemini
                   const result = await model.generateContent(
                             "You output only valid JSON.\n\n" + aiPrompt
                           );
              const rawText = result.response.text();
              const jsonMatch = rawText.match(/\{[\s\S]*\}/);

                   // Parse AI
                   let analysis;
              try {
                        analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
              } catch {
                        analysis = {
                                    summary: "AI analysis failed.",
                                    goodCommentsPercent: null,
                                    badCommentsPercent: null,
                                    worthWatching: "Unknown",
                                    improvementSuggestions: "Could not generate suggestions.",
                        };
              }

                   // RETURN VIDEO RESPONSE (IMPORTANT)
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

      // 5 Extract publish dates
      const publishDates = searchResponse.data.items
                   .map((item) => new Date(item.snippet.publishedAt))
                   .filter((date) => !isNaN(date));

      // 6 Calculate upload frequency
      let uploadFrequency = "Unknown";
                 if (publishDates.length >= 2) {
                         const intervals = [];
                         for (let i = 0; i < publishDates.length - 1; i++) {
                                   intervals.push(
                                               Math.abs(publishDates[i] - publishDates[i + 1]) / (1000 * 60 * 60 * 24),
                                             );
                         }
                         const avgDays = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                         uploadFrequency =
                                   avgDays < 2
                             ? "Daily"
                                     : avgDays < 8
                             ? "Weekly"
                                     : avgDays < 16
                             ? "Bi-weekly"
                                     : avgDays < 35
                             ? "Monthly"
                                     : "Rarely";
                 }

      // 7 Fetch channel details
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

      if (!channelResponse.data.items.length) {
              return res.status(404).json({ error: "Channel not found" });
      }

      const rawChannel = channelResponse.data.items[0];

      // 9 Build clean channel object
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
      const aiPrompt = `You are a YouTube channel analyst.

      Analyze the channel below and return ONLY valid JSON with:
      - summary (2-3 sentences)
      - score (0-100)
      - worthFollowing ("Yes", "Maybe", "No")
      - reason (short explanation)

      Channel info:
      Name: ${cleanChannel.name}
      Subscribers: ${cleanChannel.subscribers ?? "Hidden"}
      Upload frequency: ${cleanChannel.uploadFrequency}
      Description: ${cleanChannel.description || "No description"}
      `;

      // 11 Call Gemini
      const result = await model.generateContent(
              "You output only valid JSON.\n\n" + aiPrompt
            );
                 const rawText = result.response.text();
                 const jsonMatch = rawText.match(/\{[\s\S]*\}/);

      // 12 Parse AI output safely
      let analysis;
                 try {
                         analysis = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
                 } catch {
                         analysis = {
                                   summary: "AI analysis failed.",
                                   score: null,
                                   worthFollowing: "Unknown",
                                   reason: "Could not parse AI output.",
                         };
                 }

      // 13 Final response
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
