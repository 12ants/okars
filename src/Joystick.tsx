import React, { useState, useRef } from 'react';
import { debugData } from './store';

export function Joystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState(0);
  const isDragging = useRef(false);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const maxDist = rect.width / 2 - 24; // 24 is half knob width
    let dist = clientX - center;
    dist = Math.max(-maxDist, Math.min(maxDist, dist));
    setKnobPos(dist);
    
    // Calculate steering value (-1 to 1). Left is negative dist, which should mean positive steering in our setup.
    debugData.joystickSteering = -(dist / maxDist);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    updatePosition(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      updatePosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    setKnobPos(0);
    debugData.joystickSteering = 0;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      ref={containerRef}
      className="w-48 h-16 bg-zinc-800/80 backdrop-blur border-2 border-zinc-600 rounded-full flex items-center justify-center relative touch-none select-none shadow-lg"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div 
        className="w-12 h-12 bg-zinc-300 rounded-full shadow-md absolute transition-transform duration-75 ease-out"
        style={{ transform: `translateX(${knobPos}px)` }}
      />
    </div>
  );
}
