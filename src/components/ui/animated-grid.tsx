import { cn } from "@/lib/utils";

export function AnimatedGrid() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-background">
      <div className="absolute h-full w-full [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-30" />
        <div className="grid h-full w-full grid-cols-3 md:grid-cols-6 gap-2 p-2">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "relative h-full w-full overflow-hidden rounded-lg",
                "before:absolute before:inset-0",
                "after:absolute after:bottom-0 after:left-0 after:right-0",
                "after:h-32 after:bg-gradient-to-t after:from-black/50 after:to-transparent",
                "animate-grid-fade",
                // Randomize animation delay
                `animation-delay-${Math.floor(Math.random() * 5000)}`,
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}