import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { authenticatedFetch } from '@/src/lib/api';
import type { ReportPayload, UserReport } from '@/src/types';

interface ReportsState {
  reports: UserReport[];
  isSyncing: boolean;
  lastError: string | null;
  addReport: (payload: ReportPayload) => Promise<UserReport>;
  removeReport: (id: string) => void;
  clear: () => void;
}

interface ReportRow {
  id: string | number;
  issue_type?: string;
  issueType?: string;
  title: string;
  description: string;
  location?: string | null;
  photo_uri?: string | null;
  photoUri?: string | null;
  created_at?: string;
  createdAt?: string;
}

function mapReportRow(row: ReportRow, fallback: ReportPayload): UserReport {
  return {
    issueType: (row.issue_type ?? row.issueType ?? fallback.issueType) as never,
    title: row.title,
    description: row.description,
    location: (row.location ?? fallback.location) as string | undefined,
    photoUri: (row.photo_uri ?? row.photoUri ?? fallback.photoUri) as string | undefined,
    id: String(row.id),
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set) => ({
      reports: [],
      isSyncing: false,
      lastError: null,

      addReport: async (payload) => {
        set({ isSyncing: true, lastError: null });

        let report: UserReport;
        try {
          const response = await authenticatedFetch('/api/reports', {
            method: 'POST',
            body: JSON.stringify({
              issue_type: payload.issueType,
              title: payload.title,
              description: payload.description,
              location: payload.location ?? null,
              photo_uri: payload.photoUri ?? null,
            }),
          });

          if (!response.ok) {
            const data = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;
            throw new Error(data?.error ?? `Report API ${response.status}`);
          }

          const row = (await response.json()) as ReportRow;
          report = mapReportRow(row, payload);
        } catch (error) {
          if (__DEV__) console.warn('[api] Report sync failed, saving locally:', error);
          report = {
            ...payload,
            id: `report-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          set({ lastError: error instanceof Error ? error.message : 'Report saved locally only' });
        }

        set((state) => ({ reports: [report, ...state.reports], isSyncing: false }));
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
