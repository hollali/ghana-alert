import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockUser } from '@/src/data/user';
import { usePrefsStore } from '@/src/store/prefsStore';
import { useReportsStore } from '@/src/store/reportsStore';
import { useSavedStore } from '@/src/store/savedStore';
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
      login: (email) => {
        useSavedStore.getState().clear();
        useReportsStore.getState().clear();
        usePrefsStore.getState().clear();
        const trimmedEmail = email.trim();
        set({
          isLoggedIn: true,
          user: {
            ...mockUser,
            email: trimmedEmail || mockUser.email,
            name: trimmedEmail.split('@')[0] || mockUser.name,
          },
        });
      },
      register: (name, email) => {
        useSavedStore.getState().clear();
        useReportsStore.getState().clear();
        usePrefsStore.getState().clear();
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        set({
          isLoggedIn: true,
          hasSeenOnboarding: true,
          user: {
            ...mockUser,
            name: trimmedName || mockUser.name,
            email: trimmedEmail || mockUser.email,
          },
        });
      },
      logout: () => {
        useSavedStore.getState().clear();
        useReportsStore.getState().clear();
        usePrefsStore.getState().clear();
        set({ isLoggedIn: false, user: mockUser });
      },
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
