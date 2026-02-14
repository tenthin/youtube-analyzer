function SkeletonResult() {
  return (
    <div className="mt-6 p-4 border rounded bg-white animate-pulse space-y-4">
      <div className="h-6 w-3/4 bg-gray-300 rounded"></div>

      <div className="space-y-2">
        <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
      </div>

      <div className="h-40 bg-gray-200 rounded"></div>

      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-300 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}
export default SkeletonResult;
