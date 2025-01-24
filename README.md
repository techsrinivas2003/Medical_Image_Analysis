# Medical Image Analysis Tool

A sophisticated web application for precise medical image measurements and annotations, built with React, TypeScript, and Canvas API. This tool provides accurate measurements in real-world units, making it ideal for medical professionals and researchers.

![Medical Image Analysis Tool](https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070)

## Key Features

- 🔍 Real-world Measurements
  - Calibration system for accurate unit conversion
  - Support for mm, cm, and inches
  - Real-time measurement display
- 📏 Comprehensive Measurement Tools
  - Circle (radius & circumference)
  - Rectangle (width, height & area)
  - Angle measurements
  - Linear distance measurements
- 🎯 Professional Annotations
  - Numbered annotations for easy reference
  - High-contrast visuals for clarity
  - Real-time measurement preview
  - Detailed measurements panel
- 🖼️ Image Manipulation
  - Smooth brightness and contrast adjustments
  - Zoom and pan functionality
  - Image rotation and flipping
  - Real-time preview updates
- 🏥 DICOM Support
  - Native DICOM file handling
  - Metadata display (patient info, study details)
  - Window/level adjustments
  - Professional medical imaging tools

## Technical Implementation

### Core Architecture

The application follows a modular, component-based architecture with TypeScript for type safety:

```typescript
interface Annotation {
  id: string;
  type: 'circle' | 'rectangle' | 'angle' | 'measurement';
  coordinates: number[];
  measurements: {
    width?: number;
    height?: number;
    radius?: number;
    angle?: number;
    distance?: number;
  };
}
```

### Key Components

1. **App.tsx**
   - Central state management
   - Image upload handling
   - DICOM file detection
   - Component coordination

2. **Canvas.tsx**
   - Canvas rendering engine
   - Real-time drawing
   - Measurement calculations
   - Event handling

3. **ImageManipulation.tsx**
   - Smooth image adjustments
   - Performance-optimized rendering
   - Advanced transformation controls
   - Real-time preview

4. **DicomViewer.tsx**
   - DICOM file parsing
   - Metadata extraction
   - Window/level controls
   - Professional viewing tools

5. **CalibrationPanel.tsx**
   - Unit selection
   - Calibration workflow
   - Real-world unit conversion

6. **MeasurementsSidebar.tsx**
   - Organized measurement display
   - Annotation management
   - Real-time updates

### Implementation Details

#### Image Processing Engine

The image manipulation system uses advanced techniques for smooth performance:

- Lookup tables (LUT) for fast pixel manipulation
- RequestAnimationFrame for smooth updates
- Off-screen canvas for processing
- Optimized pixel operations
- Efficient memory management

```typescript
// Example of optimized brightness/contrast adjustment
const brightnessLUT = new Uint8Array(256);
const contrastLUT = new Uint8Array(256);

for (let i = 0; i < 256; i++) {
  brightnessLUT[i] = truncateColor(i + brightnessOffset);
  contrastLUT[i] = truncateColor(contrastFactor * (i - 128) + 128);
}
```

#### DICOM Integration

Professional medical imaging capabilities using industry-standard libraries:

- Cornerstone.js for DICOM rendering
- WADO image loader for file handling
- Window/level adjustments
- Medical metadata extraction

```typescript
const loadDicomFile = async () => {
  const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
  const image = await cornerstone.loadImage(imageId);
  const dataSet = image.data;
  
  // Extract metadata
  const meta = {
    patientName: dataSet.string('x00100010'),
    studyDate: dataSet.string('x00080020'),
    modality: dataSet.string('x00080060')
  };
};
```

### Visual Design

1. **Color Scheme**
   - Primary: Blue (#3B82F6) - Professional, medical
   - Accent: Red (#FF3B30) - High visibility annotations
   - Background: Gradient slate for depth
   - White surfaces for clarity

2. **Typography**
   - System fonts for performance
   - Clear hierarchy
   - Optimized for readability

3. **Layout**
   - Left sidebar for tools
   - Maximized canvas area
   - Floating measurement preview
   - Clean, medical-grade interface

### Performance Optimizations

1. **Image Processing**
   - Lookup tables for color transformations
   - RequestAnimationFrame for smooth updates
   - Off-screen canvas buffering
   - Optimized pixel manipulation

2. **State Management**
   - Local state for UI
   - Memoized calculations
   - Efficient re-renders

3. **Resource Management**
   - Proper image cleanup
   - Canvas optimization
   - Memory management
   - Event listener cleanup

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Best Practices

1. **Code Quality**
   - TypeScript for type safety
   - Consistent code style
   - Comprehensive documentation
   - Modular architecture

2. **User Experience**
   - Smooth image manipulation
   - Real-time feedback
   - Professional medical features
   - Intuitive controls

3. **Performance**
   - Optimized rendering
   - Efficient calculations
   - Responsive design
   - Smooth interactions

## Future Enhancements

1. **Features**
   - Advanced DICOM tools
   - Measurement export (CSV/PDF)
   - 3D volume rendering
   - AI-assisted annotations

2. **Technical**
   - WebGL acceleration
   - Worker thread processing
   - Advanced image filters
   - Batch processing

3. **Integration**
   - PACS integration
   - Cloud storage
   - Team collaboration
   - API endpoints

## Technologies

- React 18.3
- TypeScript 5.5
- Canvas API
- Cornerstone.js
- DICOM Tools
- Tailwind CSS
- Lucide Icons

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## Support

For support, please open an issue in the GitHub repository or contact our support team.

---

Built with ❤️ for the medical community