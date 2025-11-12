import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, UploadCloud, Sparkles, FileImage, X } from 'lucide-react';
import { toast } from 'sonner';
import { batikDataset, type BatikInfo } from '@/lib/batik-dataset';
export function AiAnalysisPage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BatikInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };
  const handleAnalyze = () => {
    if (!image) return;
    setIsLoading(true);
    setResult(null);
    toast.info('Menganalisis motif batik Anda...');
    // Simulate AI analysis by picking a random entry from the dataset
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * batikDataset.length);
      const randomBatik = batikDataset[randomIndex];
      setResult(randomBatik);
      setIsLoading(false);
      toast.success('Analisis berhasil diselesaikan!');
    }, 2500);
  };
  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
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
                Analisis Motif Cerdas
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground"
              >
                Unggah gambar batik dan biarkan AI kami mengungkap cerita di balik motifnya.
              </motion.p>
            </div>
          </div>
        </section>
        {/* Main Content */}
        <main>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16 md:py-24">
              <Card className="rounded-2xl shadow-card border-none p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Image Upload */}
                  <div className="flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                      {previewUrl ? (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="relative w-full aspect-square rounded-xl overflow-hidden border"
                        >
                          <img src={previewUrl} alt="Batik preview" className="w-full h-full object-cover" />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-3 right-3 rounded-full h-8 w-8"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="upload"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-brand-accent transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-semibold text-foreground">Klik untuk mengunggah</h3>
                          <p className="text-sm text-muted-foreground mt-1">PNG, JPG, atau WEBP (maks. 5MB)</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      size="lg"
                      className="w-full mt-6 rounded-xl"
                      onClick={handleAnalyze}
                      disabled={!image || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                          Menganalisis...
                        </>
                      ) : (
                        <>
                          <Bot className="mr-2 h-5 w-5" />
                          Analisis Gambar
                        </>
                      )}
                    </Button>
                  </div>
                  {/* Analysis Result */}
                  <div className="min-h-[300px]">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center h-full text-center"
                        >
                          <Sparkles className="h-12 w-12 text-brand-accent animate-pulse" />
                          <p className="mt-4 font-medium text-muted-foreground">AI sedang bekerja...</p>
                        </motion.div>
                      ) : result ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card className="bg-brand-primary border-none rounded-2xl">
                            <CardHeader>
                              <CardTitle className="font-display text-2xl">Hasil Analisis</CardTitle>
                              <CardDescription>Ini yang kami temukan dari gambar Anda:</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-muted-foreground">Motif</h4>
                                <p className="text-lg font-bold text-foreground">{result.motif}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-muted-foreground">Asal Daerah</h4>
                                <p className="text-lg font-bold text-foreground">{result.origin}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-muted-foreground">Filosofi</h4>
                                <p className="text-foreground/90">{result.philosophy}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="initial"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted rounded-2xl"
                        >
                          <FileImage className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-semibold text-foreground">Hasil analisis akan muncul di sini</h3>
                          <p className="text-sm text-muted-foreground mt-1">Unggah gambar untuk memulai.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}