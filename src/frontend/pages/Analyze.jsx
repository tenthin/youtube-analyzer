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
    <div className="">
      {/* HERO PAGE */}
      <div className="mx-auto bg-red-600 px-4 py-12 text-center sm:px-6 sm:py-16">
        <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl md:text-7xl">YouTube Analyzer</h1>
        <p className="mx-auto max-w-xl text-base text-white text-sm sm:text-xl">
          Instantly analyze any YouTube video or channel using AI.{" "}
          Get summaries, sentiment insights, and a smart recommendation.
        </p>
      </div>
      {/* SEARCH */}
      <div className="mx-4 rounded-xl bg-white p-4 shadow-md sm:mx-6 sm:p-6 lg:mx-auto lg:max-w-5xl mt-5">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center gap-3 text-center sm:flex-row "
        >
          <input
            type="text"
            placeholder="Enter the URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full min-w-0 rounded-lg border p-3"
          />
          <button
            className="w-full cursor-pointer rounded-lg bg-black px-6 py-3 text-white transition duration-200 hover:bg-red-800 sm:w-auto"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {/* Suggestion */}
        <div className="text-sm text-gray-500 mt-2 text-center ">
          Try:
          <button
            onClick={() =>
              setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
            }
            className="ml-2 underline hover:text-black"
          >
            Sample Video
          </button>
          |
          <button
            onClick={() => setUrl("https://www.youtube.com/@MrBeast")}
            className="ml-2 underline hover:text-black"
          >
            Sample Channel
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-5 lg:p-6 flex gap-5 flex-col lg:flex-row ">
        <div className="w-full xl:w-2/3">
          {loading && <SkeletonResult />}

          {!loading && error && (
            <ErrorCard
              message={error}
              onRetry={() => activeURL && analyze(activeURL)}
            />
          )}
          {!loading && !error && !result && (
            <div className="rounded-lg bg-white p-3 shadow-sm sm:p-5 lg:p-6">
              <h3 className="text-lg font-semibold mb-2">Ready to analyze?</h3>
              <p className="text-gray-600">
                Paste a YouTube video or channel link above to get started.
              </p>
            </div>
          )}
          {!loading && !error && type === "channel" && channel && analysis && (
            <div className="p-7 bg-white shadow-sm rounded-lg">
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
            <div className="p-7 rounded-lg bg-white shadow-sm">
              <div className="flex flex-wrap gap-3 mb-4">
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
                <div className=" x-4 bg-gray-50 rounded">
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
        <div className="w-full rounded-xl bg-white shadow-sm xl:w-1/3">
          <HistoryPanel
            history={history}
            onSelect={handleHistorySelect}
            onRemove={removeFromHistory}
            onClear={clearHistory}
            activeURL={activeURL}
          />
        </div>
      </div>
    </div>
  );
}

export default Analyze;
