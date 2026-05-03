// 서버의 getWeekLabel() 역산: "2026-W19" → "5/3~5/9"
export function weekToDateRange(weekStr: string): string {
  const match = weekStr.match(/(\d{4})-[Ww](\d{2})/);
  if (!match) return weekStr;

  const year = parseInt(match[1]);
  const week = parseInt(match[2]);

  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay(); // 0=일, 1=월, ..., 6=토

  const startOffset = (week - 1) * 7 - jan1Day;
  const startDate = new Date(year, 0, 1 + startOffset);
  const endDate = new Date(year, 0, 1 + startOffset + 6);

  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(startDate)}~${fmt(endDate)}`;
}
