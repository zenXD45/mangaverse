'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Book, Search } from 'lucide-react';

export function Navbar() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <nav className="relative z-50">
      {/* Fluid Animation Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 backdrop-blur-md"
        animate={{
          background: isHovered
            ? [
                'radial-gradient(600px at 0% 0%, rgba(168, 85, 247, 0.15), transparent)',
                'radial-gradient(600px at 100% 100%, rgba(236, 72, 153, 0.15), transparent)',
                'radial-gradient(600px at 0% 100%, rgba(168, 85, 247, 0.15), transparent)'
              ]
            : 'none'
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Cursor Highlight Effect */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-full bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 blur-2xl"
          animate={{
            x: cursorPosition.x,
            y: cursorPosition.y - 100,
            scale: [1, 1.2, 1]
          }}
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
          style={{
            position: 'absolute',
            width: '200px',
            height: '200px',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      {/* Navbar Content */}
      <div 
        className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2"
          >
            <Home className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">MangaVerse</span>
          </motion.div>
        </Link>

        <div className="flex items-center space-x-8">
          <Link href="/library">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
            >
              <Book className="h-5 w-5" />
              <span>Library</span>
            </motion.div>
          </Link>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 rounded-full bg-primary/10 px-4 py-2 text-primary transition-colors hover:bg-primary/20"
          >
            <Search className="h-5 w-5" />
            <span>Search</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}