import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function RiskTrendChart({ assets = [] }) {
  const chartData = assets
    .map((a) => ({ symbol: a.symbol, risk: Number(a.predicted_risk.toFixed(4)) }))
    .sort((a, b) => b.risk - a.risk);

  return (
    <div className="glass animate-fadeUp rounded-2xl p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">Interactive Risk Trend</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.85} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="symbol" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                color: "#e2e8f0",
              }}
            />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="#38bdf8"
              strokeWidth={2.5}
              fill="url(#riskGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RiskTrendChart;
