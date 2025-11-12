import { AppLayout } from '@/components/layout/AppLayout';
import { useArtisanStore, type ArtisanWithDetails } from '@/stores/artisanStore';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';
const ArtisanCard = ({ artisan, index }: { artisan: ArtisanWithDetails, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 ease-in-out hover:shadow-xl hover:-translate-y-1 border-border/60">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-brand-accent" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-brand-primary">{artisan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{artisan.details?.storeName || 'Sanggar Batik'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
          <div className="flex items-start space-x-3 text-sm text-foreground/80">
            <Store className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <span>{artisan.details?.storeName || 'Informasi toko tidak tersedia.'}</span>
          </div>
          <div className="flex items-start space-x-3 text-sm text-foreground/80">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <span>{artisan.details?.address || 'Alamat tidak tersedia.'}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
export function ArtisansPage() {
  const fetchArtisans = useArtisanStore((s) => s.fetchArtisans);
  const artisans = useArtisanStore((s) => s.artisans);
  const isLoading = useArtisanStore((s) => s.isLoading);
  useEffect(() => {
    fetchArtisans();
  }, [fetchArtisans]);
  const verifiedArtisans = artisans.filter(a => a.status === 'verified');
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-primary">
              Para Maestro Batik
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
              Kenali para pengrajin berbakat yang mendedikasikan hidupnya untuk melestarikan keindahan Batik Indonesia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading && !verifiedArtisans.length ? (
              [...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))
            ) : (
              verifiedArtisans.map((artisan, index) => (
                <ArtisanCard key={artisan.id} artisan={artisan} index={index} />
              ))
            )}
          </div>
          {!isLoading && verifiedArtisans.length === 0 && (
            <div className="text-center col-span-full py-16">
              <p className="text-muted-foreground">Belum ada pengrajin terverifikasi yang ditampilkan.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}