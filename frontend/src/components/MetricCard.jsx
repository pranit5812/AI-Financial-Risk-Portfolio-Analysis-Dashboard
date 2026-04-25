import AnimatedCounter from "./AnimatedCounter";

function MetricCard({ title, value, subtitle, accent = "from-blue-500 to-cyan-400" }) {
  const isNumeric = typeof value === 'number' || (typeof value === 'string' && !isNaN(parseFloat(value)));

  return (
    <div className="glass animate-fadeUp rounded-2xl p-5 transition duration-300 hover:scale-[1.01] hover:border-slate-400/40 hover:shadow-lg hover:shadow-cyan-500/10">
      <p className="text-sm text-slate-300">{title}</p>
      <div className={`mt-2 bg-gradient-to-r ${accent} bg-clip-text text-3xl font-bold text-transparent`}>
        {isNumeric ? <AnimatedCounter value={value} /> : value}
      </div>
      {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
    </div>
  );
}

export default MetricCard;
