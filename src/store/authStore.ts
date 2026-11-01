import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockUser } from '@/src/data/user';
import type { User } from '@/src/types';

interface AuthState {
  isLoggedIn: boolean;
  hasSeenOnboarding: boolean;
  user: User;
  login: (email: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      hasSeenOnboarding: false,
      user: mockUser,
      login: (email) =>
        set((state) => ({
          isLoggedIn: true,
          user: { ...state.user, email: email.trim() || state.user.email },
        })),
      register: (name, email) =>
        set((state) => ({
          isLoggedIn: true,
          hasSeenOnboarding: true,
          user: {
            ...state.user,
            name: name.trim() || state.user.name,
            email: email.trim() || state.user.email,
          },
        })),
      logout: () => set({ isLoggedIn: false }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: 'ghanaalert-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        hasSeenOnboarding: state.hasSeenOnboarding,
        user: state.user,
      }),
    },
  ),
);
