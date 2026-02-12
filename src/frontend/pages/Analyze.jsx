import { useState } from "react";
import { useYouTubeAnalysis } from "../hooks/useYouTubeAnalysis";

function Analyze() {
  const {
    analyze,
    data: result,
    loading,
    error,
    history,
    clearHistory,
    removeFromHistory,
  } = useYouTubeAnalysis();
  const [url, setUrl] = useState("");

  const { channel, analysis, type, video } = result || {};

  async function handleSubmit(e) {
    e.preventDefault();
    await analyze(url);
    setUrl("");
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

      <div className="flex gap-5">
        {type === "channel" && channel && analysis && (
          <div className="flex-[1.8] mt-6 p-4 border rounded bg-gray-50">
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

        {type === "video" && video && analysis && (
          <div className="flex-[1.8] mt-6 p-4 border rounded">
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
        {history.length > 0 && (
          <div className="flex-[0.6] mt-6 p-4 border rounded bg-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">History</h3>
              <button onClick={clearHistory} className="text-sm text-red-600">
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.url}
                  className="flex items-center justify-between bg-white p-2 rounded shadow hover:bg-gray-50"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => analyze(item.url)}
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.type}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromHistory(item.url)}
                    className="text-red-500 text-sm"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analyze;
