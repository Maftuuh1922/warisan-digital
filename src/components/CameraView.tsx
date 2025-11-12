import React from 'react';
import { useCamera } from '@/hooks/use-camera';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface CameraViewProps {
  onCapture: (blob: Blob) => void;
  onClose?: () => void;
}
export function CameraView({ onCapture, onClose }: CameraViewProps) {
  const { videoRef, stream, error, startCamera, stopCamera, captureFrame } = useCamera();
  const handleCapture = async () => {
    try {
      const blob = await captureFrame();
      onCapture(blob);
      stopCamera();
    } catch (err) {
      console.error('Capture failed:', err);
    }
  };
  const handleStart = () => {
    startCamera();
  };
  return (
    <div className="w-full aspect-square rounded-xl overflow-hidden border bg-muted flex items-center justify-center relative">
      <AnimatePresence mode="wait">
        {stream ? (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <mask id="camera-mask">
                  <rect width="100" height="100" fill="white" />
                  <rect x="20" y="20" width="60" height="60" rx="5" fill="black" />
                </mask>
              </defs>
              <rect width="100" height="100" fill="rgba(0,0,0,0.5)" mask="url(#camera-mask)" />
              <rect x="20" y="20" width="60" height="60" rx="5" fill="transparent" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
              <path d="M 25 20 L 20 20 L 20 25" stroke="white" strokeWidth="2" fill="none" />
              <path d="M 75 20 L 80 20 L 80 25" stroke="white" strokeWidth="2" fill="none" />
              <path d="M 25 80 L 20 80 L 20 75" stroke="white" strokeWidth="2" fill="none" />
              <path d="M 75 80 L 80 80 L 80 75" stroke="white" strokeWidth="2" fill="none" />
            </svg>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Button size="icon" className="rounded-full w-16 h-16" onClick={handleCapture}>
                <Camera className="h-8 w-8" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center p-4"
          >
            {error ? (
              <>
                <CameraOff className="h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive font-medium">Camera Error</p>
                <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
                <Button variant="outline" className="mt-4" onClick={handleStart}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </>
            ) : (
              <>
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Start your camera to begin.</p>
                <Button className="mt-4" onClick={handleStart}>
                  Start Camera
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 rounded-full z-10"
          onClick={onClose}
        >
          <CameraOff className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}