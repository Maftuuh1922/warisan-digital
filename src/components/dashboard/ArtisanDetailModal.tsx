import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useArtisanStore, type ArtisanWithDetails } from '@/stores/artisanStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Store, MapPin, Phone } from 'lucide-react';
interface ArtisanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function ArtisanDetailModal({ isOpen, onClose }: ArtisanDetailModalProps) {
  const selectedArtisan = useArtisanStore((s) => s.selectedArtisan);
  const isLoading = useArtisanStore((s) => s.isLoading);
  const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-1" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-base text-foreground">{value || 'N/A'}</span>
      </div>
    </div>
  );
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Artisan Details</DialogTitle>
          <DialogDescription>
            Review the information submitted by the artisan.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {isLoading || !selectedArtisan ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-brand-primary">{selectedArtisan.name}</h3>
              <div className="space-y-4">
                <DetailRow icon={Mail} label="Email" value={selectedArtisan.email} />
                <DetailRow icon={Store} label="Store Name" value={selectedArtisan.details?.storeName} />
                <DetailRow icon={MapPin} label="Store Address" value={selectedArtisan.details?.address} />
                <DetailRow icon={Phone} label="Phone Number" value={selectedArtisan.details?.phoneNumber} />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}