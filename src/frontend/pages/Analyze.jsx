import { useState } from "react";
import { useYouTubeAnalysis } from "../hooks/useYouTubeAnalysis";
import HistoryPanel from "../components/HistoryPanel";
import SkeletonResult from "../components/SkeletonResult";

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
  const [activeURL, setActiveURL] = useState(null);

  const { channel, analysis, type, video } = result || {};

  async function handleSubmit(e) {
    e.preventDefault();
    await analyze(url);
    setActiveURL(url);
    setUrl("");
  }

  function handleHistorySelect(selectedURL) {
    setActiveURL(selectedURL);
    analyze(selectedURL);
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
        <div className="flex-[1.8]">
          {loading && <SkeletonResult/>}


          {!loading && type === "channel" && channel && analysis && (
            <div className="mt-6 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">
                Channel AI Analysis
              </h3>

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

          {!loading && type === "video" && video && analysis && (
            <div className=" mt-6 p-4 border rounded">
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
                  <strong>Good comments:</strong> {analysis.goodCommentsPercent}
                  %
                </p>

                <p className="mb-2">
                  <strong>Bad comments:</strong> {analysis.badCommentsPercent}%
                </p>

                <p className="mb-2">
                  <strong>Worth watching:</strong> {analysis.worthWatching}
                </p>

                <p>
                  <strong>Suggestions:</strong>{" "}
                  {analysis.improvementSuggestions}
                </p>
              </div>
            </div>
          )}
        </div>
        <HistoryPanel
          history={history}
          onSelect={handleHistorySelect}
          onRemove={removeFromHistory}
          onClear={clearHistory}
          activeURL={activeURL}
        />
      </div>
    </div>
  );
}

export default Analyze;
