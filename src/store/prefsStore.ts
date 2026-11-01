import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CategorySlug } from '@/src/types';

export const allCategorySlugs: CategorySlug[] = [
  'product-safety',
  'food-health',
  'scams-fraud',
  'services',
  'travel-transport',
  'consumer-rights',
  'other',
];

const defaultCategories = allCategorySlugs.reduce(
  (acc, slug) => {
    acc[slug] = true;
    return acc;
  },
  {} as Record<CategorySlug, boolean>,
);

interface PrefsState {
  notificationsEnabled: boolean;
  categories: Record<CategorySlug, boolean>;
  location: string;
  setNotificationsEnabled: (enabled: boolean) => void;
  toggleCategory: (slug: CategorySlug) => void;
  setLocation: (location: string) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      categories: defaultCategories,
      location: 'Accra, Ghana',
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      toggleCategory: (slug) =>
        set((state) => ({
          categories: { ...state.categories, [slug]: !state.categories[slug] },
        })),
      setLocation: (location) => set({ location }),
    }),
    {
      name: 'ghanaalert-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
