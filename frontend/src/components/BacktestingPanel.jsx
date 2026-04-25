function BacktestingPanel({ backtesting }) {
  if (!backtesting || backtesting.error) return null;
  const momentum = backtesting.strategies?.momentum;
  const benchmark = backtesting.benchmark?.proxy_sp500_equal_market;

  return (
    <div className="glass animate-fadeUp rounded-2xl p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">Backtesting Snapshot</h3>
      <div className="space-y-2 text-sm">
        <p className="text-slate-300">Momentum Sharpe: <span className="text-cyan-300">{momentum?.sharpe_ratio}</span></p>
        <p className="text-slate-300">Momentum Sortino: <span className="text-cyan-300">{momentum?.sortino_ratio}</span></p>
        <p className="text-slate-300">Max Drawdown: <span className="text-rose-300">{momentum?.max_drawdown}</span></p>
        <p className="text-slate-300">Benchmark Return: <span className="text-amber-300">{benchmark?.cumulative_return}</span></p>
      </div>
    </div>
  );
}

export default BacktestingPanel;
