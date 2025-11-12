import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@shared/types';
import { MOCK_USERS } from '@/lib/mock-data';
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => User | null;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'status'>) => User;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string) => {
        const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
          set({ user, isAuthenticated: true });
          return user;
        }
        return null;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      register: (userData) => {
        const newUser: User = {
          ...userData,
          id: `a${MOCK_USERS.length + 1}`,
          status: 'pending',
        };
        // In a real app, this would be an API call
        MOCK_USERS.push(newUser);
        console.log("New user registered (mock):", newUser);
        return newUser;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);