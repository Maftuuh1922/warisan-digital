import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Batik } from '@shared/types';
import { useEffect } from 'react';
const batikSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  motif: z.string().min(3, { message: 'Motif must be at least 3 characters.' }),
  history: z.string().min(10, { message: 'History must be at least 10 characters.' }),
  imageUrl: z.string().url({ message: 'Please enter a valid image URL.' }),
});
type BatikFormData = z.infer<typeof batikSchema>;
interface BatikFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Batik, 'id' | 'artisanId' | 'artisanName'>) => void;
  batikToEdit?: Batik | null;
  isLoading: boolean;
}
export function BatikForm({ isOpen, onClose, onSubmit, batikToEdit, isLoading }: BatikFormProps) {
  const form = useForm<BatikFormData>({
    resolver: zodResolver(batikSchema),
    defaultValues: {
      name: '',
      motif: '',
      history: '',
      imageUrl: '',
    },
  });
  useEffect(() => {
    if (batikToEdit) {
      form.reset(batikToEdit);
    } else {
      form.reset({
        name: '',
        motif: '',
        history: '',
        imageUrl: '',
      });
    }
  }, [batikToEdit, form]);
  const handleFormSubmit = (data: BatikFormData) => {
    onSubmit(data);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{batikToEdit ? 'Edit Batik' : 'Add New Batik'}</DialogTitle>
          <DialogDescription>
            {batikToEdit ? 'Update the details of your batik.' : 'Fill in the details for your new batik creation.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Batik Parang Kusumo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="motif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Parang" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>History & Meaning</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the history and meaning of the motif..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}