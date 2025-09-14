
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Search, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background z-0"></div>
          <div className="absolute inset-0 opacity-10 z-10"></div>
          <div className="z-20">
            <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-primary">
              Welcome to MangaVerse
            </h1>
            <div className="mt-4 text-lg md:text-xl text-muted-foreground h-8">
              <span className="animate-text-cycle">
                Explore vast collections.
              </span>
            </div>
            <Button asChild size="lg" className="mt-8">
              <Link href="/library">
                Read Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-background/50 rounded-lg">
                <div className="p-4 bg-accent rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Immersive Reading</h3>
                <p className="text-muted-foreground">
                  A clean, distraction-free reader designed to keep you in the story.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background/50 rounded-lg">
                <div className="p-4 bg-accent rounded-full mb-4">
                  <Search className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Discover New Titles</h3>
                <p className="text-muted-foreground">
                  Browse a growing library of manga from various sources and genres.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-background/50 rounded-lg">
                <div className="p-4 bg-accent rounded-full mb-4">
                  <Users className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">Community Driven</h3>
                <p className="text-muted-foreground">
                  Powered by community APIs like MangaDex to bring you more content.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-6 bg-background">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MangaVerse. All Rights Reserved.</p>
        </div>
      </footer>
    </main>
  );
}
