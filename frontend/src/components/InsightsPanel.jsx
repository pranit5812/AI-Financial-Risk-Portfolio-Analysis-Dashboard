function InsightsPanel({ insights = [] }) {
  return (
    <div className="glass animate-fadeUp rounded-2xl p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">AI Insights</h3>
      <ul className="space-y-3">
        {insights.map((insight) => (
          <li key={insight} className="flex items-start gap-3 text-sm text-slate-200">
            <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InsightsPanel;
