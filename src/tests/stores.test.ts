import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { useAuthStore } from '@/src/store/authStore';
import { usePrefsStore } from '@/src/store/prefsStore';
import { useSavedStore } from '@/src/store/savedStore';
import { useReportsStore } from '@/src/store/reportsStore';

jest.mock('@/src/lib/neonAuth', () => ({
  signInEmail: jest.fn(),
  signUpEmail: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  changePassword: jest.fn(),
  clearAuthStorage: jest.fn(),
}));

jest.mock('@/src/lib/api', () => ({
  authenticatedFetch: jest.fn(),
  publicFetch: jest.fn(),
}));

describe('authStore', () => {
  beforeEach(async () => {
    await useAuthStore.getState().logout();
  });

  it('starts logged out with no user', () => {
    const state = useAuthStore.getState();
    expect(state.isLoggedIn).toBe(false);
    expect(state.user).toBeNull();
  });

  it('completeOnboarding sets flag', () => {
    useAuthStore.getState().completeOnboarding();
    expect(useAuthStore.getState().hasSeenOnboarding).toBe(true);
  });
});

describe('prefsStore', () => {
  beforeEach(() => {
    usePrefsStore.getState().clear();
  });

  it('toggles category preferences', () => {
    const store = usePrefsStore.getState();
    store.toggleCategory('food-health');
    const state = usePrefsStore.getState();
    expect(state.categories['food-health']).toBe(false);
  });

  it('sets location', () => {
    const store = usePrefsStore.getState();
    store.setLocation('Accra, Ghana');
    const state = usePrefsStore.getState();
    expect(state.location).toBe('Accra, Ghana');
  });
});

describe('savedStore', () => {
  beforeEach(() => {
    useSavedStore.getState().clear();
  });

  it('saves an alert', () => {
    const store = useSavedStore.getState();
    store.save('alert-1');
    const state = useSavedStore.getState();
    expect(state.entries.length).toBe(1);
    expect(state.entries[0].status).toBe('saved');
  });

  it('toggles saved status', () => {
    const store = useSavedStore.getState();
    store.save('alert-1');
    const toggled = store.toggleSaved('alert-1');
    expect(toggled).toBe(false);
    const state = useSavedStore.getState();
    expect(state.entries[0].status).toBe('read_later');
  });

  it('removes an alert', () => {
    const store = useSavedStore.getState();
    store.save('alert-1');
    store.remove('alert-1');
    const state = useSavedStore.getState();
    expect(state.entries.length).toBe(0);
  });
});

describe('reportsStore', () => {
  beforeEach(() => {
    useReportsStore.getState().clear();
  });

  it('adds a report', async () => {
    const store = useReportsStore.getState();
    const report = await store.addReport({
      issueType: 'product-safety',
      title: 'Test title',
      description: 'Test description',
    });
    const state = useReportsStore.getState();
    expect(state.reports.length).toBe(1);
    expect(report.title).toBe('Test title');
  });

  it('removes a report', async () => {
    const store = useReportsStore.getState();
    const report = await store.addReport({
      issueType: 'product-safety',
      title: 'Test title',
      description: 'Test description',
    });
    store.removeReport(report.id);
    const state = useReportsStore.getState();
    expect(state.reports.length).toBe(0);
  });
});
