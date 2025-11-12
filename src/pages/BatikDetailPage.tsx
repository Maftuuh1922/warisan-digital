import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Batik } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
export function BatikDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [batik, setBatik] = useState<Batik | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchBatik = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api<Batik>(`/api/batiks/${id}`);
        setBatik(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load batik details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatik();
  }, [id]);
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24">
            <div className="mb-8"><Skeleton className="h-10 w-48" /></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="space-y-6">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-7 w-1/2" />
                <div className="space-y-4 pt-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (error || !batik) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24 text-center">
            <h1 className="text-3xl font-bold">Batik Not Found</h1>
            <p className="text-muted-foreground mt-4">{error || 'The batik you are looking for does not exist.'}</p>
            <Button asChild className="mt-8 bg-brand-accent hover:bg-brand-accent/90">
              <Link to="/">Back to Gallery</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Galeri
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden shadow-lg"
            >
              <img src={batik.imageUrl} alt={batik.name} className="w-full h-full object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge variant="secondary" className="text-sm">{batik.motif}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mt-4 mb-4">{batik.name}</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Dibuat dengan penuh dedikasi oleh <span className="font-semibold text-brand-accent">{batik.artisanName}</span>
              </p>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Sejarah & Makna Motif</h2>
                  <p className="text-base text-foreground/80 leading-relaxed">{batik.history}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Detail Pengrajin</h3>
                  <div className="flex items-center space-x-4">
                    <Button className="bg-brand-accent hover:bg-brand-accent/90">
                      <MapPin className="mr-2 h-4 w-4" />
                      Lihat Lokasi
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Hubungi via WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}