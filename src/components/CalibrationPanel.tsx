import React, { useState } from 'react';
import { Ruler } from 'lucide-react';

interface CalibrationPanelProps {
  onCalibrate: (pixelsPerUnit: number) => void;
  unit: string;
  onUnitChange: (unit: string) => void;
}

export default function CalibrationPanel({ onCalibrate, unit, onUnitChange }: CalibrationPanelProps) {
  const [knownDistance, setKnownDistance] = useState<string>('');
  const [pixelDistance, setPixelDistance] = useState<number | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleCalibrate = () => {
    if (!isCalibrating) {
      setIsCalibrating(true);
    } else if (pixelDistance && knownDistance) {
      const pixelsPerUnit = pixelDistance / parseFloat(knownDistance);
      onCalibrate(pixelsPerUnit);
      setIsCalibrating(false);
      setPixelDistance(null);
      setKnownDistance('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Ruler className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Calibration</h2>
            <p className="text-sm text-slate-500">Set real-world measurements</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <select
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="block w-24 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
            <option value="in">inches</option>
          </select>
          <button
            onClick={handleCalibrate}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isCalibrating
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {isCalibrating ? 'Cancel Calibration' : 'Start Calibration'}
          </button>
        </div>

        {isCalibrating && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Known Distance ({unit})
              </label>
              <input
                type="number"
                value={knownDistance}
                onChange={(e) => setKnownDistance(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={`Enter known distance in ${unit}`}
                step="0.1"
              />
            </div>
            <p className="text-sm text-slate-600">
              Draw a line on the image that matches your known distance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}