import React from 'react';
import { Circle, Square, Ruler, Move, RotateCcw } from 'lucide-react';

export default function Toolbar({ currentTool, onToolChange }) {
  const tools = [
    { id: 'move', icon: Move, label: 'Move', description: 'Pan and zoom image' },
    { id: 'circle', icon: Circle, label: 'Circle', description: 'Measure radius & circumference' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', description: 'Calculate area' },
    { id: 'angle', icon: RotateCcw, label: 'Angle', description: 'Measure angles' },
    { id: 'measure', icon: Ruler, label: 'Distance', description: 'Measure distances' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900">Tools</h2>
        <p className="text-sm text-slate-500 mt-1">Select a measurement tool</p>
      </div>
      <div className="p-4 space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full group
              ${
                currentTool === tool.id
                  ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2'
                  : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
              }`}
            title={tool.description}
          >
            <div className={`p-2 rounded-lg transition-colors ${
              currentTool === tool.id 
                ? 'bg-blue-100' 
                : 'bg-slate-100 group-hover:bg-slate-200'
            }`}>
              <tool.icon className={`w-5 h-5 ${
                currentTool === tool.id ? 'text-blue-600' : 'text-slate-500'
              }`} />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">{tool.label}</span>
              <span className="text-xs text-slate-500">{tool.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}