import type { WeeklyResult } from '../types';

interface Props {
  result: WeeklyResult | null;
  keyword: string;
}

export default function SummaryCards({ result, keyword }: Props) {
  const kd = result?.data.find((d) => d.keyword === keyword);
  const days = result?.days;
  const label = days ? `최근 ${days}일` : '전체';

  const cards = [
    { label: '네이버 블로그', value: kd?.naver.blog.periodCount ?? '-', color: '#03C75A' },
    { label: '네이버 뉴스', value: kd?.naver.news.periodCount ?? '-', color: '#007A3D' },
    { label: '네이버 카페', value: kd?.naver.cafe.periodCount ?? '-', color: '#89D44A' },
    { label: '구글', value: kd?.google.total ?? '-', color: '#4285F4' },
  ];

  return (
    <div>
      <p className="period-badge">{label} 언급량</p>
      <div className="summary-cards">
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ borderTop: `4px solid ${c.color}` }}>
            <span className="card-label">{c.label}</span>
            <span className="card-value">
              {typeof c.value === 'number' ? c.value.toLocaleString() : c.value}
            </span>
            <span className="card-unit">건</span>
          </div>
        ))}
      </div>
    </div>
  );
}
