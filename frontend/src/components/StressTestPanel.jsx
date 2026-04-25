function deltaTone(delta) {
  if (delta > 0) return "text-rose-300";
  if (delta < 0) return "text-emerald-300";
  return "text-slate-300";
}

function StressTestPanel({ scenarios = [] }) {
  return (
    <div className="glass animate-fadeUp rounded-2xl p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">Stress Test Scenarios</h3>
      <div className="space-y-3">
        {scenarios.map((scenario) => (
          <div
            key={scenario.scenario}
            className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-200">{scenario.scenario}</p>
              <p className="text-sm text-cyan-300">{scenario.risk_score.toFixed(2)} / 100</p>
            </div>
            <p className={`mt-1 text-xs ${deltaTone(scenario.change_from_base)}`}>
              Change vs Base: {scenario.change_from_base > 0 ? "+" : ""}
              {scenario.change_from_base.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StressTestPanel;
