import { useMemo, useState } from "react";

import AssetsTable from "../components/AssetsTable";
import BacktestingPanel from "../components/BacktestingPanel";
import ChartsGrid from "../components/ChartsGrid";
import FeatureImportancePanel from "../components/FeatureImportancePanel";
import InsightsPanel from "../components/InsightsPanel";
import { LoadingOverlay } from "../components/LoadingComponents";
import LivePricesPanel from "../components/LivePricesPanel";
import MetricCard from "../components/MetricCard";
import MonteCarloPanel from "../components/MonteCarloPanel";
import OptimizationPanel from "../components/OptimizationPanel";
import ParticleEffect from "../components/ParticleEffect";
import RiskTrendChart from "../components/RiskTrendChart";
import StressTestPanel from "../components/StressTestPanel";
import ThemeToggle from "../components/ThemeToggle";
import ExportButton from "../components/ExportButton";
import PrintReportButton from "../components/PrintReportButton";
import { ToastProvider, useToast } from "../components/Toast";
import { runAnalysis } from "../services/api";

function DashboardContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [showParticles, setShowParticles] = useState(false);
  const { addToast } = useToast();

  const riskTone = useMemo(() => {
    if (!analysis) return "text-slate-200";
    if (analysis.portfolio_risk_score >= 70) return "text-rose-300";
    if (analysis.portfolio_risk_score >= 40) return "text-amber-300";
    return "text-emerald-300";
  }, [analysis]);

  const onRunAnalysis = async () => {
    setLoading(true);
    setError("");
    addToast("Starting portfolio analysis...", "info");

    try {
      const result = await runAnalysis();
      setAnalysis(result);
      setShowParticles(true);
      addToast("Analysis completed successfully! 🎉", "success");

      setTimeout(() => setShowParticles(false), 3000);
    } catch (err) {
      const errorMessage = err?.response?.data?.detail || "Failed to run portfolio analysis.";
      setError(errorMessage);
      addToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-slate-700/40 bg-slate-900/40 p-8 shadow-2xl">
          <div className="absolute top-4 right-4 z-10">
            <ThemeToggle />
          </div>
          <div className="absolute -right-14 -top-10 h-44 w-44 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-indigo-500/20 blur-3xl" />
          <h1 className="animate-float text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">
            AI Financial Risk Portfolio Analyzer
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
            Train and evaluate risk models directly from your backend dataset, then visualize portfolio stability,
            correlation behavior, and diversification opportunities in one dashboard.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={onRunAnalysis}
              disabled={loading}
              className="animate-pulseGlow rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Running Analysis..." : "Run Analysis"}
            </button>
            {analysis && <ExportButton data={analysis} />}
            {analysis && <PrintReportButton data={analysis} />}
          </div>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </section>
        <LivePricesPanel />

        {analysis ? (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Portfolio Risk Score"
                value={`${analysis.portfolio_risk_score.toFixed(2)} / 100`}
                subtitle="Volume-weighted normalized volatility"
                accent="from-fuchsia-400 to-rose-400"
              />
              <MetricCard
                title="RMSE"
                value={analysis.model_metrics.rmse.toFixed(4)}
                subtitle="RandomForestRegressor error"
                accent="from-cyan-400 to-blue-400"
              />
              <MetricCard
                title="R2 Score"
                value={analysis.model_metrics.r2_score.toFixed(4)}
                subtitle="Model explanatory strength"
                accent="from-emerald-400 to-teal-400"
              />
            </section>
            <section className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="CV RMSE Mean"
                value={analysis.model_metrics.cv_rmse_mean.toFixed(4)}
                subtitle="5-fold validation error"
                accent="from-violet-400 to-indigo-400"
              />
              <MetricCard
                title="CV RMSE Std"
                value={analysis.model_metrics.cv_rmse_std.toFixed(4)}
                subtitle="Stability across folds"
                accent="from-orange-400 to-amber-400"
              />
            </section>

            <section className="glass animate-fadeUp rounded-2xl p-5">
              <p className="text-sm text-slate-300">Current portfolio health signal</p>
              <p className={`mt-1 text-2xl font-bold ${riskTone}`}>
                Score: {analysis.portfolio_risk_score.toFixed(2)}
              </p>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RiskTrendChart assets={analysis.assets} />
              </div>
              <InsightsPanel insights={analysis.insights} />
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              <StressTestPanel scenarios={analysis.stress_test || []} />
              <FeatureImportancePanel items={analysis.feature_importance || []} />
              <OptimizationPanel optimization={analysis.optimization} />
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <BacktestingPanel backtesting={analysis.backtesting} />
              <MonteCarloPanel monteCarlo={analysis.monte_carlo} />
            </section>

            <AssetsTable assets={analysis.assets} />

            <section>
              <h2 className="mb-3 text-xl font-semibold text-slate-100">Generated Analysis Charts</h2>
              <ChartsGrid charts={analysis.charts} />
            </section>
          </>
        ) : (
          <section className="glass animate-fadeUp rounded-2xl p-6 text-slate-300">
            Click <span className="font-semibold text-cyan-300">Run Analysis</span> to train the models on
            <span className="mx-1 rounded bg-slate-800 px-2 py-0.5 text-cyan-200">portfolio.csv</span> and render
            portfolio risk insights.
          </section>
        )}
      </div>
      <ParticleEffect isActive={showParticles} />
      <LoadingOverlay isVisible={loading} message="Running portfolio analysis..." />
    </main>
  );
}

function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}

export default DashboardPage;
