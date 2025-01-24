import React, { useEffect, useRef, useState } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';
import { FileText } from 'lucide-react';

interface DicomMetadata {
  patientName?: string;
  patientId?: string;
  studyDate?: string;
  modality?: string;
  studyDescription?: string;
}

interface DicomViewerProps {
  file: File;
}

export default function DicomViewer({ file }: DicomViewerProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [metadata, setMetadata] = useState<DicomMetadata>({});
  const [windowWidth, setWindowWidth] = useState(400);
  const [windowCenter, setWindowCenter] = useState(200);

  useEffect(() => {
    // Initialize cornerstone tools
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneTools.init();

    // Enable the WADO image loader
    if (cornerstoneWADOImageLoader.wadouri) {
      cornerstoneWADOImageLoader.wadouri.enable();
    }

    // Enable HTML5 File loader
    if (cornerstoneWADOImageLoader.wadouri) {
      cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
    }

    return () => {
      // Cleanup
      if (elementRef.current) {
        cornerstone.disable(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadDicomFile = async () => {
      if (!elementRef.current || !file) return;

      try {
        // Enable the element
        cornerstone.enable(elementRef.current);

        // Load the image
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        const image = await cornerstone.loadImage(imageId);

        // Extract metadata
        const dataSet = image.data;
        const meta: DicomMetadata = {
          patientName: dataSet.string('x00100010'),
          patientId: dataSet.string('x00100020'),
          studyDate: dataSet.string('x00080020'),
          modality: dataSet.string('x00080060'),
          studyDescription: dataSet.string('x00081030')
        };
        setMetadata(meta);

        // Display the image
        cornerstone.displayImage(elementRef.current, image);

        // Enable tools
        cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
        cornerstoneTools.addTool(cornerstoneTools.PanTool);
        cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
        cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
        cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 2 });
        cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 4 });

      } catch (error) {
        console.error('Error loading DICOM file:', error);
      }
    };

    loadDicomFile();
  }, [file]);

  const handleWindowLevelChange = () => {
    if (!elementRef.current) return;

    const viewport = cornerstone.getViewport(elementRef.current);
    if (viewport) {
      viewport.voi.windowWidth = windowWidth;
      viewport.voi.windowCenter = windowCenter;
      cornerstone.setViewport(elementRef.current, viewport);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">DICOM Metadata</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(metadata).map(([key, value]) => (
            value && (
              <div key={key} className="space-y-1">
                <dt className="text-slate-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Window Width</span>
          <input
            type="range"
            min="1"
            max="4000"
            value={windowWidth}
            onChange={(e) => {
              setWindowWidth(Number(e.target.value));
              handleWindowLevelChange();
            }}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-slate-600 w-16">{windowWidth}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Window Center</span>
          <input
            type="range"
            min="-1000"
            max="1000"
            value={windowCenter}
            onChange={(e) => {
              setWindowCenter(Number(e.target.value));
              handleWindowLevelChange();
            }}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-slate-600 w-16">{windowCenter}</span>
        </div>
      </div>

      <div 
        ref={elementRef}
        className="min-h-[500px] bg-black rounded-lg overflow-hidden"
        style={{ width: '100%', height: '500px' }}
      />
    </div>
  );
}