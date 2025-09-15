'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const featuredCollections = [
  {
    id: 1,
    title: 'Popular Manga',
    subtitle: 'Most read series',
    image: '/images/featured-1.jpg',
    color: 'from-purple-500',
  },
  {
    id: 2,
    title: 'New Releases',
    subtitle: 'Fresh chapters daily',
    image: '/images/featured-2.jpg',
    color: 'from-pink-500',
  },
  {
    id: 3,
    title: 'Top Rated',
    subtitle: 'Highest rated manga',
    image: '/images/featured-3.jpg',
    color: 'from-red-500',
  },
];

const waifuSpotlight = [
  { id: 1, name: 'Marin', role: 'Slice of Life', image: '/images/waifu-5.png' },
  { id: 2, name: 'Yor', role: 'Action', image: '/images/waifu-6.png' },
  { id: 3, name: 'Makima', role: 'Horror', image: '/images/waifu-7.png' },
  { id: 4, name: 'Nobara', role: 'Shonen', image: '/images/waifu-8.png' },
];

export default function FeaturedSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-black via-purple-900/20 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Featured Collections
          </h2>
          <p className="text-gray-400">Discover curated manga collections for every taste</p>
        </motion.div>
        
        {/* Featured Collections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {featuredCollections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative h-80 rounded-xl overflow-hidden"
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${collection.color} to-transparent opacity-60`} />
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white mb-2">{collection.title}</h3>
                <p className="text-gray-200">{collection.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Waifu Spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            Waifu Spotlight
          </h2>
          <p className="text-gray-400">Meet some of our favorite characters</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {waifuSpotlight.map((waifu, index) => (
            <motion.div
              key={waifu.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative bg-gradient-to-b from-purple-500/10 to-pink-500/10 rounded-xl p-4 hover:from-purple-500/20 hover:to-pink-500/20 transition-all"
            >
              <div className="relative h-48 mb-4">
                <Image
                  src={waifu.image}
                  alt={waifu.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{waifu.name}</h3>
              <p className="text-gray-400 text-sm">{waifu.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}