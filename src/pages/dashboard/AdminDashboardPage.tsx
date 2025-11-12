import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, RefreshCw, UserPlus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useArtisanStore } from '@/stores/artisanStore';
import { Skeleton } from '@/components/ui/skeleton';
import { ArtisanDetailModal } from '@/components/dashboard/ArtisanDetailModal';
import { EmptyState } from '@/components/EmptyState';
export function AdminDashboardPage() {
  const fetchArtisans = useArtisanStore((s) => s.fetchArtisans);
  const artisans = useArtisanStore((s) => s.artisans);
  const isLoading = useArtisanStore((s) => s.isLoading);
  const updateArtisanStatus = useArtisanStore((s) => s.updateArtisanStatus);
  const fetchArtisanDetails = useArtisanStore((s) => s.fetchArtisanDetails);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  useEffect(() => {
    fetchArtisans();
  }, [fetchArtisans]);
  const handleStatusChange = (userId: string, status: 'verified' | 'rejected') => {
    updateArtisanStatus(userId, status);
  };
  const handleViewDetails = (userId: string) => {
    fetchArtisanDetails(userId);
    setIsDetailModalOpen(true);
  };
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Verifikasi Pengrajin</h1>
          <p className="text-muted-foreground">Tinjau dan kelola permintaan pendaftaran pengrajin.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchArtisans} disabled={isLoading} className="rounded-2xl">
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>
      <Card className="rounded-3xl shadow-card border-none">
        <CardHeader>
          <CardTitle className="font-display">Permintaan Verifikasi</CardTitle>
          <CardDescription>Daftar semua pengrajin dan status verifikasi mereka.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !artisans.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pengrajin</TableHead>
                  <TableHead>Nama Toko</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Aksi</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !isLoading && artisans.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="Tidak Ada Permintaan"
              description="Saat ini tidak ada permintaan pendaftaran pengrajin baru untuk ditinjau."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Pengrajin</TableHead>
                  <TableHead>Nama Toko</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Aksi</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artisans.map((artisan) => (
                  <TableRow key={artisan.id}>
                    <TableCell className="font-medium">{artisan.name}</TableCell>
                    <TableCell>{artisan.details?.storeName || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          artisan.status === 'verified' ? 'default'
                          : artisan.status === 'pending' ? 'secondary'
                          : 'destructive'
                        }
                        className={cn('capitalize', artisan.status === 'verified' && 'bg-green-100 text-green-800 border-green-200')}
                      >
                        {artisan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isLoading} className="rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(artisan.id)}>Lihat Detail</DropdownMenuItem>
                          {artisan.status !== 'verified' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(artisan.id, 'verified')}>Setujui</DropdownMenuItem>
                          )}
                          {artisan.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(artisan.id, 'rejected')} className="text-destructive">Tolak</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ArtisanDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
    </DashboardLayout>
  );
}