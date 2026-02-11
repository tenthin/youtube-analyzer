import { useState } from "react";
import { analyzeYouTube } from "../../services/api";

export function useYouTubeAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function normalizeYouTubeUrl(inputUrl) {
    if (inputUrl.includes("youtu.be/")) {
      const videoId = inputUrl.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    if (inputUrl.includes("m.youtube.com")) {
      return inputUrl.replace("m.youtube.com", "www.youtube.com");
    }

    return inputUrl;
  }

  async function analyze(url) {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    const isYouTubeUrl =
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("m.youtube.com");

    if (!isYouTubeUrl) {
      setError("Please enter a valid YouTube URL");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const normalizedUrl = normalizeYouTubeUrl(url);
      const result = await analyzeYouTube(normalizedUrl);

      setData(result);
    } catch (err) {
      setError("Something went wrong while analyzing.");
    } finally {
      setLoading(false);
    }
  }

  return { analyze, data, loading, error };
}
