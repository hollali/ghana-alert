import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  changePassword as apiChangePassword,
  clearAuthStorage,
  getSession,
  signInEmail,
  signOut as apiSignOut,
  signUpEmail,
} from '@/src/lib/neonAuth';
import { usePrefsStore } from '@/src/store/prefsStore';
import { useReportsStore } from '@/src/store/reportsStore';
import { useSavedStore } from '@/src/store/savedStore';
import type { User } from '@/src/types';

interface AuthState {
  isLoggedIn: boolean;
  hasSeenOnboarding: boolean;
  user: User | null;
  isLoading: boolean;
  isRestoring: boolean;
  error: string | null;
  restore: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  updateProfile: (updates: { name?: string; avatarUrl?: string | null }) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

function messageFromError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

function clearUserData(): void {
  useSavedStore.getState().clear();
  useReportsStore.getState().clear();
  usePrefsStore.getState().clear();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      hasSeenOnboarding: false,
      user: null,
      isLoading: false,
      isRestoring: true,
      error: null,

      restore: async () => {
        set({ isRestoring: true, error: null });
        try {
          const session = await getSession();
          if (session) {
            set({
              isLoggedIn: true,
              user: session.user,
              error: null,
            });
          } else {
            set({ isLoggedIn: false, user: null });
          }
        } catch {
          set({ isLoggedIn: false, user: null });
        } finally {
          set({ isRestoring: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          clearUserData();
          const result = await signInEmail({ email, password });
          // Confirm session (sets cookie + JWT)
          const session = (await getSession()) ?? result;
          set({
            isLoggedIn: true,
            user: session.user,
            error: null,
          });
        } catch (error) {
          await clearAuthStorage();
          set({ isLoggedIn: false, user: null, error: messageFromError(error) });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          clearUserData();
          const result = await signUpEmail({ name, email, password });
          const session = (await getSession()) ?? result;
          set({
            isLoggedIn: true,
            hasSeenOnboarding: true,
            user: session.user,
            error: null,
          });
        } catch (error) {
          await clearAuthStorage();
          set({ isLoggedIn: false, user: null, error: messageFromError(error) });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          clearUserData();
          await apiSignOut();
        } finally {
          set({ isLoggedIn: false, user: null, isLoading: false });
        }
      },

      completeOnboarding: () => set({ hasSeenOnboarding: true }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...(updates.name !== undefined
                  ? { name: updates.name.trim() || state.user.name }
                  : {}),
                ...(updates.avatarUrl !== undefined
                  ? { avatarUrl: updates.avatarUrl ?? undefined }
                  : {}),
              }
            : state.user,
        })),

      changePassword: async (currentPassword, newPassword) => {
        try {
          await apiChangePassword({ currentPassword, newPassword });
          set({ error: null });
          return true;
        } catch (error) {
          set({ error: messageFromError(error) });
          return false;
        }
      },
    }),
    {
      name: 'ghanaalert-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        user: state.isLoggedIn ? state.user : null,
      }),
    },
  ),
);

// Auto-restore on first import (guarded by isRestoring)
void useAuthStore.getState().restore();
