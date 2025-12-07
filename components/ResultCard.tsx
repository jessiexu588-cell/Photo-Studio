import React from 'react';
import { GenerationResult, GenerationStatus, PortraitStyle } from '../types';
import { DownloadIcon, RefreshIcon } from './Icons';

interface ResultCardProps {
  style: PortraitStyle;
  result: GenerationResult;
  onRetry: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ style, result, onRetry }) => {
  const isLoading = result.status === GenerationStatus.LOADING;
  const isSuccess = result.status === GenerationStatus.SUCCESS;
  const isError = result.status === GenerationStatus.ERROR;
  const isIdle = result.status === GenerationStatus.IDLE;

  const handleDownload = () => {
    if (result.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `portrait-${style.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="group relative w-full h-full min-h-[400px] bg-studio-800 rounded-xl overflow-hidden border border-studio-700 shadow-lg transition-all hover:border-studio-600 flex flex-col">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <h3 className="text-white font-semibold text-lg drop-shadow-md">{style.title}</h3>
        <p className="text-white/80 text-xs drop-shadow-md">{style.description}</p>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-studio-900 flex items-center justify-center overflow-hidden">
        
        {/* Idle State */}
        {isIdle && (
          <div className="text-studio-600 text-sm flex flex-col items-center gap-2">
             <div className="w-12 h-12 rounded-full border border-studio-700 bg-studio-800 flex items-center justify-center">
                <span className="text-xl opacity-30">✨</span>
             </div>
             <span>Ready to generate</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-studio-800/50 backdrop-blur-sm">
             <div className="w-16 h-16 border-4 border-studio-accent border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-studio-accent font-medium animate-pulse text-sm uppercase tracking-wide">Creating...</p>
          </div>
        )}

        {/* Success State (Image) */}
        {isSuccess && result.imageUrl && (
          <div className="relative w-full h-full">
            <img 
              src={result.imageUrl} 
              alt={style.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            {/* Download Button Overlay */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <button 
                  onClick={handleDownload}
                  className="bg-white text-black p-3 rounded-full shadow-xl hover:bg-gray-200 transition-colors"
                  title="Download Image"
               >
                 <DownloadIcon className="w-5 h-5" />
               </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="text-red-400 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
               </svg>
               Generation Failed
            </div>
            <p className="text-xs text-gray-500 mb-4 max-w-[200px]">{result.error || "Unknown error"}</p>
            <button 
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-studio-700 hover:bg-studio-600 rounded-md text-xs font-medium text-white transition-colors"
            >
              <RefreshIcon className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
