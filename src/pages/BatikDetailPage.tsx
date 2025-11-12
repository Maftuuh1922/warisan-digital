import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { Batik, PengrajinDetails } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArtisanWithDetails } from '@/stores/artisanStore';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
export function BatikDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [batik, setBatik] = useState<Batik | null>(null);
  const [artisan, setArtisan] = useState<ArtisanWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchBatikDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const batikData = await api<Batik>(`/api/batiks/${id}`);
        setBatik(batikData);
        if (batikData.artisanId) {
          const artisanData = await api<ArtisanWithDetails>(`/api/artisans/${batikData.artisanId}`);
          setArtisan(artisanData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load batik details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatikDetails();
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
            <Button asChild className="mt-8">
              <Link to="/galeri">Back to Gallery</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  const gmapsUrl = artisan?.details?.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(artisan.details.address)}` : '#';
  const whatsappUrl = artisan?.details?.phoneNumber ? `https://wa.me/${artisan.details.phoneNumber.replace(/\D/g, '')}` : '#';
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/galeri" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Galeri
              </Link>
            </Button>
          </div>
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="aspect-w-1 aspect-h-1 rounded-2xl overflow-hidden shadow-card"
            >
              <img src={batik.imageUrl} alt={batik.name} className="w-full h-full object-cover" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="text-sm">{batik.motif}</Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4 mb-4">{batik.name}</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Dibuat dengan penuh dedikasi oleh <span className="font-semibold text-brand-accent">{batik.artisanName}</span>
              </p>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Sejarah & Makna Motif</h2>
                  <p className="text-base text-foreground/90 leading-relaxed">{batik.history}</p>
                </div>
                {artisan?.details && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Detail Pengrajin</h3>
                    <div className="flex items-center space-x-4">
                      <Button asChild>
                        <a href={gmapsUrl} target="_blank" rel="noopener noreferrer">
                          <MapPin className="mr-2 h-4 w-4" />
                          Lihat Lokasi
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                         <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Hubungi via WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}