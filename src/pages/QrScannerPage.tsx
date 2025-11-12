import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ScanLine, Upload, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { CameraView } from '@/components/CameraView';interface Card {id?: string | number;[key: string]: unknown;
}interface CardProps {children?: React.ReactNode;className?: string;style?: React.CSSProperties;[key: string]: unknown;}type InputMode = 'upload' | 'camera';
export function QrScannerPage() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const processQrCode = (source: 'file' | 'camera') => {
    setStatus('processing');
    toast.info(`Memproses QR Code dari ${source}...`);

    setTimeout(() => {


      const mockDecodedUrl = `${window.location.origin}/batik/b1`;
      if (mockDecodedUrl.startsWith(window.location.origin) && mockDecodedUrl.includes('/batik/')) {
        setStatus('success');
        toast.success('QR Code valid! Mengarahkan...');
        setTimeout(() => {
          navigate(new URL(mockDecodedUrl).pathname);
        }, 1000);
      } else {
        setStatus('error');
        toast.error('QR Code tidak valid atau bukan dari platform BatikIn.');
      }
    }, 2000);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processQrCode('file');
    }
  };
  const handleCapture = (blob: Blob) => {
    processQrCode('camera');
  };
  const statusInfo = {
    idle: { icon: ScanLine, title: 'Pindai Kode QR', description: 'Gunakan kamera atau unggah gambar untuk memverifikasi keaslian batik.' },
    processing: { icon: ScanLine, title: 'Memproses...', description: 'Harap tunggu, kami sedang memvalidasi Kode QR Anda.' },
    success: { icon: CheckCircle, title: 'Berhasil!', description: 'Kode QR valid. Anda akan diarahkan sebentar lagi.' },
    error: { icon: AlertTriangle, title: 'Gagal!', description: 'Kode QR tidak dapat dibaca atau tidak valid. Silakan coba lagi.' }
  };
  const currentStatus = statusInfo[status];
  const Icon = currentStatus.icon;
  return (
    <AppLayout>
      <div className="bg-brand-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md text-center">

              <Card className="bg-card rounded-2xl shadow-card p-8">
                {inputMode === 'camera' && status === 'idle' ?
                <CameraView onCapture={handleCapture} /> :

                <>
                    <div className="mb-6">
                      <div className={`mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center ${status === 'processing' ? 'animate-pulse' : ''}`}>
                        <Icon className={`h-10 w-10 ${
                      status === 'success' ? 'text-green-500' :
                      status === 'error' ? 'text-red-500' :
                      'text-brand-accent'}`
                      } />
                      </div>
                    </div>
                    <h1 className="text-2xl font-display font-bold text-foreground">{currentStatus.title}</h1>
                    <p className="mt-2 text-muted-foreground">{currentStatus.description}</p>
                  </>
                }
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <div className="mt-8 space-y-3">
                  <Button
                    size="lg"
                    className="w-full rounded-xl"
                    onClick={() => {
                      if (status === 'error') setStatus('idle');
                      setInputMode('camera');
                    }}
                    disabled={status === 'processing' || status === 'success'}>

                    <Camera className="mr-2 h-5 w-5" />
                    Gunakan Kamera
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => {
                      if (status === 'error') setStatus('idle');
                      setInputMode('upload');
                      fileInputRef.current?.click();
                    }}
                    disabled={status === 'processing' || status === 'success'}>

                    <Upload className="mr-2 h-5 w-5" />
                    Unggah Gambar
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>);

}