import React, { useRef, useEffect } from 'react';

interface PixelatedImageProps {
  src: string;
  alt: string;
  pixelSize: number;
  className?: string;
}

export const PixelatedImage: React.FC<PixelatedImageProps> = ({ 
  src, 
  alt, 
  pixelSize, 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelate = () => {
      const { naturalWidth, naturalHeight } = image;
      
      // Set canvas size to match container
      const containerSize = 400; // Fixed size for consistency
      canvas.width = containerSize;
      canvas.height = containerSize;
      
      // Calculate scaled dimensions maintaining aspect ratio
      const aspectRatio = naturalWidth / naturalHeight;
      let drawWidth = containerSize;
      let drawHeight = containerSize;
      
      if (aspectRatio > 1) {
        drawHeight = containerSize / aspectRatio;
      } else {
        drawWidth = containerSize * aspectRatio;
      }
      
      const offsetX = (containerSize - drawWidth) / 2;
      const offsetY = (containerSize - drawHeight) / 2;
      
      // Clear canvas
      ctx.clearRect(0, 0, containerSize, containerSize);
      
      // Disable image smoothing for pixelated effect
      ctx.imageSmoothingEnabled = false;
      
      // Calculate pixelated dimensions
      const pixelatedWidth = Math.max(1, Math.floor(drawWidth / pixelSize));
      const pixelatedHeight = Math.max(1, Math.floor(drawHeight / pixelSize));
      
      // Draw image small first
      ctx.drawImage(image, offsetX, offsetY, pixelatedWidth, pixelatedHeight);
      
      // Scale it back up to create pixelation
      ctx.drawImage(
        canvas,
        offsetX, offsetY, pixelatedWidth, pixelatedHeight,
        offsetX, offsetY, drawWidth, drawHeight
      );
    };

    if (image.complete) {
      pixelate();
    } else {
      image.onload = pixelate;
    }
  }, [src, pixelSize]);

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="hidden"
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain rounded-2xl"
      />
    </div>
  );
};