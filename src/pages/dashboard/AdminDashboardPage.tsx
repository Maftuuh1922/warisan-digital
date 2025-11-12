import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MOCK_USERS, MOCK_PENGRAJIN_DETAILS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
export function AdminDashboardPage() {
  const artisans = MOCK_USERS.filter(u => u.role === 'artisan');
  const handleStatusChange = (userId: string, status: 'verified' | 'rejected') => {
    // This is a mock update. In a real app, this would be an API call.
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      user.status = status;
      toast.success(`Artisan ${user.name} has been ${status}.`);
      // Force a re-render if needed, though in a real app state management would handle this.
    }
  };
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Artisan Verification</h1>
          <p className="text-muted-foreground">Review and manage artisan registration requests.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>A list of all artisans and their verification status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artisan Name</TableHead>
                <TableHead>Store Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artisans.map((artisan) => {
                const details = MOCK_PENGRAJIN_DETAILS.find(d => d.userId === artisan.id);
                return (
                  <TableRow key={artisan.id}>
                    <TableCell className="font-medium">{artisan.name}</TableCell>
                    <TableCell>{details?.storeName || 'N/A'}</TableCell>
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
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(artisan.id, 'verified')}>Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(artisan.id, 'rejected')} className="text-destructive">Reject</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}