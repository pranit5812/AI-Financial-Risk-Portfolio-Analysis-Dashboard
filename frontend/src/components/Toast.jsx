import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onRemove }) {
  const { id, message, type } = toast;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-emerald-500/90 border-emerald-400/50 text-emerald-100";
      case "error":
        return "bg-rose-500/90 border-rose-400/50 text-rose-100";
      case "warning":
        return "bg-amber-500/90 border-amber-400/50 text-amber-100";
      default:
        return "bg-blue-500/90 border-blue-400/50 text-blue-100";
    }
  };

  return (
    <div
      className={`animate-slideInRight flex items-center gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm ${getToastStyles()}`}
    >
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => onRemove(id)}
        className="text-current/70 hover:text-current transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}