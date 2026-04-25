import { useEffect, useState } from "react";

function LivePricesPanel() {
  const [prices, setPrices] = useState([]);
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/prices");
    ws.onopen = () => setStatus("Live");
    ws.onclose = () => setStatus("Disconnected");
    ws.onerror = () => setStatus("Connection error");
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "live_prices") {
          setPrices(payload.data || []);
        }
      } catch {
        setStatus("Data parse error");
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div className="glass animate-fadeUp rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Live Market Feed</h3>
        <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">{status}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
        {prices.map((row) => (
          <div key={row.symbol} className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2">
            <p className="text-xs text-slate-400">{row.symbol}</p>
            <p className="font-semibold text-cyan-300">${row.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LivePricesPanel;
