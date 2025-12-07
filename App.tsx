import React, { useState, useCallback } from 'react';
import { PORTRAIT_STYLES } from './constants';
import { generatePortrait } from './services/geminiService';
import { FileData, GenerationResult, GenerationStatus } from './types';
import { ResultCard } from './components/ResultCard';
import { UploadIcon, PhotoIcon } from './components/Icons';

// Helper to initialize empty results
const createInitialResults = () => 
  PORTRAIT_STYLES.map(style => ({
    styleId: style.id,
    status: GenerationStatus.IDLE
  }));

export default function App() {
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);
  const [results, setResults] = useState<GenerationResult[]>(createInitialResults());
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle File Input
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedFile({
        base64: base64,
        mimeType: file.type
      });
      // Reset previous results when new image is uploaded
      setResults(createInitialResults());
    };
    reader.readAsDataURL(file);
  };

  // Trigger generation for a specific style
  const triggerGeneration = useCallback(async (styleId: string) => {
    if (!uploadedFile) return;

    const style = PORTRAIT_STYLES.find(s => s.id === styleId);
    if (!style) return;

    // Update state to LOADING
    setResults(prev => prev.map(r => 
      r.styleId === styleId ? { ...r, status: GenerationStatus.LOADING, error: undefined } : r
    ));

    try {
      const generatedImageBase64 = await generatePortrait(
        uploadedFile.base64,
        uploadedFile.mimeType,
        style.prompt
      );

      // Update state to SUCCESS
      setResults(prev => prev.map(r => 
        r.styleId === styleId ? { ...r, status: GenerationStatus.SUCCESS, imageUrl: generatedImageBase64 } : r
      ));
    } catch (err: any) {
      // Update state to ERROR
      setResults(prev => prev.map(r => 
        r.styleId === styleId ? { ...r, status: GenerationStatus.ERROR, error: err.message } : r
      ));
    }
  }, [uploadedFile]);

  // Trigger all generations
  const handleGenerateAll = async () => {
    if (!uploadedFile || isProcessing) return;

    setIsProcessing(true);
    
    // We launch them effectively in parallel by not awaiting inside the loop sequentially
    // But we avoid blocking the UI.
    const promises = PORTRAIT_STYLES.map(style => triggerGeneration(style.id));
    
    await Promise.allSettled(promises);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-studio-900 text-gray-200 selection:bg-studio-accent selection:text-white pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-studio-900/80 backdrop-blur-md border-b border-studio-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-studio-accent to-blue-600 flex items-center justify-center shadow-lg shadow-studio-accent/20">
              <PhotoIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">AI Portrait Studio</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-xs text-studio-600 font-mono">
            <span>POWERED BY GEMINI NANO BANANA</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Upload Section */}
        <section className="max-w-3xl mx-auto">
           <div className="text-center mb-8">
             <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Transform your selfie into professional art.</h2>
             <p className="text-gray-400 text-lg">Upload one photo. Get six unique, high-end studio styles instantly.</p>
           </div>

           <div className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden
             ${uploadedFile ? 'border-studio-600 bg-studio-800' : 'border-studio-700 hover:border-studio-500 hover:bg-studio-800/50 bg-studio-800/30'}`}>
             
             <input 
               type="file" 
               accept="image/*" 
               onChange={handleFileUpload}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
             />

             <div className="p-12 flex flex-col items-center justify-center min-h-[300px] text-center">
               {uploadedFile ? (
                 <div className="relative w-full max-w-xs mx-auto aspect-[3/4] rounded-lg overflow-hidden shadow-2xl ring-4 ring-studio-900">
                   <img src={uploadedFile.base64} alt="Original" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium flex items-center gap-2">
                        <UploadIcon className="w-5 h-5" /> Change Photo
                      </p>
                   </div>
                 </div>
               ) : (
                 <>
                   <div className="w-20 h-20 rounded-full bg-studio-800 border border-studio-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                     <UploadIcon className="w-10 h-10 text-studio-400 group-hover:text-white transition-colors" />
                   </div>
                   <h3 className="text-xl font-semibold text-white mb-2">Drop your photo here</h3>
                   <p className="text-gray-500 max-w-sm mx-auto text-sm">Supports JPG, PNG. For best results, use a well-lit photo looking directly at the camera.</p>
                 </>
               )}
             </div>
           </div>

           {/* Action Bar */}
           {uploadedFile && (
             <div className="mt-8 flex justify-center">
               <button
                 onClick={handleGenerateAll}
                 disabled={isProcessing}
                 className={`
                    relative px-8 py-4 rounded-full font-bold text-white text-lg tracking-wide shadow-lg shadow-studio-accent/25
                    transition-all duration-300 transform hover:-translate-y-1 active:scale-95
                    ${isProcessing ? 'bg-studio-700 cursor-not-allowed opacity-80' : 'bg-gradient-to-r from-studio-accent to-blue-600 hover:shadow-studio-accent/40'}
                 `}
               >
                 {isProcessing ? (
                   <span className="flex items-center gap-3">
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                     Generating Studio Magic...
                   </span>
                 ) : (
                   "Generate 6 Styles"
                 )}
               </button>
             </div>
           )}
        </section>

        {/* Results Grid */}
        {uploadedFile && (
          <section id="results" className="scroll-mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {PORTRAIT_STYLES.map((style) => {
                const result = results.find(r => r.styleId === style.id)!;
                return (
                  <div key={style.id} className="w-full aspect-[3/4]">
                    <ResultCard 
                      style={style} 
                      result={result} 
                      onRetry={() => triggerGeneration(style.id)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
