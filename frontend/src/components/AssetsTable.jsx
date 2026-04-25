function riskBadgeColor(cluster) {
  if (cluster === "High Risk") return "bg-rose-500/20 text-rose-300 border-rose-400/30";
  if (cluster === "Medium Risk") return "bg-amber-500/20 text-amber-300 border-amber-400/30";
  return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
}

function AssetsTable({ assets = [] }) {
  return (
    <div className="glass animate-fadeUp overflow-hidden rounded-2xl">
      <div className="border-b border-slate-700/60 px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-100">Asset Risk Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/35 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">Symbol</th>
              <th className="px-5 py-3">Predicted Risk</th>
              <th className="px-5 py-3">Risk Category</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {assets.map((asset) => (
              <tr key={asset.symbol} className="border-t border-slate-700/40 hover:bg-slate-800/25">
                <td className="px-5 py-3 font-semibold text-cyan-300">{asset.symbol}</td>
                <td className="px-5 py-3 text-slate-200">{asset.predicted_risk.toFixed(4)}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full border px-3 py-1 text-xs ${riskBadgeColor(asset.cluster)}`}>
                    {asset.cluster}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetsTable;
