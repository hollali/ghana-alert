import { formatDistanceToNowStrict } from 'date-fns';

export function timeAgo(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const label = formatDistanceToNowStrict(date)
    .replace(/ seconds?$/, 's')
    .replace(/ minutes?$/, 'm')
    .replace(/ hours?$/, 'h');
  return `${label} ago`;
}
