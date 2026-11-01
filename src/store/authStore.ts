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
  password: string;
  login: (email: string, password?: string) => void;
  register: (name: string, email: string, password?: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateProfile: (updates: { name?: string; avatarUrl?: string | null }) => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      hasSeenOnboarding: false,
      user: mockUser,
      password: '',
      login: (email, password = '') => {
        useSavedStore.getState().clear();
        useReportsStore.getState().clear();
        usePrefsStore.getState().clear();
        const trimmedEmail = email.trim();
        set({
          isLoggedIn: true,
          password,
          user: {
            ...mockUser,
            email: trimmedEmail || mockUser.email,
            name: trimmedEmail.split('@')[0] || mockUser.name,
          },
        });
      },
      register: (name, email, password = '') => {
        useSavedStore.getState().clear();
        useReportsStore.getState().clear();
        usePrefsStore.getState().clear();
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        set({
          isLoggedIn: true,
          hasSeenOnboarding: true,
          password,
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
        set({ isLoggedIn: false, user: mockUser, password: '' });
      },
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      updateProfile: (updates) =>
        set((state) => ({
          user: {
            ...state.user,
            ...(updates.name !== undefined ? { name: updates.name.trim() || state.user.name } : {}),
            ...(updates.avatarUrl !== undefined
              ? { avatarUrl: updates.avatarUrl ?? undefined }
              : {}),
          },
        })),
      changePassword: (currentPassword, newPassword) => {
        const state = useAuthStore.getState();
        if (state.password && state.password !== currentPassword) return false;
        set({ password: newPassword });
        return true;
      },
    }),
    {
      name: 'ghanaalert-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        hasSeenOnboarding: state.hasSeenOnboarding,
        user: state.user,
        password: state.password,
      }),
    },
  ),
);
