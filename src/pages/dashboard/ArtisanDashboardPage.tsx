import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, QrCode, Palette } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/authStore';
import { useBatikStore } from '@/stores/batikStore';
import type { Batik } from '@shared/types';
import { BatikForm } from '@/components/dashboard/BatikForm';
import { DeleteBatikDialog } from '@/components/dashboard/DeleteBatikDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/EmptyState';
export function ArtisanDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { artisanBatiks, isLoading, fetchArtisanBatiks, createBatik, updateBatik, deleteBatik } = useBatikStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBatik, setSelectedBatik] = useState<Batik | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.id) {
      fetchArtisanBatiks(user.id);
    }
  }, [user, fetchArtisanBatiks]);
  const handleAdd = () => {
    setSelectedBatik(null);
    setIsFormOpen(true);
  };
  const handleEdit = (batik: Batik) => {
    setSelectedBatik(batik);
    setIsFormOpen(true);
  };
  const handleDelete = (batik: Batik) => {
    setSelectedBatik(batik);
    setIsDeleteDialogOpen(true);
  };
  const handleShowQr = (batik: Batik) => {
    navigate(`/dashboard/artisan/qr/${batik.id}`);
  };
  const handleFormSubmit = async (data: Omit<Batik, 'id' | 'artisanId' | 'artisanName'>) => {
    if (selectedBatik) {
      await updateBatik(selectedBatik.id, data);
    } else {
      await createBatik(data);
    }
    setIsFormOpen(false);
  };
  const confirmDelete = async () => {
    if (selectedBatik) {
      await deleteBatik(selectedBatik.id);
    }
    setIsDeleteDialogOpen(false);
  };
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Batik Collection</h1>
          <p className="text-muted-foreground">Manage your authentic batik products.</p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Batik
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>A list of all batiks you have registered.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && !artisanBatiks.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !isLoading && artisanBatiks.length === 0 ? (
            <EmptyState
              icon={Palette}
              title="Your Collection is Empty"
              description="You haven't added any batik products yet. Add your first creation to get started."
              actionText="Add New Batik"
              onActionClick={handleAdd}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {artisanBatiks.map((batik) => (
                  <TableRow key={batik.id}>
                    <TableCell className="hidden sm:table-cell">
                      <img alt={batik.name} className="aspect-square rounded-md object-cover" height="64" src={batik.imageUrl} width="64" />
                    </TableCell>
                    <TableCell className="font-medium">{batik.name}</TableCell>
                    <TableCell>{batik.motif}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(batik)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShowQr(batik)}>
                            <QrCode className="mr-2 h-4 w-4" />Show QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(batik)} className="text-destructive">Delete</DropdownMenuItem>
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
      <BatikForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        batikToEdit={selectedBatik}
        isLoading={isLoading}
      />
      <DeleteBatikDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isLoading}
      />
    </DashboardLayout>
  );
}