import React from 'react';
import { Circle, Square, Ruler, Move, RotateCcw } from 'lucide-react';

interface ToolbarProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
}

export default function Toolbar({ currentTool, onToolChange }: ToolbarProps) {
  const tools = [
    { id: 'move', icon: Move, label: 'Move', description: 'Pan and zoom image' },
    { id: 'circle', icon: Circle, label: 'Circle', description: 'Measure radius & circumference' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', description: 'Calculate area' },
    { id: 'angle', icon: RotateCcw, label: 'Angle', description: 'Measure angles' },
    { id: 'measure', icon: Ruler, label: 'Distance', description: 'Measure distances' },
  ];

  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-xl shadow-lg w-64">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Tools</h2>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id)}
          className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
            currentTool === tool.id
              ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2'
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
          }`}
          title={tool.description}
        >
          <tool.icon className={`w-5 h-5 ${
            currentTool === tool.id ? 'text-blue-600' : 'text-gray-500'
          }`} />
          <div className="flex flex-col items-start">
            <span className="font-medium">{tool.label}</span>
            <span className="text-xs text-gray-500">{tool.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
}