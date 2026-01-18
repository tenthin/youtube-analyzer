import { useState } from "react";

function Analyze() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleSubmit(e) {
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

    setTimeout(() => {
      setLoading(false);
      setResult(`Analysis completed for: ${url}`);
    }, 1500);
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

      {result && (
        <div className="mt-6 p-4 border rounded">
          <h3 className="font-semibold mb-2">Analysis Result</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}

export default Analyze;
