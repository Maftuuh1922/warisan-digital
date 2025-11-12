import { AppLayout } from '@/components/layout/AppLayout';
import { Target, ShieldCheck, Handshake, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
export function AboutPage() {
  const values = [
    {
      icon: ShieldCheck,
      title: 'Otentikasi Digital',
      description: 'Setiap batik diverifikasi dan diberikan QR Code unik sebagai sertifikat keaslian digital, melindungi karya pengrajin dari pemalsuan.',
    },
    {
      icon: Bot,
      title: 'Edukasi Berbasis AI',
      description: 'Kami menyediakan informasi mendalam tentang sejarah, filosofi, dan makna di balik setiap motif batik untuk melestarikan warisan budaya.',
    },
    {
      icon: Handshake,
      title: 'Pemberdayaan Pengrajin',
      description: 'Platform kami menghubungkan pengrajin langsung dengan pasar yang lebih luas, meningkatkan visibilitas dan kesejahteraan ekonomi mereka.',
    },
  ];
  return (
    <AppLayout>
      <div className="bg-background text-foreground">
        {/* Hero Section */}
        <section className="relative batik-background overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/50 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-24 md:py-32 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground"
              >
                Tentang BatikIn
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground"
              >
                Menjembatani tradisi dan teknologi untuk melestarikan dan mempromosikan kekayaan budaya Batik Indonesia kepada dunia.
              </motion.p>
            </div>
          </div>
        </section>
        {/* Mission Section */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1558074581-2ed3b0a7f130?q=80&w=1200&auto=format&fit=crop"
                  alt="Proses membatik"
                  className="rounded-3xl shadow-card aspect-video object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Misi Kami</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  BatikIn lahir dari kecintaan dan kepedulian terhadap kelestarian batik sebagai salah satu warisan budaya takbenda dunia dari Indonesia. Kami percaya bahwa setiap goresan canting memiliki cerita dan setiap motif menyimpan filosofi yang mendalam.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Misi kami adalah memanfaatkan teknologi untuk mengatasi tantangan modern seperti pemalsuan produk, kurangnya regenerasi pengrajin, dan minimnya apresiasi terhadap nilai budaya batik. Dengan sistem otentikasi QR Code dan analisis AI, kami berupaya membangun kembali kepercayaan konsumen dan memberikan nilai tambah bagi karya para pengrajin.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        {/* Values Section */}
        <section className="py-20 md:py-28 batik-texture-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Fokus Utama Kami</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Tiga pilar yang menjadi landasan kami dalam berinovasi untuk budaya.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="p-8 bg-card rounded-3xl text-center shadow-card"
                >
                  <div className="inline-block bg-brand-secondary p-4 rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-brand-accent" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-foreground">{value.title}</h3>
                  <p className="mt-2 text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}