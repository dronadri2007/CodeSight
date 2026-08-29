import { useState, useEffect } from 'react';

export interface MousePosition {
  x: number; // Raw pixels
  y: number; // Raw pixels
  normX: number; // -1 (left) to 1 (right)
  normY: number; // -1 (top) to 1 (bottom)
}

export function useMousePosition() {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normX: 0,
    normY: 0,
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const normX = (event.clientX / width) * 2 - 1;
      const normY = (event.clientY / height) * 2 - 1;

      setPosition({
        x: event.clientX,
        y: event.clientY,
        normX,
        normY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}
