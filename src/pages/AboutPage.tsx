import { AppLayout } from '@/components/layout/AppLayout';
import { Feather, Target, ShieldCheck, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';
export function AboutPage() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Otentikasi Digital',
      description: 'Setiap batik diverifikasi dan diberikan QR Code unik sebagai sertifikat keaslian digital, melindungi karya pengrajin dari pemalsuan.',
    },
    {
      icon: Target,
      title: 'Edukasi Budaya',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24 lg:py-32">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Feather className="mx-auto h-12 w-12 text-brand-accent" />
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-brand-primary">
              Tentang Warisan Digital
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
              Menjembatani tradisi dan teknologi untuk melestarikan dan mempromosikan kekayaan budaya Batik Indonesia kepada dunia.
            </p>
          </motion.div>
          {/* Mission Section */}
          <div className="mt-20 md:mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src="https://images.unsplash.com/photo-1558074581-2ed3b0a7f130?q=80&w=1200&auto=format&fit=crop"
                alt="Proses membatik"
                className="rounded-lg shadow-xl aspect-video object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-brand-primary">Misi Kami</h2>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Warisan Digital lahir dari kecintaan dan kepedulian terhadap kelestarian batik sebagai salah satu warisan budaya takbenda dunia dari Indonesia. Kami percaya bahwa setiap goresan canting memiliki cerita dan setiap motif menyimpan filosofi yang mendalam.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Misi kami adalah memanfaatkan teknologi untuk mengatasi tantangan modern seperti pemalsuan produk, kurangnya regenerasi pengrajin, dan minimnya apresiasi terhadap nilai budaya batik. Dengan sistem otentikasi QR Code, kami berupaya membangun kembali kepercayaan konsumen dan memberikan nilai tambah bagi karya para pengrajin.
              </p>
            </motion.div>
          </div>
          {/* Features Section */}
          <div className="mt-20 md:mt-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-brand-primary">Fokus Utama Kami</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.2 }}
                  className="p-8 bg-secondary rounded-lg text-center"
                >
                  <feature.icon className="mx-auto h-10 w-10 text-brand-accent mb-4" />
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}