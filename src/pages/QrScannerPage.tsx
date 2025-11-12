import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ScanLine, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
export function QrScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('processing');
      toast.info('Memproses gambar QR Code...');
      // Simulate QR code decoding and redirection
      setTimeout(() => {
        // In a real app, you would use a library like jsQR to decode the image.
        // Here, we simulate a successful scan and redirect.
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
          setFile(null);
        }
      }, 2000);
    }
  };
  const statusInfo = {
    idle: {
      icon: ScanLine,
      title: 'Pindai Kode QR',
      description: 'Unggah gambar Kode QR untuk memverifikasi keaslian batik.',
      buttonText: 'Pilih Gambar',
    },
    processing: {
      icon: ScanLine,
      title: 'Memproses...',
      description: 'Harap tunggu, kami sedang memvalidasi Kode QR Anda.',
      buttonText: 'Memproses...',
    },
    success: {
      icon: CheckCircle,
      title: 'Berhasil!',
      description: 'Kode QR valid. Anda akan diarahkan sebentar lagi.',
      buttonText: 'Berhasil',
    },
    error: {
      icon: AlertTriangle,
      title: 'Gagal!',
      description: 'Kode QR tidak dapat dibaca atau tidak valid. Silakan coba lagi.',
      buttonText: 'Coba Lagi',
    },
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
              className="w-full max-w-md text-center"
            >
              <div className="bg-card rounded-2xl shadow-card p-8">
                <div className="mb-6">
                  <div className={`mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center ${status === 'processing' ? 'animate-pulse' : ''}`}>
                    <Icon className={`h-10 w-10 ${
                      status === 'success' ? 'text-green-500' :
                      status === 'error' ? 'text-red-500' :
                      'text-brand-accent'
                    }`} />
                  </div>
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground">{currentStatus.title}</h1>
                <p className="mt-2 text-muted-foreground">{currentStatus.description}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  size="lg"
                  className="w-full mt-8 rounded-xl"
                  onClick={() => {
                    if (status === 'error') {
                      setStatus('idle');
                      setFile(null);
                    }
                    fileInputRef.current?.click();
                  }}
                  disabled={status === 'processing' || status === 'success'}
                >
                  {status !== 'idle' && status !== 'error' && <Upload className="mr-2 h-5 w-5" />}
                  {currentStatus.buttonText}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}