import type { WeeklyResult } from '../types';

interface Props {
  results: WeeklyResult[];
  keyword: string;
  viewWeeks: number;
}

export default function SummaryCards({ results, keyword, viewWeeks }: Props) {
  const periodResults = viewWeeks === 0 ? results : results.slice(-viewWeeks);
  const label = viewWeeks === 0 ? '전체' : `최근 ${viewWeeks}주`;

  const sum = (getter: (r: WeeklyResult) => number) =>
    periodResults.reduce((acc, r) => {
      const kd = r.data.find((d) => d.keyword === keyword);
      return acc + (kd ? getter(r) : 0);
    }, 0);

  const cards = [
    { label: '네이버 블로그', value: sum((r) => r.data.find((d) => d.keyword === keyword)?.naver.blog.total ?? 0), color: '#03C75A' },
    { label: '네이버 뉴스',   value: sum((r) => r.data.find((d) => d.keyword === keyword)?.naver.news.total ?? 0),  color: '#007A3D' },
    { label: '네이버 카페',   value: sum((r) => r.data.find((d) => d.keyword === keyword)?.naver.cafe.total ?? 0),  color: '#89D44A' },
    { label: '구글',          value: sum((r) => r.data.find((d) => d.keyword === keyword)?.google.total ?? 0),      color: '#4285F4' },
  ];

  return (
    <div>
      <p className="period-badge">{label} 누적 언급량</p>
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
