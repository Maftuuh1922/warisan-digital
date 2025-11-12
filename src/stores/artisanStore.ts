import { create } from 'zustand';
import { api } from '@/lib/api-client';
import type { User, PengrajinDetails } from '@shared/types';
import { toast } from 'sonner';
type ArtisanWithDetails = User & { details?: PengrajinDetails };
interface ArtisanState {
  artisans: ArtisanWithDetails[];
  isLoading: boolean;
  error: string | null;
  fetchArtisans: () => Promise<void>;
  updateArtisanStatus: (userId: string, status: 'verified' | 'rejected') => Promise<void>;
}
export const useArtisanStore = create<ArtisanState>((set, get) => ({
  artisans: [],
  isLoading: false,
  error: null,
  fetchArtisans: async () => {
    set({ isLoading: true, error: null });
    try {
      const { items } = await api<{ items: ArtisanWithDetails[] }>('/api/artisans');
      set({ artisans: items, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch artisans';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },
  updateArtisanStatus: async (userId, status) => {
    set({ isLoading: true });
    try {
      const updatedArtisan = await api<User>(`/api/artisans/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      set((state) => ({
        artisans: state.artisans.map((artisan) =>
          artisan.id === userId ? { ...artisan, status: updatedArtisan.status } : artisan
        ),
        isLoading: false,
      }));
      toast.success(`Artisan has been ${status}.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },
}));