import { useState } from "react";

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

function Analyze() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const channel = result?.channel;
  const analysis = result?.analysis;
  const type = result?.type;
  const video = result?.video;

  let name = "";
  let subscribers = "";
  let totalVideos = "";

  if (channel) {
    name = channel.name;

    if (channel.subscribers) {
      subscribers = channel.subscribers.toLocaleString();
    } else {
      subscribers = "Subscribers hidden";
    }

    totalVideos = channel.totalVideos;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a Youtube URL");
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

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const normalizedUrl = normalizeYouTubeUrl(url);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            url: normalizedUrl,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong while analyzing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter the URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-[400px] p-3"
        />
        <button
          className="bg-black px-6 py-3 text-white rounded-lg"
          type="submit"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {type === "channel" && analysis && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">Channel AI Analysis</h3>

          <p className="mb-2">
            <strong>Summary:</strong> {analysis.summary}
          </p>

          <p className="mb-2">
            <strong>Score:</strong> {analysis.score}/100
          </p>

          <p className="mb-2">
            <strong>Worth Following:</strong> {analysis.worthFollowing}
          </p>

          <p>
            <strong>Reason:</strong> {analysis.reason}
          </p>
        </div>
      )}

      {type === "video" && video && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="font-semibold text-lg mb-2">{video.title}</h2>

          <p className="text-sm text-gray-600 mb-1">
            Uploaded by <strong>{video.channelName}</strong>
          </p>

          <p className="text-sm text-gray-600 mb-1">
            Views: {video.views.toLocaleString()}
          </p>

          <p className="text-sm text-gray-600 mb-3">
            Uploaded on: {new Date(video.uploadedAt).toDateString()}
          </p>

          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">AI Video Analysis</h3>

            <p className="mb-2">
              <strong>Summary:</strong> {analysis.summary}
            </p>

            <p className="mb-2">
              <strong>Good comments:</strong> {analysis.goodCommentsPercent}%
            </p>

            <p className="mb-2">
              <strong>Bad comments:</strong> {analysis.badCommentsPercent}%
            </p>

            <p className="mb-2">
              <strong>Worth watching:</strong> {analysis.worthWatching}
            </p>

            <p>
              <strong>Suggestions:</strong> {analysis.improvementSuggestions}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analyze;
