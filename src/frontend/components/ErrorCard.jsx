function ErrorCard({ message, onRetry }) {
  return (
    <div className="mt-6 p-6 border rounded-lg bg-red-50 text-red-700">
      <div className="flex items-start gap-4">
        <div className="text-2xl">⚠️</div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">
            Something went wrong
          </h3>

          <p className="text-sm mb-4">{message}</p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorCard;
