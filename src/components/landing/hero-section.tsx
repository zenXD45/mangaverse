'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '../ui/button';
import Link from 'next/link';

const waifuCharacters = [
  {
    id: 1,
    name: 'Sakura',
    image: '/images/waifu-1.png',
    position: 'left-0',
    delay: 0.6,
    translateY: [-20, 0],
  },
  {
    id: 2,
    name: 'Hinata',
    image: '/images/waifu-2.png',
    position: 'right-0',
    delay: 0.8,
    translateY: [-10, 10],
  },
  {
    id: 3,
    name: 'Mikasa',
    image: '/images/waifu-3.png',
    position: 'left-1/4',
    delay: 1.0,
    translateY: [-15, 5],
  },
  {
    id: 4,
    name: 'Zero Two',
    image: '/images/waifu-4.png',
    position: 'right-1/4',
    delay: 1.2,
    translateY: [-5, 15],
  }
];

export default function HeroSection() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-900/20 to-black/40"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 z-0">
        <div className="stars" />
        <div className="twinkling" />
      </div>
      
      {/* Floating waifu characters */}
      {waifuCharacters.map((waifu) => (
        <motion.div
          key={waifu.id}
          className={`absolute bottom-0 ${waifu.position} w-64 h-96 pointer-events-none`}
          initial={{ opacity: 0, x: waifu.position.includes('left') ? -100 : 100 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: waifu.translateY
          }}
          transition={{
            delay: waifu.delay,
            duration: 1,
            y: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              repeatType: "reverse"
            }
          }}
        >
          <Image
            src={waifu.image}
            alt={waifu.name}
            fill
            className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            priority
          />
        </motion.div>
      ))}
      
      {/* Main content */}
      <div className="z-10 text-center px-4 mt-[-10vh]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Image
            src="/images/logo.png"
            alt="MangaVerse Logo"
            width={200}
            height={200}
            className="mx-auto"
          />
        </motion.div>

        <motion.h1 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-gradient-x"
        >
          MangaVerse
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto"
        >
          Dive into an infinite universe of manga adventures. Your next favorite story awaits!
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 justify-center"
        >
          <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Link href="/library">
              Explore Library
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500/10">
            <Link href="/about">
              Learn More
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}