import { useState } from "react";

const chartItems = [
  { key: "heatmap", title: "Correlation Heatmap" },
  { key: "scatter", title: "Return vs Volatility" },
  { key: "bar", title: "Predicted Risk by Asset" },
];

function getRiskLabel(score) {
  if (score >= 70) return "High risk portfolio with elevated volatility and concentration.";
  if (score >= 40) return "Moderate risk profile with balanced diversification and some potential stress points.";
  return "Lower risk portfolio with stable exposure and cautious volatility.";
}

export function buildReportHtml(data, chartUrls) {
  const reviewPoints = data.insights?.slice(0, 4) || [];
  const summary = getRiskLabel(data.portfolio_risk_score);
  const assetCount = data.assets?.length ?? 0;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Portfolio Analysis Report</title>
        <style>
          body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #050816; color: #e2e8f0; }
          .page { max-width: 1000px; margin: 0 auto; padding: 24px; }
          h1, h2, h3 { margin: 0 0 12px; color: #f8fafc; }
          p, li { margin: 0 0 12px; line-height: 1.7; color: #cbd5e1; }
          .hero { background: rgba(15, 23, 42, 0.95); border-radius: 24px; padding: 24px; margin-bottom: 28px; box-shadow: 0 30px 60px rgba(0,0,0,0.3); }
          .note { background: rgba(30, 41, 59, 0.95); border-left: 4px solid #38bdf8; border-radius: 16px; padding: 18px; margin-top: 16px; }
          .charts { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-top: 24px; }
          .chart-card { border-radius: 20px; overflow: hidden; background: #0f172a; box-shadow: 0 24px 60px rgba(0,0,0,0.35); }
          .chart-card img { width: 100%; display: block; }
          .chart-card h3 { padding: 14px 16px; font-size: 1rem; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="page">
          <section class="hero">
            <h1>Portfolio Analysis Report</h1>
            <p>Visual summary of the current portfolio performance, risk profile, and asset correlation behavior.</p>
            <div class="note">
              <h2>Overall Review</h2>
              <p>${summary}</p>
              <p><strong>Portfolio risk score:</strong> ${data.portfolio_risk_score?.toFixed?.(2) ?? data.portfolio_risk_score}</p>
              <p><strong>Assets analyzed:</strong> ${assetCount}</p>
            </div>
          </section>

          <section>
            <h2>Key Insights</h2>
            <ul>
              ${reviewPoints.map((point) => `<li>${point}</li>`).join("")}
            </ul>
          </section>

          <section class="charts">
            ${chartItems
              .map(
                (item, idx) => `
                  <div class="chart-card">
                    <img src="${chartUrls[idx]}" alt="${item.title}" />
                    <h3>${item.title}</h3>
                  </div>
                `
              )
              .join("")}
          </section>
        </div>
      </body>
    </html>
  `;
}

function ExportButton({ data, filename = "portfolio-report.html" }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const chartUrls = chartItems.map(
        (item) => `http://127.0.0.1:8000/${data.charts[item.key]}`
      );

      const reportHtml = buildReportHtml(data, chartUrls);
      const blob = new Blob([reportHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data || isExporting}
      className="group relative flex items-center gap-2 rounded-lg bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-slate-700/50 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
      title="Export analysis data"
    >
      <svg
        className={`h-4 w-4 transition-transform duration-300 ${isExporting ? 'animate-bounce' : 'group-hover:scale-110'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className={isExporting ? 'animate-pulse' : ''}>
        {isExporting ? 'Exporting...' : 'Export'}
      </span>

      {/* Success checkmark animation */}
      {isExporting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-4 w-4 text-emerald-400 animate-ping" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

export default ExportButton;