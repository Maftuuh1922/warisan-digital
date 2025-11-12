import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useArtisanStore, type ArtisanWithDetails } from '@/stores/artisanStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Store, MapPin, Phone, FileText, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
interface ArtisanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function ArtisanDetailModal({ isOpen, onClose }: ArtisanDetailModalProps) {
  const selectedArtisan = useArtisanStore((s) => s.selectedArtisan);
  const isLoading = useArtisanStore((s) => s.isLoading);
  const DetailRow = ({ icon: Icon, label, value, isLink = false }: { icon: React.ElementType, label: string, value?: string, isLink?: boolean }) => (
    <div className="flex items-start space-x-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      <div className="flex flex-col overflow-hidden">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {isLink && value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-brand-accent hover:underline truncate inline-flex items-center"
          >
            {value} <ExternalLink className="h-4 w-4 ml-1 flex-shrink-0" />
          </a>
        ) : (
          <span className="text-base text-foreground">{value || 'N/A'}</span>
        )}
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
              <Skeleton className="h-5 w-full" />
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-brand-primary">{selectedArtisan.name}</h3>
              <div className="space-y-4">
                <DetailRow icon={Mail} label="Email" value={selectedArtisan.email} />
                <DetailRow icon={Store} label="Store Name" value={selectedArtisan.details?.storeName} />
                <DetailRow icon={MapPin} label="Store Address" value={selectedArtisan.details?.address} />
                <DetailRow icon={Phone} label="Phone Number" value={selectedArtisan.details?.phoneNumber} />
                <DetailRow 
                  icon={FileText} 
                  label="Qualification Document" 
                  value={selectedArtisan.details?.qualificationDocumentUrl} 
                  isLink={!!selectedArtisan.details?.qualificationDocumentUrl}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}