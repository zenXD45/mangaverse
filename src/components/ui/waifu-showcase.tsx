import Image from 'next/image';

export function WaifuShowcase() {
  const waifus = [
    {
      name: "Anime Girl 1",
      image: "/images/waifu-1.webp",
      position: "translate-y-8 rotate-[-8deg]"
    },
    {
      name: "Anime Girl 2",
      image: "/images/waifu-2.webp",
      position: "-translate-y-4 rotate-[5deg]"
    },
    {
      name: "Anime Girl 3",
      image: "/images/waifu-3.webp",
      position: "translate-y-6 rotate-[-3deg]"
    }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="relative w-full h-full">
        {waifus.map((waifu, index) => (
          <div
            key={waifu.name}
            className={`absolute ${index % 2 === 0 ? '-left-20' : '-right-20'} ${
              waifu.position
            } transition-transform duration-700 ease-out hover:scale-105`}
          >
            <div className="relative w-64 h-96 rounded-xl overflow-hidden shadow-xl">
              <Image
                src={waifu.image}
                alt={waifu.name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}