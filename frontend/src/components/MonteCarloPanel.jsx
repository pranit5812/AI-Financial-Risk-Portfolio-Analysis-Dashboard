function MonteCarloPanel({ monteCarlo }) {
  if (!monteCarlo || monteCarlo.error) return null;
  return (
    <div className="glass animate-fadeUp rounded-2xl p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">Monte Carlo Risk</h3>
      <div className="space-y-2 text-sm text-slate-300">
        <p>Simulations: <span className="text-cyan-300">{monteCarlo.simulations}</span></p>
        <p>Expected Return: <span className="text-emerald-300">{monteCarlo.expected_return}</span></p>
        <p>VaR (95%): <span className="text-rose-300">{monteCarlo.value_at_risk_95}</span></p>
        <p>CVaR (95%): <span className="text-rose-300">{monteCarlo.conditional_var_95}</span></p>
      </div>
    </div>
  );
}

export default MonteCarloPanel;
