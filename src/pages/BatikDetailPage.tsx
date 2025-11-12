import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MOCK_BATIK_DATA } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
export function BatikDetailPage() {
  const { id } = useParams<{ id: string }>();
  const batik = MOCK_BATIK_DATA.find((b) => b.id === id);
  if (!batik) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24 text-center">
            <h1 className="text-3xl font-bold">Batik Not Found</h1>
            <p className="text-muted-foreground mt-4">The batik you are looking for does not exist.</p>
            <Button asChild className="mt-8">
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
              className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden"
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
                    <Button>
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