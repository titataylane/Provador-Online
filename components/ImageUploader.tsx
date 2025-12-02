import React, { useRef } from 'react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  label: string;
  image: UploadedImage | null;
  onImageSelected: (image: UploadedImage) => void;
  onClear: () => void;
  id: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageSelected, onClear, id }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract base64 content only (remove data:image/xyz;base64,)
        const base64Content = result.split(',')[1];
        
        onImageSelected({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: base64Content,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (!image) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-gray-300 uppercase tracking-wider">{label}</label>
      
      <div 
        onClick={handleClick}
        className={`
          relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 h-80 w-full flex items-center justify-center
          ${image ? 'border-primary-500/50 bg-gray-900/50' : 'border-gray-600 hover:border-primary-400 hover:bg-gray-800/50 bg-gray-900'}
        `}
      >
        <input 
          type="file" 
          id={id} 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />

        {image ? (
          <>
            <img 
              src={image.previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/20"
                title="Trocar imagem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                  if(fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-full backdrop-blur-md transition-all border border-red-400/20"
                title="Remover"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-6 transition-transform duration-300 group-hover:scale-105">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center text-primary-400 group-hover:bg-primary-500/10 group-hover:text-primary-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Clique para fazer upload</p>
            <p className="text-gray-600 text-xs mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};
