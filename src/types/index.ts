export interface MentionItem {
  title: string;
  link: string;
  date?: string;
  snippet?: string;
  titleMatch?: boolean;
}

export interface NaverTypeResult {
  total: number;
  items: MentionItem[];
}

export interface NaverResult {
  blog: NaverTypeResult;
  news: NaverTypeResult;
  cafe: NaverTypeResult;
}

export interface GoogleResult {
  total: number;
  items: MentionItem[];
}

export interface KeywordData {
  keyword: string;
  naver: NaverResult;
  google: GoogleResult;
}

export interface WeeklyResult {
  week: string;
  collectedAt: string;
  data: KeywordData[];
}

// 조회 범위 (몇 주치 데이터를 볼 것인가)
export const VIEW_PERIOD_OPTIONS = [
  { label: '1주', weeks: 1 },
  { label: '4주', weeks: 4 },
  { label: '12주', weeks: 12 },
  { label: '전체', weeks: 0 },
] as const;
