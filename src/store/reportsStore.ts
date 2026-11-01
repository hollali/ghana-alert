import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ReportPayload, UserReport } from '@/src/types';

interface ReportsState {
  reports: UserReport[];
  addReport: (payload: ReportPayload) => UserReport;
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
    }),
    {
      name: 'ghanaalert-reports',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
