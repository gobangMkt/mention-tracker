export interface MentionItem {
  title: string;
  link: string;
  date?: string;
  snippet?: string;
}

export interface NaverTypeResult {
  total: number;
  periodCount: number;
  items: MentionItem[];
}

export interface NaverResult {
  blog: NaverTypeResult;
  news: NaverTypeResult;
  cafe: NaverTypeResult;
  web: NaverTypeResult;
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
  days: number | null;
  data: KeywordData[];
}

export const PERIOD_OPTIONS = [
  { label: '7일', days: 7 },
  { label: '30일', days: 30 },
  { label: '90일', days: 90 },
  { label: '전체', days: 0 },
] as const;
