import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ReportPayload, UserReport } from '@/src/types';

interface ReportsState {
  reports: UserReport[];
  addReport: (payload: ReportPayload) => UserReport;
  removeReport: (id: string) => void;
  clear: () => void;
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set) => ({
      reports: [],
      addReport: (payload) => {
        const report: UserReport = {
          ...payload,
          id: `report-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ reports: [report, ...state.reports] }));
        return report;
      },
      removeReport: (id) =>
        set((state) => ({ reports: state.reports.filter((report) => report.id !== id) })),
      clear: () => set({ reports: [] }),
    }),
    {
      name: 'ghanaalert-reports',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
