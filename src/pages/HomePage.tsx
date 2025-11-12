import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScanLine, Bot, GalleryHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
const features = [
  {
    icon: GalleryHorizontal,
    title: 'Galeri Digital Imersif',
    description: 'Jelajahi ribuan motif batik dari seluruh nusantara dalam galeri digital yang kaya akan visual dan informasi.',
  },
  {
    icon: Bot,
    title: 'Analisis Motif Cerdas',
    description: 'Unggah foto batik dan biarkan AI kami mengidentifikasi motif, asal daerah, dan filosofi di baliknya.',
  },
  {
    icon: ScanLine,
    title: 'Verifikasi Keaslian QR',
    description: 'Pastikan keaslian batik Anda dengan memindai QR code unik yang tertera pada setiap produk terverifikasi.',
  },
];
export function HomePage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative batik-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-24 md:py-32 lg:py-48 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground"
            >
              Jelajahi Keindahan <span className="text-brand-accent">Batik Nusantara</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground"
            >
              Platform digital untuk otentikasi, edukasi, dan promosi kain batik autentik, didukung oleh teknologi AI.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 flex justify-center gap-4"
            >
              <Button size="lg" asChild className="rounded-2xl px-8 py-6 text-lg">
                <Link to="/galeri">Mulai Jelajah</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-2xl px-8 py-6 text-lg bg-card hover:bg-brand-secondary">
                <Link to="/scan-qr">Scan Batik</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Inovasi dalam Tradisi</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Kami menggabungkan teknologi modern dengan warisan budaya untuk memberikan pengalaman batik yang tak terlupakan.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full text-center p-8 rounded-3xl shadow-card hover:-translate-y-2 transition-transform duration-300">
                  <CardHeader className="flex items-center justify-center">
                    <div className="bg-brand-secondary p-4 rounded-full">
                      <feature.icon className="h-8 w-8 text-brand-accent" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-bold font-display text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 md:py-28 batik-texture-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Siap Menjadi Bagian dari Ekosistem Batik Digital?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Daftarkan diri Anda sebagai pengrajin terverifikasi atau mulailah petualangan Anda menjelajahi dunia batik yang autentik.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="rounded-2xl px-8 py-6 text-lg">
              <Link to="/auth">Daftar Sekarang</Link>
            </Button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}