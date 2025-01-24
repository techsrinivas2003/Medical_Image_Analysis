import React, { useRef, useEffect, useState } from 'react';
import { Annotation } from '../types';

interface CanvasProps {
  imageUrl: string;
  annotations: Annotation[];
  currentTool: string;
  onAnnotationAdd: (annotation: Annotation) => void;
  pixelsPerUnit: number;
  unit: string;
}

export default function Canvas({ 
  imageUrl, 
  annotations, 
  currentTool, 
  onAnnotationAdd,
  pixelsPerUnit,
  unit 
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [measurementInfo, setMeasurementInfo] = useState<string>('');

  const formatMeasurement = (value: number): string => {
    if (!pixelsPerUnit) return `${value.toFixed(1)}px`;
    const realValue = value / pixelsPerUnit;
    return `${realValue.toFixed(1)}${unit}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      drawAnnotations();
    };
  }, [imageUrl, annotations, pixelsPerUnit, unit]);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const calculateAngle = (center: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    const angle1 = Math.atan2(p1.y - center.y, p1.x - center.x);
    const angle2 = Math.atan2(p2.y - center.y, p2.x - center.x);
    let angle = (angle2 - angle1) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  };

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const image = new Image();
    image.src = imageUrl;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    annotations.forEach((annotation, index) => {
      ctx.strokeStyle = '#FF3B30';
      ctx.fillStyle = '#FF3B30';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const numberSize = 20;
      let numberX, numberY;

      switch (annotation.type) {
        case 'circle': {
          const [centerX, centerY, radius] = annotation.coordinates;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
          ctx.fill();
          
          numberX = centerX - radius;
          numberY = centerY - radius;
          
          const text1 = `r: ${formatMeasurement(radius)}`;
          const text2 = `c: ${formatMeasurement(2 * Math.PI * radius)}`;
          
          ctx.font = 'bold 14px Inter, system-ui, sans-serif';
          const metrics1 = ctx.measureText(text1);
          const metrics2 = ctx.measureText(text2);
          
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(centerX + 5, centerY - 20, Math.max(metrics1.width, metrics2.width) + 10, 40);
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(text1, centerX + 10, centerY);
          ctx.fillText(text2, centerX + 10, centerY + 20);
          break;
        }
        case 'rectangle': {
          const [x1, y1, width, height] = annotation.coordinates;
          ctx.strokeRect(x1, y1, width, height);
          
          numberX = x1;
          numberY = y1;
          
          const text1 = `${formatMeasurement(Math.abs(width))} × ${formatMeasurement(Math.abs(height))}`;
          const area = Math.abs(width * height);
          const text2 = pixelsPerUnit 
            ? `Area: ${((area) / (pixelsPerUnit * pixelsPerUnit)).toFixed(1)}${unit}²`
            : `Area: ${area.toFixed(1)}px²`;
          
          ctx.font = 'bold 14px Inter, system-ui, sans-serif';
          const metrics1 = ctx.measureText(text1);
          const metrics2 = ctx.measureText(text2);
          
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(x1 + 5, y1 - 20, Math.max(metrics1.width, metrics2.width) + 10, 40);
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(text1, x1 + 10, y1);
          ctx.fillText(text2, x1 + 10, y1 + 20);
          break;
        }
        case 'angle': {
          const [centerX, centerY, x1, y1, x2, y2] = annotation.coordinates;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(centerX, centerY);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          numberX = centerX;
          numberY = centerY;
          
          const angle = calculateAngle(
            { x: centerX, y: centerY },
            { x: x1, y: y1 },
            { x: x2, y: y2 }
          );
          const text = `${angle.toFixed(1)}°`;
          
          ctx.font = 'bold 14px Inter, system-ui, sans-serif';
          const metrics = ctx.measureText(text);
          
          ctx.shadowColor = 'transparent';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(centerX + 10, centerY + 10, metrics.width + 10, 25);
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(text, centerX + 15, centerY + 28);
          break;
        }
        case 'measurement': {
          const [x1, y1, x2, y2] = annotation.coordinates;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          numberX = x1;
          numberY = y1;
          
          const distance = calculateDistance(x1, y1, x2, y2);
          const text = formatMeasurement(distance);
          
          ctx.font = 'bold 14px Inter, system-ui, sans-serif';
          const metrics = ctx.measureText(text);
          
          ctx.shadowColor = 'transparent';
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(midX - metrics.width/2 - 5, midY - 20, metrics.width + 10, 25);
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(text, midX - metrics.width/2, midY - 3);
          break;
        }
      }

      // Draw annotation number
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#FF3B30';
      ctx.beginPath();
      ctx.arc(numberX - 10, numberY - 10, numberSize/2, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), numberX - 10, numberY - 10);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (currentTool === 'move') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDrawing(true);
    setStartPoint({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    drawAnnotations();

    ctx.strokeStyle = '#FF3B30';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    switch (currentTool) {
      case 'circle': {
        const radius = calculateDistance(startPoint.x, startPoint.y, currentPoint.x, currentPoint.y);
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        setMeasurementInfo(`Radius: ${formatMeasurement(radius)}, Circumference: ${formatMeasurement(2 * Math.PI * radius)}`);
        break;
      }
      case 'rectangle': {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        
        const area = Math.abs(width * height);
        const areaText = pixelsPerUnit 
          ? `${((area) / (pixelsPerUnit * pixelsPerUnit)).toFixed(1)}${unit}²`
          : `${area.toFixed(1)}px²`;
        
        setMeasurementInfo(
          `Width: ${formatMeasurement(Math.abs(width))}, Height: ${formatMeasurement(Math.abs(height))}, Area: ${areaText}`
        );
        break;
      }
      case 'angle': {
        ctx.beginPath();
        ctx.moveTo(startPoint.x - 50, startPoint.y);
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
        
        const angle = calculateAngle(
          startPoint,
          { x: startPoint.x - 50, y: startPoint.y },
          currentPoint
        );
        setMeasurementInfo(`Angle: ${angle.toFixed(1)}°`);
        break;
      }
      case 'measure': {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
        
        const distance = calculateDistance(startPoint.x, startPoint.y, currentPoint.x, currentPoint.y);
        setMeasurementInfo(`Distance: ${formatMeasurement(distance)}`);
        break;
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const endPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    let newAnnotation: Annotation;
    
    switch (currentTool) {
      case 'circle': {
        const radius = calculateDistance(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        newAnnotation = {
          id: Date.now().toString(),
          type: 'circle',
          coordinates: [startPoint.x, startPoint.y, radius],
          measurements: {
            radius,
            circumference: 2 * Math.PI * radius
          }
        };
        break;
      }
      case 'rectangle': {
        const width = endPoint.x - startPoint.x;
        const height = endPoint.y - startPoint.y;
        newAnnotation = {
          id: Date.now().toString(),
          type: 'rectangle',
          coordinates: [startPoint.x, startPoint.y, width, height],
          measurements: {
            width: Math.abs(width),
            height: Math.abs(height)
          }
        };
        break;
      }
      case 'angle': {
        newAnnotation = {
          id: Date.now().toString(),
          type: 'angle',
          coordinates: [
            startPoint.x,
            startPoint.y,
            startPoint.x - 50,
            startPoint.y,
            endPoint.x,
            endPoint.y
          ],
          measurements: {
            angle: calculateAngle(
              startPoint,
              { x: startPoint.x - 50, y: startPoint.y },
              endPoint
            )
          }
        };
        break;
      }
      case 'measure': {
        const distance = calculateDistance(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        newAnnotation = {
          id: Date.now().toString(),
          type: 'measurement',
          coordinates: [startPoint.x, startPoint.y, endPoint.x, endPoint.y],
          measurements: {
            distance
          }
        };
        break;
      }
      default:
        return;
    }

    onAnnotationAdd(newAnnotation);
    setIsDrawing(false);
    setStartPoint(null);
    setMeasurementInfo('');
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded-lg cursor-crosshair shadow-inner bg-gray-50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {measurementInfo && (
        <div className="absolute top-4 right-4 bg-black text-white px-4 py-2 rounded-lg shadow-lg font-medium">
          {measurementInfo}
        </div>
      )}
    </div>
  );
}