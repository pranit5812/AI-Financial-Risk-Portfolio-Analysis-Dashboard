function LoadingSpinner({ size = "md", message = "Loading..." }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-slate-600"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse"></div>
      </div>
      {message && <p className="text-sm text-slate-400 animate-pulse">{message}</p>}
    </div>
  );
}

function ProgressBar({ progress, showPercentage = true }) {
  return (
    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ease-out rounded-full"
        style={{ width: `${Math.min(progress, 100)}%` }}
      >
        <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      </div>
      {showPercentage && (
        <div className="text-center mt-2 text-xs text-slate-400">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

function LoadingOverlay({ isVisible, progress, message }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800/90 rounded-2xl p-8 shadow-2xl border border-slate-700/50 max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" message={message} />
          {progress !== undefined && <ProgressBar progress={progress} />}
        </div>
      </div>
    </div>
  );
}

export { LoadingSpinner, ProgressBar, LoadingOverlay };