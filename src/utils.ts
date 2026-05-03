const fmtMD = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

// 날짜 문자열 파싱 (YYYYMMDD / RFC2822 / "YYYY. M. D." / "YYYY년 M월 D일")
export function parseItemDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  // 네이버 블로그: YYYYMMDD
  if (/^\d{8}$/.test(dateStr)) {
    return new Date(parseInt(dateStr.slice(0, 4)), parseInt(dateStr.slice(4, 6)) - 1, parseInt(dateStr.slice(6, 8)));
  }
  // 구글(한국): "YYYY년 M월 D일"
  const koMatch = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (koMatch) return new Date(+koMatch[1], +koMatch[2] - 1, +koMatch[3]);
  // 구글(한국): "YYYY. M. D."
  const dotMatch = dateStr.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
  if (dotMatch) return new Date(+dotMatch[1], +dotMatch[2] - 1, +dotMatch[3]);
  // RFC2822 / ISO (네이버 뉴스·카페)
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

// 조회 범위(viewWeeks) 기준 날짜 레이블: "YYYY.M/D~M/D"
export function viewRangeLabel(collectedAt: string, viewWeeks: number): string {
  const end = new Date(collectedAt);
  const endYear = end.getFullYear();
  if (viewWeeks === 0) return `${endYear}.${fmtMD(end)} 기준 전체`;
  const start = new Date(end.getTime() - viewWeeks * 7 * 24 * 60 * 60 * 1000);
  const startYear = start.getFullYear();
  if (startYear !== endYear) {
    return `${startYear}.${fmtMD(start)}~${endYear}.${fmtMD(end)}`;
  }
  return `${endYear}.${fmtMD(start)}~${fmtMD(end)}`;
}
