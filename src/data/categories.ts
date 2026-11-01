import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Category, CategorySlug } from '@/src/types';
import { categoryColors } from '@/src/theme/tokens';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export const categories: Category[] = [
  {
    slug: 'product-safety',
    name: 'Product Safety',
    description: 'Recalled products, unsafe items',
  },
  {
    slug: 'food-health',
    name: 'Food & Health',
    description: 'Food contamination, medicine, health products',
  },
  {
    slug: 'scams-fraud',
    name: 'Scams & Fraud',
    description: 'Fake offers, phishing, online scams',
  },
  {
    slug: 'services',
    name: 'Services',
    description: 'Power, water, telecom, banks',
  },
  {
    slug: 'travel-transport',
    name: 'Travel & Transport',
    description: 'Flights, road safety, travel advisories',
  },
  {
    slug: 'consumer-rights',
    name: 'Consumer Rights',
    description: 'Refunds, warranties, complaints',
  },
  {
    slug: 'other',
    name: 'Other',
    description: 'General public notices',
  },
];

export const categoryIcons: Record<CategorySlug, IconName> = {
  'product-safety': 'shield-alert',
  'food-health': 'food-apple',
  'scams-fraud': 'alert-octagon',
  services: 'cog',
  'travel-transport': 'airplane',
  'consumer-rights': 'scale-balance',
  other: 'dots-horizontal',
};

export const categoryStyles: Record<CategorySlug, { color: string; icon: IconName }> = {
  'product-safety': { color: categoryColors['product-safety'], icon: categoryIcons['product-safety'] },
  'food-health': { color: categoryColors['food-health'], icon: categoryIcons['food-health'] },
  'scams-fraud': { color: categoryColors['scams-fraud'], icon: categoryIcons['scams-fraud'] },
  services: { color: categoryColors.services, icon: categoryIcons.services },
  'travel-transport': {
    color: categoryColors['travel-transport'],
    icon: categoryIcons['travel-transport'],
  },
  'consumer-rights': {
    color: categoryColors['consumer-rights'],
    icon: categoryIcons['consumer-rights'],
  },
  other: { color: categoryColors.other, icon: categoryIcons.other },
};

export const categoryNames: Record<CategorySlug, string> = categories.reduce(
  (acc, category) => {
    acc[category.slug] = category.name;
    return acc;
  },
  {} as Record<CategorySlug, string>,
);

export function getCategory(slug: CategorySlug): Category {
  return categories.find((category) => category.slug === slug) ?? categories[categories.length - 1];
}
