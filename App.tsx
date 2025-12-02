import React, { useState, useRef, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { LoadingOverlay } from './components/LoadingOverlay';
import { UploadedImage, GenerationStatus } from './types';
import { generateTryOn, editGeneratedImage } from './services/geminiService';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<UploadedImage | null>(null);
  const [clothImage, setClothImage] = useState<UploadedImage | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('');
  
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!personImage || !clothImage) return;

    setStatus(GenerationStatus.LOADING);
    setError(null);
    setResultImage(null);

    try {
      const generatedImage = await generateTryOn(
        personImage.base64,
        personImage.mimeType,
        clothImage.base64,
        clothImage.mimeType
      );
      
      setResultImage(generatedImage);
      setStatus(GenerationStatus.SUCCESS);
      
      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao gerar a imagem.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleEdit = async () => {
    if (!resultImage || !editPrompt.trim()) return;

    const previousImage = resultImage;
    setStatus(GenerationStatus.LOADING);
    
    try {
      const editedImage = await editGeneratedImage(previousImage, editPrompt);
      setResultImage(editedImage);
      setStatus(GenerationStatus.SUCCESS);
      setEditPrompt('');
    } catch (err: any) {
      setError("Falha ao editar a imagem. Tente novamente com um prompt diferente.");
      setStatus(GenerationStatus.ERROR);
      // Revert if failed (optional strategy, but safer for UX)
      setResultImage(previousImage);
    }
  };

  const isReadyToGenerate = personImage !== null && clothImage !== null && status !== GenerationStatus.LOADING;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-primary-500/30 selection:text-primary-200">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-primary-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-primary-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                NanoStyle
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="hidden sm:block">Powered by Gemini 2.5 Flash</span>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Provador Virtual <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Inteligente</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Experimente roupas sem sair de casa. Envie uma foto sua, uma foto da peça e deixe a IA fazer a mágica.
          </p>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">
          {/* Connector Icon (Desktop only) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-gray-900 rounded-full p-2 border border-gray-700 shadow-xl">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0l-4-4m4 4l4-4" className="hidden md:block" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16m0 0l-4-4m4 4l-4 4" className="md:hidden" />
            </svg>
          </div>

          <div className="space-y-4">
            <ImageUploader 
              id="upload-person"
              label="1. Sua Foto" 
              image={personImage} 
              onImageSelected={setPersonImage} 
              onClear={() => setPersonImage(null)} 
            />
            <p className="text-xs text-center text-gray-500">
              Para melhores resultados, use uma foto de corpo inteiro com boa iluminação.
            </p>
          </div>

          <div className="space-y-4">
            <ImageUploader 
              id="upload-cloth"
              label="2. A Roupa" 
              image={clothImage} 
              onImageSelected={setClothImage} 
              onClear={() => setClothImage(null)} 
            />
             <p className="text-xs text-center text-gray-500">
              A imagem da roupa deve ser clara, preferencialmente com fundo simples.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!isReadyToGenerate}
            className={`
              relative overflow-hidden group px-12 py-4 rounded-full font-bold text-lg shadow-2xl transition-all duration-300
              ${isReadyToGenerate 
                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:scale-105 hover:shadow-primary-500/25' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
              {status === GenerationStatus.LOADING ? 'Processando...' : 'Experimentar Agora'}
              {!isReadyToGenerate && status !== GenerationStatus.LOADING && (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              {isReadyToGenerate && (
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </span>
            {isReadyToGenerate && (
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-indigo-600 to-primary-600 transition-transform duration-500 ease-out"></div>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center max-w-2xl mx-auto flex items-center justify-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Result Section */}
        {(resultImage || status === GenerationStatus.LOADING) && (
          <div ref={resultRef} className="mt-20 border-t border-gray-800 pt-12">
             <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">Resultado</h2>
              <p className="text-gray-400 mt-2">Veja como ficou o seu visual</p>
            </div>

            <div className="relative max-w-lg mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gray-900 ring-1 ring-white/10">
              {status === GenerationStatus.LOADING && (
                <LoadingOverlay message={resultImage ? "Aplicando edições..." : "Gerando provador virtual..."} />
              )}
              
              {resultImage && (
                <div className="group relative">
                  <img 
                    src={resultImage} 
                    alt="Resultado do Provador Virtual" 
                    className="w-full h-auto"
                  />
                  
                  {/* Download Button */}
                  <a 
                    href={resultImage} 
                    download="nanostyle-provador.png"
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    title="Baixar imagem"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              )}
            </div>

            {/* Post-Generation Editing (Nano Banana Feature) */}
            {resultImage && status !== GenerationStatus.LOADING && (
              <div className="max-w-xl mx-auto mt-8 bg-gray-900/50 p-6 rounded-2xl border border-white/5">
                <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                  Não gostou de algum detalhe? Edite com IA:
                </label>
                <div className="flex gap-2">
                  <input
                    id="edit-prompt"
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Ex: Adicionar um filtro retrô, mudar o fundo para uma praia..."
                    className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                  />
                  <button
                    onClick={handleEdit}
                    disabled={!editPrompt.trim()}
                    className="bg-gray-800 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 hover:border-primary-500"
                  >
                    Editar
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Sugestões:</span>
                  {['Fundo de estúdio', 'Adicionar óculos escuros', 'Estilo vintage', 'Iluminação cinematográfica'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setEditPrompt(suggestion)}
                      className="text-xs bg-gray-800/80 hover:bg-gray-700 text-primary-300 px-3 py-1 rounded-full border border-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-900 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} NanoStyle. Powered by Google Gemini API.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
