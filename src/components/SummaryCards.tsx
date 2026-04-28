import type { WeeklyResult } from '../types';

interface Props {
  results: WeeklyResult[];
  keyword: string;
  viewWeeks: number;
}

export default function SummaryCards({ results, keyword, viewWeeks }: Props) {
  const periodResults = viewWeeks === 0 ? results : results.slice(-viewWeeks);
  const label = viewWeeks === 0 ? '전체' : `최근 ${viewWeeks}주`;
  const actualWeeks = periodResults.length;
  const isShortData = viewWeeks > 0 && actualWeeks < viewWeeks;

  const sum = (getter: (r: WeeklyResult) => number) =>
    periodResults.reduce((acc, r) => {
      const kd = r.data.find((d) => d.keyword === keyword);
      return acc + (kd ? getter(r) : 0);
    }, 0);

  const cards = [
    { label: '네이버 블로그', value: sum((r) => r.data.find((d) => d.keyword === keyword)?.naver.blog.periodCount ?? 0), color: '#03C75A' },
    { label: '네이버 뉴스',   value: sum((r) => r.data.find((d) => d.keyword === keyword)?.naver.news.periodCount ?? 0),  color: '#007A3D' },
    { label: '네이버 카페',   value: sum((r) => r.data.find((d) => d.keyword === keyword)?.naver.cafe.periodCount ?? 0),  color: '#89D44A' },
    { label: '구글',          value: sum((r) => r.data.find((d) => d.keyword === keyword)?.google.periodCount ?? 0),      color: '#4285F4' },
  ];

  return (
    <div>
      <div className="period-badge-row">
        <p className="period-badge">{label} 누적 언급량</p>
        {isShortData && (
          <span className="data-shortage-notice">
            현재 {actualWeeks}주치 데이터만 수집됨 ({viewWeeks}주 중 {actualWeeks}주)
          </span>
        )}
      </div>
      <div className="summary-cards">
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ borderTop: `4px solid ${c.color}` }}>
            <span className="card-label">{c.label}</span>
            <span className="card-value">{c.value.toLocaleString()}</span>
            <span className="card-unit">건</span>
          </div>
        ))}
      </div>
    </div>
  );
}
