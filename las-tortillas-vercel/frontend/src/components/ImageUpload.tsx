import React from 'react';

interface ImageUploadProps {
  onImageUpload?: (file: File) => void;
  className?: string;
}

export default function ImageUpload({ onImageUpload, className }: ImageUploadProps) {
  return (
    <div className={className}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onImageUpload) {
            onImageUpload(file);
          }
        }}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
      >
        Upload Imagem
      </label>
    </div>
  );
} 