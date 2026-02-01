import React from 'react';
import { cn } from '@/lib/utils';
import { SpotlightPosition } from './types';

interface SpotlightProps {
  position: SpotlightPosition | null;
  isVisible: boolean;
}

const Spotlight: React.FC<SpotlightProps> = ({ position, isVisible }) => {
  if (!isVisible || !position) return null;

  return (
    <>
      {/* Overlay with cutout */}
      <div 
        className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(
            ellipse at ${position.left + position.width / 2}px ${position.top + position.height / 2}px,
            transparent ${Math.max(position.width, position.height) / 2 + 20}px,
            rgba(0, 0, 0, 0.5) ${Math.max(position.width, position.height) / 2 + 60}px
          )`
        }}
      />
      
      {/* Highlight border */}
      <div
        className={cn(
          "fixed z-40 pointer-events-none",
          "border-2 border-primary rounded-lg",
          "shadow-[0_0_0_4px_rgba(var(--primary),0.2)]",
          "animate-pulse"
        )}
        style={{
          top: position.top - 4,
          left: position.left - 4,
          width: position.width + 8,
          height: position.height + 8,
          transition: 'all 0.3s ease-in-out'
        }}
      />
    </>
  );
};

export default Spotlight;
