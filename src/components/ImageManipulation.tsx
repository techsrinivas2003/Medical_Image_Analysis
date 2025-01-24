import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, Move, Sun, Contrast, 
  Crop, RotateCcw, RotateCw, FlipHorizontal, FlipVertical 
} from 'lucide-react';

interface ImageManipulationProps {
  imageUrl: string;
  onImageChange: (manipulatedImageUrl: string) => void;
}

export default function ImageManipulation({ imageUrl, onImageChange }: ImageManipulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const applyImageManipulations = useCallback((ctx: CanvasRenderingContext2D, image: HTMLImageElement) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(
      flip.horizontal ? -1 : 1,
      flip.vertical ? -1 : 1
    );
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    // Apply zoom and pan
    ctx.translate(offset.x, offset.y);
    ctx.scale(zoom, zoom);
    
    // Draw image
    ctx.drawImage(image, 0, 0);
    
    // Create off-screen canvas for brightness/contrast
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    
    if (offscreenCtx) {
      offscreenCtx.drawImage(canvas, 0, 0);
      const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const brightnessOffset = (brightness - 100) * 2.55;
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      
      // Use lookup tables for better performance
      const brightnessLUT = new Uint8Array(256);
      const contrastLUT = new Uint8Array(256);
      
      for (let i = 0; i < 256; i++) {
        brightnessLUT[i] = truncateColor(i + brightnessOffset);
        contrastLUT[i] = truncateColor(contrastFactor * (i - 128) + 128);
      }
      
      // Process image data using lookup tables
      for (let i = 0; i < data.length; i += 4) {
        data[i] = contrastLUT[brightnessLUT[data[i]]];
        data[i + 1] = contrastLUT[brightnessLUT[data[i + 1]]];
        data[i + 2] = contrastLUT[brightnessLUT[data[i + 2]]];
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    // Restore context state
    ctx.restore();
    
    // Update parent component with new image data
    if (!isDragging) {
      onImageChange(canvas.toDataURL());
    }
  }, [brightness, contrast, zoom, offset, rotation, flip, isDragging, onImageChange]);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && imageRef.current) {
        applyImageManipulations(ctx, imageRef.current);
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [applyImageManipulations]);

  useEffect(() => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = image.width;
      canvas.height = image.height;
      imageRef.current = image;
      
      requestRef.current = requestAnimationFrame(animate);
    };

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [imageUrl, animate]);

  const truncateColor = (value: number): number => {
    if (value < 0) return 0;
    if (value > 255) return 255;
    return value;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrightness(Number(e.target.value));
  };

  const handleContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContrast(Number(e.target.value));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.1, 3))}
          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-blue-600" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.1, 0.1))}
          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-blue-600" />
        </button>
        <button
          onClick={() => setRotation(r => (r + 90) % 360)}
          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          title="Rotate Clockwise"
        >
          <RotateCw className="w-5 h-5 text-blue-600" />
        </button>
        <button
          onClick={() => setRotation(r => (r - 90) % 360)}
          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          title="Rotate Counter-clockwise"
        >
          <RotateCcw className="w-5 h-5 text-blue-600" />
        </button>
        <button
          onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}
          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          title="Flip Horizontal"
        >
          <FlipHorizontal className="w-5 h-5 text-blue-600" />
        </button>
        <button
          onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}
          className="p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          title="Flip Vertical"
        >
          <FlipVertical className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Brightness</span>
          <input
            type="range"
            min="0"
            max="200"
            value={brightness}
            onChange={handleBrightnessChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-slate-600 w-8">{brightness}%</span>
        </div>

        <div className="flex items-center gap-2">
          <Contrast className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Contrast</span>
          <input
            type="range"
            min="0"
            max="200"
            value={contrast}
            onChange={handleContrastChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-slate-600 w-8">{contrast}%</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-gray-200">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="max-w-full cursor-move"
        />
      </div>
    </div>
  );
}