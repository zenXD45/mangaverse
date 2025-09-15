'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function Landing() {
  const router = useRouter();

  const handleStartReading = () => {
    router.push('/library');
  };
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Hero Background with Parallax Effect */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        <Image
          src="/images/demonslayer-hero.jpg"
          alt="Demon Slayer Hero"
          fill
          className="object-cover opacity-60 sm:opacity-40 mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 sm:from-black/90 sm:via-black/70 sm:to-black/90" />
      </motion.div>

      {/* Animated Particles Overlay */}
      <div className="absolute inset-0 z-1 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Character Side Panels */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute left-0 top-0 h-full w-1/3 md:w-1/4 hidden sm:block"
        >
          <div className="relative h-full">
            <Image
              src="/images/shinobu.jpg"
              alt="Shinobu"
              fill
              className="object-cover mix-blend-overlay opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/50 to-black/90" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute right-0 top-0 h-full w-1/3 md:w-1/4 hidden sm:block"
        >
          <div className="relative h-full">
            <Image
              src="/images/mitsuri.jpg"
              alt="Mitsuri"
              fill
              className="object-cover mix-blend-overlay opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/50 to-black/90" />
          </div>
        </motion.div>

        {/* Center Content */}
        <div className="mx-auto flex w-full max-w-7xl items-center justify-center px-4">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white relative px-4">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  MangaVerse
                </span>
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 blur-2xl -z-10" />
              </h1>
              <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-gray-200 font-medium drop-shadow-lg px-6">
                Journey through endless realms of imagination, where every page turns into
                an adventure and every character tells a story.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.button
                  onClick={handleStartReading}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg transition-all hover:from-purple-600 hover:via-pink-600 hover:to-purple-600"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
                    style={{ mixBlendMode: "overlay" }}
                    animate={{
                      x: ["0%", "100%"],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
      </div>
    </div>
  );
}