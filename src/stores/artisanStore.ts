import { create } from 'zustand';
import { api } from '@/lib/api-client';
import type { User, PengrajinDetails } from '@shared/types';
import { toast } from 'sonner';
export type ArtisanWithDetails = User & { details?: PengrajinDetails };
interface ArtisanState {
  artisans: ArtisanWithDetails[];
  selectedArtisan: ArtisanWithDetails | null;
  isLoading: boolean;
  error: string | null;
  fetchArtisans: () => Promise<void>;
  fetchArtisanDetails: (userId: string) => Promise<void>;
  updateArtisanStatus: (userId: string, status: 'verified' | 'rejected') => Promise<void>;
}
export const useArtisanStore = create<ArtisanState>((set) => ({
  artisans: [],
  selectedArtisan: null,
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
  fetchArtisanDetails: async (userId: string) => {
    set({ isLoading: true, error: null, selectedArtisan: null });
    try {
      const artisanDetails = await api<ArtisanWithDetails>(`/api/artisans/${userId}`);
      set({ selectedArtisan: artisanDetails, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch artisan details';
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  },
  updateArtisanStatus: async (userId, status) => {
    // Set loading for the specific item if possible, otherwise global loading is fine for now
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