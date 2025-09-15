import React, { useRef, useEffect } from 'react';

interface PixelatedImageProps {
  src: string;
  alt: string;
  pixelSize: number;
  className?: string;
  onError?: () => void;
}

export const PixelatedImage: React.FC<PixelatedImageProps> = ({ 
  src, 
  alt, 
  pixelSize, 
  className = '',
  onError
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
      // Check if image is in broken state or failed to load
      if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
        console.error('Image is in broken state or failed to load:', src);
        onError?.();
        return;
      }

      try {
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
        
        // Draw image small first - wrapped in try-catch to handle broken images
        ctx.drawImage(image, offsetX, offsetY, pixelatedWidth, pixelatedHeight);
        
        // Scale it back up to create pixelation
        ctx.drawImage(
          canvas,
          offsetX, offsetY, pixelatedWidth, pixelatedHeight,
          offsetX, offsetY, drawWidth, drawHeight
        );
      } catch (error) {
        console.error('Error drawing image to canvas:', error, 'Image src:', src);
        onError?.();
      }
    };

    // Set up error handler first
    image.onerror = () => {
      console.error('Failed to load image (404 or network error):', src);
      onError?.();
    };

    if (image.complete) {
      // Image is already loaded, but check if it's broken
      pixelate();
    } else {
      // Image is still loading
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
        className="w-full h-full object-contain rounded-2xl transition-all duration-500 ease-in-out"
      />
    </div>
  );
};