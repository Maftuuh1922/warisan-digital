import { useState } from 'react';
import QRCode from 'qrcode.react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, PlusCircle, QrCode } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MOCK_BATIK_DATA } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/authStore';
import type { Batik } from '@shared/types';
export function ArtisanDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const artisanBatiks = MOCK_BATIK_DATA.filter(b => b.artisanId === user?.id);
  const [selectedBatik, setSelectedBatik] = useState<Batik | null>(null);
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Batik Collection</h1>
          <p className="text-muted-foreground">Manage your authentic batik products.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Batik
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>A list of all batiks you have registered.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
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
                    <Dialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={() => setSelectedBatik(batik)}>
                              <QrCode className="mr-2 h-4 w-4" />
                              Show QR Code
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {selectedBatik && (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>QR Code for {selectedBatik.name}</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col items-center justify-center p-8 gap-4">
                            <QRCode
                              value={`${window.location.origin}/batik/${selectedBatik.id}`}
                              size={256}
                              level="H"
                              includeMargin={true}
                            />
                            <p className="text-sm text-muted-foreground text-center">
                              Scan this code to view the batik's authentication page.
                            </p>
                            <Button onClick={() => window.print()}>Print QR Code</Button>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}