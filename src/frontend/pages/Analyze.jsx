import { useState } from "react";

function Analyze() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const channel = result?.channel;

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

    if (!url.includes("youtube.com")) {
      setError("Please enter a valid Youtube URL");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url, // temporary
        }),
      });

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

      {channel && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="font-semibold text-lg">{name}</h2>
          <p>{subscribers} subscribers</p>
          <p>{totalVideos} total videos</p>
        </div>
      )}
    </div>
  );
}

export default Analyze;
