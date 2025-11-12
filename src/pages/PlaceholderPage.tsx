import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
interface PlaceholderPageProps {
  pageName: string;
}
export function PlaceholderPage({ pageName }: PlaceholderPageProps) {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-24 md:py-32 flex flex-col items-center justify-center text-center">
          <div className="bg-brand-secondary p-5 rounded-full mb-6">
            <Wrench className="h-12 w-12 text-brand-accent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Halaman {pageName}
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
            Fitur ini sedang dalam pengembangan dan akan segera hadir. Kami bekerja keras untuk memberikan pengalaman terbaik untuk Anda.
          </p>
          <div className="mt-8">
            <Button asChild className="rounded-xl">
              <Link to="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}