import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  NeonAuthError,
  changePassword as apiChangePassword,
  clearAuthStorage,
  getSession,
  sendVerificationEmail,
  signInEmail,
  signOut as apiSignOut,
  signUpEmail,
  verifyEmailOtp,
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
  needsVerification: boolean;
  pendingEmail: string | null;
  error: string | null;
  restore: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  updateProfile: (updates: { name?: string; avatarUrl?: string | null }) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const VERIFY_MESSAGE =
  'Check your email and enter the verification code to finish signing in.';

function messageFromError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

function isEmailNotVerified(error: unknown): boolean {
  if (error instanceof NeonAuthError) {
    const code = (error.code ?? '').toUpperCase();
    const msg = error.message.toUpperCase();
    return code.includes('NOT_VERIFIED') || code.includes('EMAIL_NOT_VERIFIED') || msg.includes('NOT VERIFIED') || msg.includes('EMAIL IS NOT VERIFIED');
  }
  const msg = error instanceof Error ? error.message.toUpperCase() : '';
  return msg.includes('NOT VERIFIED');
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
      needsVerification: false,
      pendingEmail: null,
      error: null,

      restore: async () => {
        set({ isRestoring: true, error: null });
        try {
          const session = await getSession();
          if (session) {
            set({
              isLoggedIn: true,
              user: session.user,
              needsVerification: false,
              pendingEmail: null,
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
        set({ isLoading: true, error: null, needsVerification: false, pendingEmail: null });
        try {
          clearUserData();
          const result = await signInEmail({ email, password });
          // Confirm session (sets cookie + JWT)
          const session = (await getSession()) ?? result;
          const verified = session.raw?.emailVerified;
          if (verified === false) {
            set({
              isLoggedIn: false,
              user: null,
              needsVerification: true,
              pendingEmail: email.trim(),
              error: VERIFY_MESSAGE,
            });
            throw new NeonAuthError('Email is not verified', 403, 'EMAIL_NOT_VERIFIED');
          }
          set({
            isLoggedIn: true,
            user: session.user,
            needsVerification: false,
            pendingEmail: null,
            error: null,
          });
        } catch (error) {
          if (isEmailNotVerified(error)) {
            await clearAuthStorage();
            set({
              isLoggedIn: false,
              user: null,
              needsVerification: true,
              pendingEmail: email.trim(),
              error: VERIFY_MESSAGE,
            });
            throw error;
          }
          await clearAuthStorage();
          set({ isLoggedIn: false, user: null, error: messageFromError(error) });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null, needsVerification: false, pendingEmail: null });
        try {
          clearUserData();
          const result = await signUpEmail({ name, email, password });
          const session = await getSession();
          const raw = session?.raw ?? result.raw;

          if (raw?.emailVerified === false) {
            await clearAuthStorage();
            set({
              isLoggedIn: false,
              hasSeenOnboarding: true,
              user: null,
              needsVerification: true,
              pendingEmail: email.trim(),
              error: VERIFY_MESSAGE,
            });
            return;
          }

          const effective = session ?? result;
          set({
            isLoggedIn: true,
            hasSeenOnboarding: true,
            user: effective.user,
            needsVerification: false,
            pendingEmail: null,
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

      verifyEmail: async (code) => {
        const email = get().pendingEmail;
        if (!email) throw new Error('No email is waiting for verification.');
        set({ isLoading: true, error: null });
        try {
          const result = await verifyEmailOtp({ email, otp: code });
          const session = (await getSession()) ?? result;
          set({
            isLoggedIn: true,
            user: session.user,
            needsVerification: false,
            pendingEmail: null,
            error: null,
          });
        } catch (error) {
          set({ error: messageFromError(error) });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      resendVerification: async () => {
        const email = get().pendingEmail;
        if (!email) throw new Error('No email is waiting for verification.');
        set({ isLoading: true, error: null });
        try {
          await sendVerificationEmail({ email });
          set({ error: 'Verification email resent. Check your inbox.' });
        } catch (error) {
          set({ error: messageFromError(error) });
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
          set({
            isLoggedIn: false,
            user: null,
            needsVerification: false,
            pendingEmail: null,
            isLoading: false,
          });
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
