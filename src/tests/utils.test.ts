import { describe, it, expect } from '@jest/globals';
import { greeting, firstName, initials } from '@/src/utils/greeting';
import { timeAgo } from '@/src/utils/timeAgo';

describe('greeting utility', () => {
  it('returns Good morning before noon', () => {
    expect(greeting(new Date(2024, 0, 1, 9, 0))).toBe('Good morning,');
  });

  it('returns Good afternoon between noon and 5pm', () => {
    expect(greeting(new Date(2024, 0, 1, 14, 0))).toBe('Good afternoon,');
  });

  it('returns Good evening after 5pm', () => {
    expect(greeting(new Date(2024, 0, 1, 18, 0))).toBe('Good evening,');
  });
});

describe('firstName utility', () => {
  it('extracts first name from full name', () => {
    expect(firstName('Tracy Oti')).toBe('Tracy');
  });

  it('returns the name itself if no space', () => {
    expect(firstName('Tracy')).toBe('Tracy');
  });
});

describe('initials utility', () => {
  it('returns initials from full name', () => {
    expect(initials('Tracy Oti')).toBe('TO');
  });

  it('returns first two letters if one word', () => {
    expect(initials('Tracy')).toBe('TR');
  });
});

describe('timeAgo utility', () => {
  it('formats valid ISO date', () => {
    expect(timeAgo('2024-01-01T00:00:00Z')).toMatch(/s ago|m ago|h ago/);
  });

  it('returns empty string for invalid date', () => {
    expect(timeAgo('invalid')).toBe('');
  });
});