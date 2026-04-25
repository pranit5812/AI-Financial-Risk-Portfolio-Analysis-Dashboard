function OptimizationPanel({ optimization }) {
  if (!optimization || optimization.error) return null;
  const markowitz = optimization.strategies?.markowitz_max_sharpe;
  const topChanges = optimization.rebalancing_recommendation?.top_changes || [];

  return (
    <div className="glass animate-fadeUp rounded-2xl p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">Portfolio Optimization</h3>
      <p className="text-sm text-slate-300">
        Markowitz Sharpe: <span className="font-semibold text-cyan-300">{markowitz?.sharpe?.toFixed?.(4) ?? markowitz?.sharpe}</span>
      </p>
      <p className="mt-1 text-xs text-slate-400">
        Est. transaction cost: {optimization.rebalancing_recommendation?.estimated_transaction_cost}
      </p>
      <div className="mt-4 space-y-2">
        {topChanges.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between rounded-lg bg-slate-900/45 px-3 py-2 text-sm">
            <span className="text-slate-300">{item.symbol}</span>
            <span className={item.delta_weight >= 0 ? "text-emerald-300" : "text-rose-300"}>
              {item.delta_weight >= 0 ? "+" : ""}
              {item.delta_weight}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OptimizationPanel;
