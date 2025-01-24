export interface Annotation {
  id: string;
  type: 'circle' | 'rectangle' | 'angle' | 'measurement';
  coordinates: number[];
  measurements?: {
    width?: number;
    height?: number;
    radius?: number;
    angle?: number;
    distance?: number;
  };
  notes?: string;
}

export interface ImageData {
  url: string;
  annotations: Annotation[];
}