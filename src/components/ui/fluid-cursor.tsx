'use client';

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  dx: number;
  dy: number;
  age: number;
}

export function FluidCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Add new point on mouse move
      pointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        dx: 0,
        dy: 0,
        age: 0
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation function
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw points
      pointsRef.current = pointsRef.current
        .map(point => {
          // Apply physics
          point.age += 1;
          point.x += point.dx;
          point.y += point.dy;
          
          // Add some random movement
          point.dx += (Math.random() - 0.5) * 0.2;
          point.dy += (Math.random() - 0.5) * 0.2;
          
          // Dampen movement
          point.dx *= 0.99;
          point.dy *= 0.99;

          // Draw point
          const size = Math.max(0, 20 - point.age / 5);
          
          // Create gradient
          const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, size
          );
          
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)'); // Purple
          gradient.addColorStop(0.4, 'rgba(236, 72, 153, 0.2)'); // Pink
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)'); // Blue

          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();

          // Remove old points
          return point.age < 100;
        })
        .filter(Boolean);

      frameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100] opacity-60 mix-blend-screen"
      aria-hidden="true"
    />
  );
}