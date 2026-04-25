import { useState } from "react";

function ChartsGrid({ charts }) {
  const [activeChart, setActiveChart] = useState(null);
  if (!charts) return null;

  const chartItems = [
    { key: "heatmap", title: "Correlation Heatmap" },
    { key: "scatter", title: "Return vs Volatility" },
    { key: "bar", title: "Predicted Risk by Asset" },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {chartItems.map((item, idx) => (
        <div
          key={item.key}
          className="glass animate-fadeUp rounded-2xl p-4"
          style={{ animationDelay: `${idx * 0.08}s` }}
        >
          <h4 className="mb-3 text-sm font-semibold text-slate-200">{item.title}</h4>
          <div className="rounded-xl bg-white p-2">
            <button
              type="button"
              onClick={() =>
                setActiveChart({
                  title: item.title,
                  src: `http://127.0.0.1:8000/${charts[item.key]}`,
                })
              }
              className="w-full"
            >
              <img
                src={`http://127.0.0.1:8000/${charts[item.key]}`}
                alt={item.title}
                className="h-72 w-full rounded-lg object-contain transition hover:scale-[1.01]"
              />
            </button>
          </div>
        </div>
      ))}
      {activeChart ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
          <div className="max-h-[95vh] w-full max-w-6xl rounded-xl bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-100">{activeChart.title}</h4>
              <button
                type="button"
                onClick={() => setActiveChart(null)}
                className="rounded-md bg-slate-700 px-3 py-1 text-sm text-slate-100"
              >
                Close
              </button>
            </div>
            <div className="rounded-lg bg-white p-3">
              <img src={activeChart.src} alt={activeChart.title} className="max-h-[80vh] w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ChartsGrid;
