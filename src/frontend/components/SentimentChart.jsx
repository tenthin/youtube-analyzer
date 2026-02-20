import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function SentimentChart({ goodPercent, badPercent }) {
  const [chartType, setChartType] = useState("bar");

  const data = [
    { name: "Good", value: goodPercent },
    { name: "Bad", value: badPercent },
  ];

  const COLORS = ["#16a34a", "#dc2626"];

  return (
    <div className="mt-4">
      {/* Toggle Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setChartType("bar")}
          className={`px-3 py-1 rounded ${
            chartType === "bar"
              ? "bg-black text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Bar
        </button>

        <button
          onClick={() => setChartType("pie")}
          className={`px-3 py-1 rounded ${
            chartType === "pie"
              ? "bg-black text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Pie
        </button>
      </div>

      {/* Chart Area */}
      <div className="w-full h-72">
        {chartType === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === "pie" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" outerRadius={100} label>
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default SentimentChart;
