function FeatureImportancePanel({ items = [] }) {
  return (
    <div className="glass animate-fadeUp rounded-2xl p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">Model Explainability</h3>
      <p className="mb-4 text-xs text-slate-400">Top features driving risk prediction (RandomForest importance).</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.feature}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium">{item.feature}</span>
              <span>{(item.importance * 100).toFixed(2)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                style={{ width: `${Math.min(100, item.importance * 100 * 2.2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureImportancePanel;
