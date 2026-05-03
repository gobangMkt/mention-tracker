const fmtMD = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

// 네이버 날짜 문자열 파싱 (YYYYMMDD 또는 RFC2822/ISO)
export function parseItemDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  if (/^\d{8}$/.test(dateStr)) {
    return new Date(
      parseInt(dateStr.slice(0, 4)),
      parseInt(dateStr.slice(4, 6)) - 1,
      parseInt(dateStr.slice(6, 8))
    );
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// collectedAt ISO 문자열 → 실제 데이터 커버리지 "YYYY.M/D~M/D"
// periodCount = 수집일 기준 최근 7일 게시글 수이므로, 표시 범위 = (수집일-7일)~수집일
export function collectedAtToRange(collectedAt: string, withYear = true): string {
  const end = new Date(collectedAt);
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

  const endYear = end.getFullYear();
  const startYear = start.getFullYear();

  if (startYear !== endYear) {
    return `${startYear}.${fmtMD(start)}~${endYear}.${fmtMD(end)}`;
  }
  return withYear ? `${endYear}.${fmtMD(start)}~${fmtMD(end)}` : `${fmtMD(start)}~${fmtMD(end)}`;
}

// 여러 수집 결과에 걸친 전체 범위: 첫 수집의 7일 전 ~ 마지막 수집일
export function collectedRangeSpan(first: string, last: string): string {
  const end = new Date(last);
  const start = new Date(new Date(first).getTime() - 7 * 24 * 60 * 60 * 1000);

  const endYear = end.getFullYear();
  const startYear = start.getFullYear();

  if (startYear !== endYear) {
    return `${startYear}.${fmtMD(start)}~${endYear}.${fmtMD(end)}`;
  }
  return `${endYear}.${fmtMD(start)}~${fmtMD(end)}`;
}
