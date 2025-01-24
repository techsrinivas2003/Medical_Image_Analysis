import React, { useRef, useEffect, useState } from 'react';
import { AnnotationType } from '../types';

export default function Canvas({ imageUrl, annotations, currentTool, onAnnotationAdd }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [measurementInfo, setMeasurementInfo] = useState('');

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
  }, [imageUrl, annotations]);

  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const calculateAngle = (center, p1, p2) => {
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

    // Clear and redraw image
    const image = new Image();
    image.src = imageUrl;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    // Draw all annotations
    annotations.forEach((annotation, index) => {
      // Set default styles for all annotations
      ctx.strokeStyle = '#FF3B30';
      ctx.fillStyle = '#FF3B30';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw annotation number
      const numberSize = 20;
      let numberX, numberY;

      switch (annotation.type) {
        case AnnotationType.CIRCLE: {
          const [centerX, centerY, radius] = annotation.coordinates;
          // Draw circle
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          
          // Draw center point
          ctx.beginPath();
          ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
          ctx.fill();
          
          numberX = centerX - radius;
          numberY = centerY - radius;
          
          // Draw measurements
          const text1 = `r: ${radius.toFixed(1)}px`;
          const text2 = `c: ${(2 * Math.PI * radius).toFixed(1)}px`;
          
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
        case AnnotationType.RECTANGLE: {
          const [x1, y1, width, height] = annotation.coordinates;
          ctx.strokeRect(x1, y1, width, height);
          
          numberX = x1;
          numberY = y1;
          
          const text1 = `${width.toFixed(1)}px × ${height.toFixed(1)}px`;
          const text2 = `Area: ${(width * height).toFixed(1)}px²`;
          
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
        case AnnotationType.ANGLE: {
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
        case AnnotationType.MEASUREMENT: {
          const [x1, y1, x2, y2] = annotation.coordinates;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          numberX = x1;
          numberY = y1;
          
          const distance = calculateDistance(x1, y1, x2, y2);
          const text = `${distance.toFixed(1)}px`;
          
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

  const handleMouseDown = (e) => {
    if (currentTool === 'move') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDrawing(true);
    setStartPoint({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
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
        
        setMeasurementInfo(`Radius: ${radius.toFixed(1)}px, Circumference: ${(2 * Math.PI * radius).toFixed(1)}px`);
        break;
      }
      case 'rectangle': {
        const width = currentPoint.x - startPoint.x;
        const height = currentPoint.y - startPoint.y;
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        
        setMeasurementInfo(`Width: ${Math.abs(width).toFixed(1)}px, Height: ${Math.abs(height).toFixed(1)}px, Area: ${Math.abs(width * height).toFixed(1)}px²`);
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
        setMeasurementInfo(`Distance: ${distance.toFixed(1)}px`);
        break;
      }
    }
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !startPoint) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const endPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    let newAnnotation;
    
    switch (currentTool) {
      case 'circle': {
        const radius = calculateDistance(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
        newAnnotation = {
          id: Date.now().toString(),
          type: AnnotationType.CIRCLE,
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
          type: AnnotationType.RECTANGLE,
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
          type: AnnotationType.ANGLE,
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
        newAnnotation = {
          id: Date.now().toString(),
          type: AnnotationType.MEASUREMENT,
          coordinates: [startPoint.x, startPoint.y, endPoint.x, endPoint.y],
          measurements: {
            distance: calculateDistance(startPoint.x, startPoint.y, endPoint.x, endPoint.y)
          }
        };
        break;
      }
    }

    if (newAnnotation) {
      onAnnotationAdd(newAnnotation);
    }
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