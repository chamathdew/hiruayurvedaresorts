import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const { id, message, type } = toast;
  
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-[#E89102]" />
  };

  const bgClasses = {
    success: 'bg-green-50 border-green-200 dark:bg-slate-900/90 dark:border-green-900/50',
    error: 'bg-red-50 border-red-200 dark:bg-slate-900/90 dark:border-red-900/50',
    info: 'bg-orange-50 border-orange-200 dark:bg-slate-900/90 dark:border-orange-900/50'
  };

  return (
    <div 
      className={`
        pointer-events-auto
        flex items-center p-4 rounded-xl shadow-2xl border backdrop-blur-xl
        animate-in slide-in-from-right-full duration-300
        ${bgClasses[type]}
        min-w-[300px] max-w-[400px]
      `}
    >
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {message}
        </p>
      </div>
      <button 
        onClick={() => onRemove(id)}
        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
