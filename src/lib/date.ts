/**
 * Helpers for Asia/Dhaka timezone (UTC+6)
 */
export function getDhakaDateRange() {
  const now = new Date();
  // Dhaka is UTC+6
  const dhakaTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  const year = dhakaTime.getUTCFullYear();
  const month = dhakaTime.getUTCMonth();
  const date = dhakaTime.getUTCDate();

  // Start of today in Dhaka (00:00:00.000 Dhaka time converted to UTC)
  const startOfTodayUtc = new Date(Date.UTC(year, month, date, 0, 0, 0, 0) - 6 * 60 * 60 * 1000);

  // Start of this month in Dhaka (1st of month 00:00:00.000 Dhaka time converted to UTC)
  const startOfMonthUtc = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - 6 * 60 * 60 * 1000);

  return { startOfTodayUtc, startOfMonthUtc };
}

