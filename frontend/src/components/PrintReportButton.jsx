import { useState } from "react";
import { buildReportHtml } from "./ExportButton";

function PrintReportButton({ data }) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    if (!data) return;
    setIsPrinting(true);

    try {
      const reportHtml = buildReportHtml(data, [
        `http://127.0.0.1:8000/${data.charts.heatmap}`,
        `http://127.0.0.1:8000/${data.charts.scatter}`,
        `http://127.0.0.1:8000/${data.charts.bar}`,
      ]);

      const reportWindow = window.open("", "_blank", "toolbar=0,location=0,menubar=0");
      if (!reportWindow) {
        console.error("Unable to open print window");
        return;
      }

      reportWindow.document.write(reportHtml);
      reportWindow.document.close();
      reportWindow.focus();
      reportWindow.onload = () => {
        reportWindow.print();
        setIsPrinting(false);
      };
    } catch (error) {
      console.error("Print failed:", error);
      setIsPrinting(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={!data || isPrinting}
      className="group rounded-xl bg-slate-800/60 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700/70 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      title="Open report in print view"
    >
      {isPrinting ? "Preparing print..." : "Print Report"}
    </button>
  );
}

export default PrintReportButton;
