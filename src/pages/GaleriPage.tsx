import { AppLayout } from '@/components/layout/AppLayout';
import { BatikCard } from '@/components/BatikCard';
import { motion } from 'framer-motion';
import { Search, GalleryHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBatikStore } from '@/stores/batikStore';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
export function GaleriPage() {
  const fetchAllBatiks = useBatikStore((s) => s.fetchAllBatiks);
  const batiks = useBatikStore((s) => s.batiks);
  const isLoading = useBatikStore((s) => s.isLoading);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchAllBatiks();
  }, [fetchAllBatiks]);
  const filteredBatiks = batiks.filter(
    (batik) =>
      batik.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batik.motif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batik.artisanName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <AppLayout>
      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="bg-brand-primary border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-20 md:py-28 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground"
              >
                Galeri Batik Autentik
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground"
              >
                Jelajahi keindahan dan keaslian Batik Indonesia. Setiap helai kain bercerita, setiap motif bermakna.
              </motion.p>
            </div>
          </div>
        </section>
        {/* Gallery Section */}
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16 md:py-24">
              <div className="flex justify-center mb-12">
                <div className="relative w-full max-w-lg">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, motif, atau pengrajin..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border rounded-2xl bg-card focus:ring-2 focus:ring-brand-accent focus:outline-none shadow-sm"
                  />
                </div>
              </div>
              {isLoading && !batiks.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-56 w-full rounded-2xl" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredBatiks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBatiks.map((batik, index) => (
                    <BatikCard key={batik.id} batik={batik} index={index} />
                  ))}
                </div>
              ) : (
                 <EmptyState
                    icon={GalleryHorizontal}
                    title="Tidak Ada Batik Ditemukan"
                    description="Kami tidak dapat menemukan batik yang cocok dengan pencarian Anda. Coba kata kunci lain."
                  />
              )}
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}