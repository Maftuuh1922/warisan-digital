import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, PengrajinDetails } from '@shared/types';
import { api } from '@/lib/api-client';
type LoginCredentials = { email: string; password?: string };
type RegisterData = Omit<User, 'id' | 'status' | 'role'> & Omit<PengrajinDetails, 'userId' | 'qualificationDocumentUrl'> & { password?: string };
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User | null>;
  logout: () => void;
  register: (data: RegisterData) => Promise<User | null>;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const user = await api<User>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
          });
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error) {
          set({ isLoading: false });
          console.error("Login failed:", error);
          return null;
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      register: async (data) => {
        set({ isLoading: true });
        try {
          const newUser = await api<User>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
          });
          set({ isLoading: false });
          // Don't log in the user, they need to be verified first.
          return newUser;
        } catch (error) {
          set({ isLoading: false });
          console.error("Registration failed:", error);
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);