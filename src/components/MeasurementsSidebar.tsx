import React from 'react';
import { ClipboardList } from 'lucide-react';
import { Annotation } from '../types';

interface MeasurementsSidebarProps {
  annotations: Annotation[];
  onDelete: (id: string) => void;
  pixelsPerUnit: number;
  unit: string;
}

export default function MeasurementsSidebar({ 
  annotations, 
  onDelete, 
  pixelsPerUnit,
  unit 
}: MeasurementsSidebarProps) {
  const formatMeasurement = (value: number): string => {
    if (!pixelsPerUnit) return `${value.toFixed(1)}px`;
    const realValue = value / pixelsPerUnit;
    return `${realValue.toFixed(1)}${unit}`;
  };

  const formatArea = (width: number, height: number): string => {
    if (!pixelsPerUnit) return `${(width * height).toFixed(1)}px²`;
    const realWidth = width / pixelsPerUnit;
    const realHeight = height / pixelsPerUnit;
    return `${(realWidth * realHeight).toFixed(1)}${unit}²`;
  };

  const getMeasurementText = (annotation: Annotation): string => {
    switch (annotation.type) {
      case 'circle':
        return `Radius: ${formatMeasurement(annotation.measurements.radius!)}\nCircumference: ${formatMeasurement(2 * Math.PI * annotation.measurements.radius!)}`;
      case 'rectangle':
        return `Width: ${formatMeasurement(annotation.measurements.width!)}\nHeight: ${formatMeasurement(annotation.measurements.height!)}\nArea: ${formatArea(annotation.measurements.width!, annotation.measurements.height!)}`;
      case 'angle':
        return `Angle: ${annotation.measurements.angle!.toFixed(1)}°`;
      case 'measurement':
        return `Distance: ${formatMeasurement(annotation.measurements.distance!)}`;
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Measurements</h2>
            <p className="text-sm text-slate-500">
              {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto">
        {annotations.map((annotation, index) => (
          <div
            key={annotation.id}
            className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group transition-all hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="absolute -left-3 -top-3 w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold shadow-sm">
              {index + 1}
            </div>
            <div className="ml-2">
              <div className="font-medium text-slate-900 capitalize mb-1">
                {annotation.type}
              </div>
              <div className="text-sm text-slate-600 whitespace-pre-line">
                {getMeasurementText(annotation)}
              </div>
              <button
                onClick={() => onDelete(annotation.id)}
                className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {annotations.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            No measurements yet
          </div>
        )}
      </div>
    </div>
  );
}