import { Navbar } from '@/components/ui/navbar';

export default function MangaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}