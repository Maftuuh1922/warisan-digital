import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, UploadCloud, Sparkles, FileImage, X, Camera, Percent, ShieldCheck, BookOpen, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { processImageForML } from '@/lib/image-processor';
import { CameraView } from '@/components/CameraView';
import type { MLAnalysisResult } from '@shared/types';
import { Progress } from '@/components/ui/progress';
type InputMode = 'upload' | 'camera';
const GradCamOverlay = ({ isVisible }: { isVisible: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (isVisible && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      // Simulate 3-4 "hotspots"
      for (let i = 0; i < 4; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * (width / 4) + (width / 8);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 0, 0, 0.6)`);
        gradient.addColorStop(0.5, `rgba(255, 255, 0, 0.4)`);
        gradient.addColorStop(1, `rgba(0, 255, 255, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
    }
  }, [isVisible]);
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
        >
          <canvas ref={canvasRef} className="w-full h-full opacity-50 mix-blend-screen" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export function AiAnalysisPage() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MLAnalysisResult | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [showGradCam, setShowGradCam] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }
      const newFile = new File([file], file.name, { type: file.type });
      setImage(newFile);
      setPreviewUrl(URL.createObjectURL(newFile));
      setResult(null);
      setShowGradCam(false);
    }
  };
  const handleCapture = (blob: Blob) => {
    const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setImage(capturedFile);
    setPreviewUrl(URL.createObjectURL(capturedFile));
    setInputMode('upload'); // Switch back to upload view to show preview
    setResult(null);
    setShowGradCam(false);
  };
  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    setResult(null);
    setShowGradCam(false);
    toast.info('Menganalisis motif batik Anda...');
    try {
      const processedBlob = await processImageForML(image);
      const formData = new FormData();
      formData.append('image', processedBlob, image.name);
      const analysisResult = await api<MLAnalysisResult>('/api/classify-batik', {
        method: 'POST',
        headers: { 'Content-Type': undefined as any },
        body: formData,
      });
      setResult(analysisResult);
      toast.success('Analisis berhasil diselesaikan!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(error instanceof Error ? error.message : 'Analisis gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveImage = () => {
    setImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setResult(null);
    setShowGradCam(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const renderResult = () => (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-brand-primary border-none rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-2xl flex items-center gap-2"><Sparkles className="text-brand-accent" /> Hasil Analisis</CardTitle>
          <CardDescription>Ini yang kami temukan dari gambar Anda:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-muted-foreground">Prediksi Motif Teratas</h4>
            <p className="text-xl font-bold text-foreground">{result?.top_prediction.motif}</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={(result?.top_prediction.confidence ?? 0) * 100} className="w-full" />
              <span className="font-mono text-sm font-semibold">{((result?.top_prediction.confidence ?? 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BookOpen size={20} /> Filosofi & Konteks</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-foreground/90">{result?.philosophy.description}</p>
          <p className="text-sm text-muted-foreground italic">{result?.philosophy.historical_context}</p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck size={20} /> Analisis Keaslian</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="font-bold text-lg text-green-700">{result?.authenticity.label}</p>
            <p className="font-mono text-lg font-semibold">{((result?.authenticity.confidence ?? 0) * 100).toFixed(1)}%</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Fitur yang dianalisis:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
            {result?.authenticity.features_analyzed.map(f => <li key={f}>{f}</li>)}
          </ul>
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Percent size={20} /> Prediksi Lainnya</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {result?.other_predictions.map(p => (
            <div key={p.motif}>
              <div className="flex justify-between text-sm">
                <p className="font-medium">{p.motif}</p>
                <p className="font-mono">{ (p.confidence * 100).toFixed(1) }%</p>
              </div>
              <Progress value={p.confidence * 100} className="h-2 mt-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
  return (
    <AppLayout>
      <div className="bg-background text-foreground">
        <section className="bg-brand-primary border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-20 md:py-28 text-center">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">Analisis Motif Cerdas</motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Unggah gambar batik dan biarkan AI kami mengungkap cerita di balik motifnya.</motion.p>
            </div>
          </div>
        </section>
        <main>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-16 md:py-24">
              <Card className="rounded-2xl shadow-card border-none p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-full">
                      {inputMode === 'upload' ? (
                        <AnimatePresence mode="wait">
                          {previewUrl ? (
                            <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full aspect-square rounded-xl overflow-hidden border">
                              <img src={previewUrl} alt="Batik preview" className="w-full h-full object-cover" />
                              <GradCamOverlay isVisible={showGradCam} />
                              <Button size="icon" variant="destructive" className="absolute top-3 right-3 rounded-full h-8 w-8 z-10" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button>
                              {result && (
                                <Button size="sm" variant="secondary" className="absolute bottom-3 left-3 rounded-full z-10" onClick={() => setShowGradCam(!showGradCam)}>
                                  <Eye className="mr-2 h-4 w-4" /> {showGradCam ? 'Hide' : 'Show'} AI Focus
                                </Button>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-brand-accent transition-colors" onClick={() => fileInputRef.current?.click()}>
                              <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                              <h3 className="font-semibold text-foreground">Klik untuk mengunggah</h3>
                              <p className="text-sm text-muted-foreground mt-1">PNG, JPG, atau WEBP (maks. 5MB)</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      ) : (
                        <CameraView onCapture={handleCapture} onClose={() => setInputMode('upload')} />
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleFileChange} />
                    <Button variant="outline" className="w-full rounded-xl" onClick={() => setInputMode(inputMode === 'upload' ? 'camera' : 'upload')} disabled={isLoading}>
                      <Camera className="mr-2 h-4 w-4" /> {inputMode === 'upload' ? 'Gunakan Kamera' : 'Unggah File'}
                    </Button>
                    <Button size="lg" className="w-full rounded-xl" onClick={handleAnalyze} disabled={!image || isLoading}>
                      {isLoading ? (<><Sparkles className="mr-2 h-5 w-5 animate-pulse" /> Menganalisis...</>) : (<><Bot className="mr-2 h-5 w-5" /> Analisis Gambar</>)}
                    </Button>
                  </div>
                  <div className="min-h-[300px]">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center">
                          <Sparkles className="h-12 w-12 text-brand-accent animate-pulse" />
                          <p className="mt-4 font-medium text-muted-foreground">AI sedang bekerja...</p>
                        </motion.div>
                      ) : result ? (
                        renderResult()
                      ) : (
                        <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted rounded-2xl">
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