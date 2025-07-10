export function formatRelativeTime(date: string | number) {
  const now = new Date();
  const inputDate = new Date(date);

  const diffInMilliseconds = Math.max(1000, now.getTime() - inputDate.getTime());
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInSeconds / 3600);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;

  const currentYear = now.getFullYear();
  const inputYear = inputDate.getFullYear();

  if (inputYear === currentYear) {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return inputDate.toLocaleDateString('en-US', options);
  }

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return inputDate.toLocaleDateString('en-US', options);
}
