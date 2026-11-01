import type { User } from '@/src/types';

export const mockUser: User = {
  id: 'u-1',
  name: 'Tracy Oti',
  email: 'tracyoti@example.com',
};

export const regions = [
  'Greater Accra, Ghana',
  'Ashanti, Ghana',
  'Western, Ghana',
  'Central, Ghana',
  'Eastern, Ghana',
  'Northern, Ghana',
  'Volta, Ghana',
  'Upper East, Ghana',
  'Upper West, Ghana',
  'Bono, Ghana',
  'Ahafo, Ghana',
  'Oti, Ghana',
  'Savannah, Ghana',
  'North East, Ghana',
  'Western North, Ghana',
];

export const faqs = [
  {
    question: 'What is GhanaAlert?',
    answer:
      'GhanaAlert brings verified consumer alerts from regulators, companies and public agencies into one simple app so you can make safer choices.',
  },
  {
    question: 'Are the alerts verified?',
    answer:
      'In this demo the alerts are sample content. In the live product every alert will cite its source and be reviewed before publishing.',
  },
  {
    question: 'How do I save an alert?',
    answer:
      'Open any alert and tap the bookmark icon. Saved alerts appear under Profile → My Alerts.',
  },
  {
    question: 'Can I report an issue?',
    answer:
      'Yes. Go to Profile → Report a Consumer Issue, describe the problem and add a photo if you have one.',
  },
  {
    question: 'How do I change my notification preferences?',
    answer:
      'Open Profile → Notifications to turn notifications on or off and choose which categories you want to hear about.',
  },
];
