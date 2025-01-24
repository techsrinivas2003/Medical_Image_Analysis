import React, { useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import CalibrationPanel from './components/CalibrationPanel';
import MeasurementsSidebar from './components/MeasurementsSidebar';
import ImageManipulation from './components/ImageManipulation';
import DicomViewer from './components/DicomViewer';
import { Annotation } from './types';

function App() {
  const [currentTool, setCurrentTool] = useState('move');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [pixelsPerUnit, setPixelsPerUnit] = useState<number>(0);
  const [unit, setUnit] = useState<string>('mm');
  const [isDicom, setIsDicom] = useState(false);
  const [dicomFile, setDicomFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is DICOM
    if (file.type === 'application/dicom' || file.name.toLowerCase().endsWith('.dcm')) {
      setIsDicom(true);
      setDicomFile(file);
    } else {
      setIsDicom(false);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleAnnotationAdd = (annotation: Annotation) => {
    setAnnotations([...annotations, annotation]);
  };

  const handleAnnotationDelete = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const handleImageChange = (manipulatedImageUrl: string) => {
    setImageUrl(manipulatedImageUrl);
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
                <p className="text-sm text-slate-500">Advanced medical image processing</p>
              </div>
            </div>
            {(imageUrl || isDicom) && (
              <button
                onClick={() => {
                  setImageUrl('');
                  setAnnotations([]);
                  setPixelsPerUnit(0);
                  setIsDicom(false);
                  setDicomFile(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Clear Image
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {!imageUrl && !isDicom ? (
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
                    accept="image/*,.dcm"
                    onChange={handleFileUpload}
                  />
                </label>
                <p className="mt-3">or drag and drop</p>
                <p className="text-xs mt-2 text-slate-500">Supports DICOM, PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            <div className="flex-none space-y-6 w-72">
              <Toolbar currentTool={currentTool} onToolChange={setCurrentTool} />
              {!isDicom && (
                <>
                  <CalibrationPanel
                    onCalibrate={setPixelsPerUnit}
                    unit={unit}
                    onUnitChange={setUnit}
                  />
                  <MeasurementsSidebar
                    annotations={annotations}
                    onDelete={handleAnnotationDelete}
                    pixelsPerUnit={pixelsPerUnit}
                    unit={unit}
                  />
                </>
              )}
            </div>
            <div className="flex-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                {isDicom && dicomFile ? (
                  <DicomViewer file={dicomFile} />
                ) : (
                  <>
                    <ImageManipulation
                      imageUrl={imageUrl}
                      onImageChange={handleImageChange}
                    />
                    <div className="mt-6">
                      <Canvas
                        imageUrl={imageUrl}
                        annotations={annotations}
                        currentTool={currentTool}
                        onAnnotationAdd={handleAnnotationAdd}
                        pixelsPerUnit={pixelsPerUnit}
                        unit={unit}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;