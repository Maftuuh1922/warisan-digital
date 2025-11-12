import { AppLayout } from '@/components/layout/AppLayout';
import { BatikCard } from '@/components/BatikCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useBatikStore } from '@/stores/batikStore';
import { Skeleton } from '@/components/ui/skeleton';
export function HomePage() {
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
      batik.motif.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <AppLayout>
      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-24 md:py-32 lg:py-40 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl font-bold tracking-tight text-brand-primary"
              >
                Melestarikan <span className="text-brand-accent">Warisan</span>, Merajut Masa Depan
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground"
              >
                Jelajahi keindahan dan keaslian Batik Indonesia. Setiap helai kain bercerita, setiap motif bermakna.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8 flex justify-center"
              >
                <Button size="lg" className="bg-brand-accent hover:bg-brand-accent/90 text-accent-foreground text-base font-semibold px-8 py-6">
                  Jelajahi Galeri
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
        {/* Gallery Section */}
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16 md:py-24">
              <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-primary">Galeri Batik Autentik</h2>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari motif atau nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 pl-10 pr-4 py-2 border rounded-md bg-secondary focus:ring-2 focus:ring-brand-accent focus:outline-none"
                  />
                </div>
              </div>
              {isLoading && !batiks.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-56 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBatiks.map((batik, index) => (
                    <BatikCard key={batik.id} batik={batik} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}