import React from 'react';
import { GripVertical } from 'lucide-react';

/**
 * Resizable divider component
 * Drag handle between chat area and PDF viewer panel
 */
const ResizableDivider = ({ onMouseDown, isDragging }) => {
  return (
    <div
      className={`relative w-1 bg-border-primary hover:bg-blue-500 transition-colors duration-200 cursor-ew-resize group flex-shrink-0 ${
        isDragging ? 'bg-blue-500' : ''
      }`}
      onMouseDown={onMouseDown}
      role="separator"
      aria-label="Resize panels"
      aria-orientation="vertical"
    >
      {/* Invisible wider hit area for easier grabbing */}
      <div className="absolute inset-y-0 -left-2 -right-2 cursor-ew-resize" />
      
      {/* Grip icon - shows on hover */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-border-primary rounded-lg p-1 shadow-light-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
        isDragging ? 'opacity-100' : ''
      }`}>
        <GripVertical className="w-4 h-4 text-text-secondary" />
      </div>
    </div>
  );
};

export default ResizableDivider;

