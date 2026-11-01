export type CategorySlug =
  | 'product-safety'
  | 'food-health'
  | 'scams-fraud'
  | 'services'
  | 'travel-transport'
  | 'consumer-rights'
  | 'other';

export type Priority = 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: CategorySlug;
  priority: Priority;
  source: string;
  publishedAt: string;
  affectedProducts?: {
    brand?: string;
    batchNumbers?: string[];
    bestBefore?: string;
  };
  recommendedActions?: string[];
  imageUrl?: string;
  viewCount?: number;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ReportPayload {
  issueType: CategorySlug;
  title: string;
  description: string;
  location?: string;
  photoUri?: string;
}

export type SavedStatus = 'saved' | 'read_later';

export interface SavedEntry {
  id: string;
  status: SavedStatus;
  savedAt: string;
}

export interface UserReport extends ReportPayload {
  id: string;
  createdAt: string;
}
