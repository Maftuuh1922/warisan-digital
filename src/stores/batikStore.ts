import { create } from 'zustand';
import { api } from '@/lib/api-client';
import type { Batik } from '@shared/types';
import { toast } from 'sonner';
type BatikCreateData = Omit<Batik, 'id' | 'artisanId' | 'artisanName'>;
type BatikUpdateData = Partial<BatikCreateData>;
interface BatikState {
  batiks: Batik[];
  artisanBatiks: Batik[];
  isLoading: boolean;
  error: string | null;
  fetchAllBatiks: () => Promise<void>;
  fetchArtisanBatiks: (artisanId: string) => Promise<void>;
  createBatik: (data: BatikCreateData) => Promise<Batik | null>;
  updateBatik: (id: string, data: BatikUpdateData) => Promise<Batik | null>;
  deleteBatik: (id: string) => Promise<void>;
}
export const useBatikStore = create<BatikState>((set, get) => ({
  batiks: [],
  artisanBatiks: [],
  isLoading: false,
  error: null,
  fetchAllBatiks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { items } = await api<{ items: Batik[] }>('/api/batiks');
      set({ batiks: items, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch batiks';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },
  fetchArtisanBatiks: async (artisanId) => {
    set({ isLoading: true, error: null });
    try {
      const batiks = await api<Batik[]>(`/api/batiks/artisan/${artisanId}`);
      set({ artisanBatiks: batiks, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch your batiks';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },
  createBatik: async (data) => {
    set({ isLoading: true });
    try {
      const newBatik = await api<Batik>('/api/batiks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set((state) => ({
        artisanBatiks: [...state.artisanBatiks, newBatik],
        isLoading: false,
      }));
      toast.success('Batik created successfully!');
      return newBatik;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create batik';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  },
  updateBatik: async (id, data) => {
    set({ isLoading: true });
    try {
      const updatedBatik = await api<Batik>(`/api/batiks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      set((state) => ({
        artisanBatiks: state.artisanBatiks.map((b) => (b.id === id ? updatedBatik : b)),
        isLoading: false,
      }));
      toast.success('Batik updated successfully!');
      return updatedBatik;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update batik';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      return null;
    }
  },
  deleteBatik: async (id) => {
    set({ isLoading: true });
    try {
      await api(`/api/batiks/${id}`, { method: 'DELETE' });
      set((state) => ({
        artisanBatiks: state.artisanBatiks.filter((b) => b.id !== id),
        isLoading: false,
      }));
      toast.success('Batik deleted successfully.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete batik';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },
}));