import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { Batik } from '@shared/types';
import { ArrowLeft, Printer } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
const BatikIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" stroke="#3E2723" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#D4AF37" fillOpacity="0.3"/>
  </svg>
);
export function PrintQrPage() {
  const { batikId } = useParams<{ batikId: string }>();
  const [batik, setBatik] = useState<Batik | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  useEffect(() => {
    const fetchBatik = async () => {
      if (!batikId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api<Batik>(`/api/batiks/${batikId}`);
        if (user?.role !== 'admin' && data.artisanId !== user?.id) {
          setError('You are not authorized to view this QR code.');
        } else {
          setBatik(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load batik details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBatik();
  }, [batikId, user]);
  const handlePrint = () => {
    window.print();
  };
  const qrUrl = `${window.location.origin}/batik/${batikId}`;
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4 print:bg-white">
      <div className="absolute top-4 left-4 print:hidden">
        <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      <div className="w-full max-w-md mx-auto bg-card p-8 rounded-2xl shadow-card print:shadow-none print:border print:border-foreground">
        {isLoading ? (
          <div className="flex flex-col items-center space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 w-64 rounded-lg" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : error || !batik ? (
          <div className="text-center text-destructive">
            <h2 className="text-xl font-bold">Error</h2>
            <p>{error || 'Batik not found.'}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-2 text-xl font-display font-bold text-foreground">
              <BatikIcon />
              <span>BatikIn</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-foreground">{batik.name}</h1>
            <p className="text-muted-foreground">by {batik.artisanName}</p>
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG value={qrUrl} size={256} level="H" includeMargin={true} />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Scan this QR code to verify the authenticity and discover the story of this unique batik.
            </p>
            <Button onClick={handlePrint} className="w-full print:hidden rounded-xl">
              <Printer className="mr-2 h-4 w-4" />
              Print Tag
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}