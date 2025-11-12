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
          <h1 className="text-3xl font-bold">Artisan Verification</h1>
          <p className="text-muted-foreground">Review and manage artisan registration requests.</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchArtisans} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>A list of all artisans and their verification status.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !artisans.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artisan Name</TableHead>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !isLoading && artisans.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No Pending Requests"
              description="There are currently no new artisan registration requests to review."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artisan Name</TableHead>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
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
                        className={cn(artisan.status === 'verified' && 'bg-green-600 text-white')}
                      >
                        {artisan.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isLoading}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewDetails(artisan.id)}>View Details</DropdownMenuItem>
                          {artisan.status !== 'verified' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(artisan.id, 'verified')}>Approve</DropdownMenuItem>
                          )}
                          {artisan.status !== 'rejected' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(artisan.id, 'rejected')} className="text-destructive">Reject</DropdownMenuItem>
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