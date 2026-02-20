import { useState, useEffect, useCallback } from "react";
import { analyzeYouTube } from "../../services/api";

export function useYouTubeAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const CACHE_KEY = "yt-analysis-cache";
  const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

  //Check data in local storage or not
  function getCache() {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  //save data in local storage
  function setCache(cache) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }

  //Clear history form Local storage
  const clearHistory = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setHistory([]);
  },[]);

  // Remove history URL from History section
  const removeFromHistory = useCallback((url) => {
    const cache = getCache();

    delete cache[url];
    setCache(cache);

    setHistory(
      Object.entries(cache)
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .map(([url, value]) => ({
          url,
          ...value.meta,
          timestamp: value.timestamp,
        })),
    );
  },[]);

  useEffect(() => {
    const cache = getCache();

    const formattedHistory = Object.entries(cache)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .map(([url, value]) => ({
        url,
        ...value.meta,
        timestamp: value.timestamp,
      }));

    setHistory(formattedHistory);
  }, []);

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

   
  const analyze = useCallback(async(url) => {
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

    const normalizedURL = normalizeYouTubeUrl(url);

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const cache = getCache();
      if (cache[normalizedURL]) {
        const { data, timestamp } = cache[normalizedURL];
        const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;

        if (!isExpired) {
          setData(data);
          setLoading(false);
          return;
        }
      }

      const result = await analyzeYouTube(normalizedURL);

      let meta = {};

      if (result.type === "video") {
        meta = {
          title: result.video.title,
          thumbnail: `https://img.youtube.com/vi/${normalizedURL.split("v=")[1]}/hqdefault.jpg`,
          type: "video",
        };
      }

      if (result.type === "channel") {
        meta = {
          title: result.channel.name,
          thumbnail: null,
          type: "channel",
        };
      }

      const updatedCache = {
        ...cache,
        [normalizedURL]: {
          data: result,
          timestamp: Date.now(),
          meta,
        },
      };

      setCache(updatedCache);
      setData(result);
      setHistory(
        Object.entries(updatedCache)
          .sort((a, b) => b[1].timestamp - a[1].timestamp)
          .map(([url, value]) => ({
            url,
            ...value.meta,
            timestamp: value.timestamp,
          })),
      );
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError("Cannot connect to server. Please try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  },[]);

  return {
    analyze,
    data,
    loading,
    error,
    history,
    clearHistory,
    removeFromHistory,
  };
}
