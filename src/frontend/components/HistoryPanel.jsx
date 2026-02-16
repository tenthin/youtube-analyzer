import React from "react";

function HistoryPanel({ history, onSelect, onRemove, onClear, activeURL }) {
  return (
    <div className="flex-[0.6] mt-6 p-4 border rounded bg-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">History</h3>
        <button
          onClick={onClear}
          className="text-sm text-red-600 cursor-pointer"
        >
          Clear All
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-gray-500">No History yet</p>
      ) : (
        history.map((item) => (
          <div key={item.url} className={`group flex justify-between rounded-md py-2 px-4 m-2 ${ item.url === activeURL ? "bg-gray-300" :"hover:bg-gray-300"}`}>
              <div
              onClick={() => onSelect(item.url)}
              className="flex gap-5 items-center cursor-pointer"
              >
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="flex w-16 h-10"
                  />
                )}
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-gray-500">{item.type}</p>
              </div>
            </div>  
            <button
            onClick={() => onRemove(item.url)}
              className="cursor-pointer opacity-0 group-hover:opacity-100 transition"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default React.memo(HistoryPanel);
