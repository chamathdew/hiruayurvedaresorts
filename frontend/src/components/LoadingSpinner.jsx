import React from 'react';
import { useTheme } from '../context/ThemeContext';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="relative">
        {/* Outer Glow */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse ${isDark ? 'bg-orange-400' : 'bg-orange-600'}`}></div>
        
        {/* Main Spinner */}
        <div 
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            border-transparent 
            border-t-[#E89102] 
            animate-spin 
            relative 
            z-10
          `}
          style={{ borderTopColor: '#E89102' }}
        >
        </div>
        
        {/* Inner Static Ring for track effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-slate-200/20 z-0`}></div>
      </div>
      
      {message && (
        <p className={`text-sm font-medium animate-pulse ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
