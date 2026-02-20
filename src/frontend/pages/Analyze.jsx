import { useCallback, useState } from "react";
import { useYouTubeAnalysis } from "../hooks/useYouTubeAnalysis";
import HistoryPanel from "../components/HistoryPanel";
import SkeletonResult from "../components/SkeletonResult";
import ErrorCard from "../components/ErrorCard";
import SentimentChart from "../components/SentimentChart";

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
  const [activeTab, setActiveTab] = useState("overview");

  const { channel, analysis, type, video, commentsDisabled } = result || {};

  async function handleSubmit(e) {
    e.preventDefault();
    await analyze(url);
    setActiveURL(url);
    setActiveTab("overview");
    setUrl("");
  }

  const handleHistorySelect = useCallback(
    (selectedURL) => {
      setActiveURL(selectedURL);
      analyze(selectedURL);
      setActiveTab("overview");
    },
    [analyze],
  );

  function getTabClass(tabName) {
    const base = "py-2 px-4 rounded cursor-pointer transition duration-200";

    const active = "bg-black text-white";

    const inactive = "bg-gray-200 text-gray-700 hover:bg-gray-300";

    return `${base} ${activeTab === tabName ? active : inactive}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-center">YouTube Analyzer</h1>
      <form onSubmit={handleSubmit} className="text-center">
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

      <div className="flex gap-5">
        <div className="flex-[1.8]">
          {loading && <SkeletonResult />}

          {!loading && error && (
            <ErrorCard
              message={error}
              onRetry={() => activeURL && analyze(activeURL)}
            />
          )}
          {!loading && !error && type === "channel" && channel && analysis && (
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

          {!loading && !error && type === "video" && video && analysis && (
            <div className=" mt-6 p-4 border rounded">
              <div className="flex gap-4 mb-3">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={getTabClass("overview")}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={getTabClass("summary")}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab("sentiment")}
                  className={getTabClass("sentiment")}
                >
                  Sentiment
                </button>
              </div>
              {activeTab === "overview" && (
                <>
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
                </>
              )}
              {activeTab === "summary" && (
                <>
                  <h3 className="font-semibold mb-2">AI Video Analysis</h3>
                  <p className="mb-2">
                    <strong>Summary:</strong> {analysis.summary}
                  </p>{" "}
                  <p className="mb-2">
                    <strong>Worth watching:</strong> {analysis.worthWatching}
                  </p>
                  <p>
                    <strong>Suggestions:</strong>{" "}
                    {analysis.improvementSuggestions}
                  </p>
                </>
              )}
              {activeTab === "sentiment" && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  {commentsDisabled ? (
                    <p className="text-yellow-600 font-medium">
                      Comments are disabled for this video.
                    </p>
                  ) : (
                    <>
                      <SentimentChart
                        goodPercent={analysis.goodCommentsPercent}
                        badPercent={analysis.badCommentsPercent}
                      />

                      <p className="mt-4">
                        <strong>Good comments:</strong>{" "}
                        {analysis.goodCommentsPercent}%
                      </p>

                      <p>
                        <strong>Bad comments:</strong>{" "}
                        {analysis.badCommentsPercent}%
                      </p>
                    </>
                  )}
                </div>
              )}
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
