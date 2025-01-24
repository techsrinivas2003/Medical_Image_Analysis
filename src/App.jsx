import React, { useState } from 'react';
import { Upload, Trash2, ImageIcon } from 'lucide-react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';

function App() {
  const [currentTool, setCurrentTool] = useState('move');
  const [imageUrl, setImageUrl] = useState('');
  const [annotations, setAnnotations] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleAnnotationAdd = (annotation) => {
    setAnnotations([...annotations, annotation]);
  };

  const handleAnnotationDelete = (id) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const formatMeasurement = (annotation) => {
    switch (annotation.type) {
      case 'circle':
        return `Radius: ${annotation.measurements.radius.toFixed(1)}px
                Circumference: ${annotation.measurements.circumference.toFixed(1)}px`;
      case 'rectangle':
        return `Width: ${annotation.measurements.width.toFixed(1)}px
                Height: ${annotation.measurements.height.toFixed(1)}px
                Area: ${(annotation.measurements.width * annotation.measurements.height).toFixed(1)}px²`;
      case 'angle':
        return `Angle: ${annotation.measurements.angle.toFixed(1)}°`;
      case 'measurement':
        return `Distance: ${annotation.measurements.distance.toFixed(1)}px`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ImageIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Medical Image Analysis</h1>
                <p className="text-sm text-slate-500">Precise measurements and annotations</p>
              </div>
            </div>
            {imageUrl && (
              <button
                onClick={() => setImageUrl('')}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Clear Image
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!imageUrl ? (
          <div className="flex items-center justify-center h-[600px] border-2 border-dashed border-slate-300 rounded-2xl bg-white bg-opacity-50 backdrop-blur-sm transition-all hover:border-blue-400">
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <div className="mt-4 flex flex-col items-center text-sm leading-6 text-slate-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-lg bg-blue-50 px-6 py-3 font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:bg-blue-100 transition-colors"
                >
                  <span>Upload a medical image</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="mt-3">or drag and drop</p>
                <p className="text-xs mt-2 text-slate-500">Supports PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="flex-none space-y-6">
              <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />
              
              {/* Measurements Panel */}
              {annotations.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Measurements</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    {annotations.map((annotation, index) => (
                      <div
                        key={annotation.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 relative group transition-all hover:border-blue-200 hover:bg-blue-50"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-none w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold shadow-sm">
                            {index + 1}
                          </span>
                          <div className="flex-1 text-sm">
                            <div className="font-medium text-slate-900 capitalize mb-1">
                              {annotation.type}
                            </div>
                            <div className="text-slate-600 whitespace-pre-line">
                              {formatMeasurement(annotation)}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAnnotationDelete(annotation.id)}
                            className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-100 rounded-lg"
                            title="Delete measurement"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
              <Canvas
                imageUrl={imageUrl}
                annotations={annotations}
                currentTool={currentTool}
                onAnnotationAdd={handleAnnotationAdd}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;