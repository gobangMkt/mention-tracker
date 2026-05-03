import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { WeeklyResult, MentionItem } from '../types';
import { parseItemDate, viewRangeLabel } from '../utils';

interface Props {
  result: WeeklyResult | null;
  keyword: string;
  viewWeeks: number;
}

const PLATFORMS = [
  { key: 'blog' as const, label: '네이버 블로그', color: '#03C75A', type: 'naver' },
  { key: 'news' as const, label: '네이버 뉴스', color: '#007A3D', type: 'naver' },
  { key: 'cafe' as const, label: '네이버 카페', color: '#89D44A', type: 'naver' },
  { key: 'google' as const, label: '구글', color: '#4285F4', type: 'google' },
] as const;

const INITIAL_COUNT = 5;
const LOAD_MORE_COUNT = 10;

function ItemList({ items }: { items: MentionItem[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const visible = items.slice(0, visibleCount);
  const remaining = items.length - visibleCount;
  const isExpanded = visibleCount > INITIAL_COUNT;

  if (items.length === 0) return <p className="empty-small">해당 항목 없음</p>;

  return (
    <>
      <ul className="platform-items">
        {visible.map((item, i) => (
          <li key={i}>
            <a href={item.link} target="_blank" rel="noreferrer">{item.title}</a>
            {(item.date || item.snippet) && (
              <span className="item-meta">{item.date || item.snippet?.slice(0, 60)}</span>
            )}
          </li>
        ))}
      </ul>
      <div className="btn-more-wrap">
        {remaining > 0 && (
          <button className="btn-more" onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}>
            더보기 +{Math.min(remaining, LOAD_MORE_COUNT)}건 ▼
          </button>
        )}
        {isExpanded && remaining === 0 && (
          <button className="btn-more" onClick={() => setVisibleCount(INITIAL_COUNT)}>
            접기 ▲
          </button>
        )}
      </div>
    </>
  );
}

function PlatformCard({
  label, color, count, total, items,
}: {
  label: string;
  color: string;
  count: number;
  total: number;
  items: MentionItem[];
}) {
  const [tab, setTab] = useState<'title' | 'body'>('title');
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0';

  const hasTitleMatchInfo = items.some((item) => item.titleMatch !== undefined);
  const titleItems = items.filter((item) => item.titleMatch);
  const bodyItems = items.filter((item) => !item.titleMatch);
  const visibleItems = (hasTitleMatchInfo && tab === 'body') ? bodyItems : titleItems;

  return (
    <div className="platform-card">
      <div className="platform-card-header">
        <span className="platform-dot" style={{ background: color }} />
        <span className="platform-name" style={{ color }}>{label}</span>
        <span className="platform-count">{count.toLocaleString()}건</span>
        <span className="platform-pct">{pct}%</span>
      </div>
      <div className="platform-bar-wrap">
        <div className="platform-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
      {items.length === 0 ? (
        <p className="empty-small">해당 기간 결과 없음</p>
      ) : (
        <>
          {hasTitleMatchInfo && (
            <div className="item-tabs">
              <button
                className={`item-tab ${tab === 'title' ? 'active' : ''}`}
                onClick={() => setTab('title')}
              >
                제목 노출 <span className="item-tab-count">{titleItems.length}</span>
              </button>
              <button
                className={`item-tab ${tab === 'body' ? 'active' : ''}`}
                onClick={() => setTab('body')}
              >
                본문만 <span className="item-tab-count">{bodyItems.length}</span>
              </button>
            </div>
          )}
          <ItemList key={tab} items={visibleItems} />
        </>
      )}
    </div>
  );
}

function extractDateFromText(text: string): Date | null {
  const dotMatch = text.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
  if (dotMatch) return new Date(+dotMatch[1], +dotMatch[2] - 1, +dotMatch[3]);
  const koMatch = text.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (koMatch) return new Date(+koMatch[1], +koMatch[2] - 1, +koMatch[3]);
  return null;
}

function filterRecentItems(items: MentionItem[], cutoff: Date, checkSnippet = false): MentionItem[] {
  return items.filter((item) => {
    const d = parseItemDate(item.date)
      ?? (checkSnippet && item.snippet ? extractDateFromText(item.snippet) : null);
    if (d === null) return true; // 날짜 파악 불가 → 유지
    return d >= cutoff;
  });
}

export default function MentionList({ result, keyword, viewWeeks }: Props) {
  if (!result) return <p className="empty">수집된 데이터가 없습니다.</p>;
  const kd = result.data.find((d) => d.keyword === keyword);
  if (!kd) return <p className="empty">해당 키워드 데이터 없음</p>;

  const periodLabel = viewRangeLabel(result.collectedAt, viewWeeks);
  const weeks = viewWeeks === 0 ? 520 : viewWeeks; // 전체: 10년치 cutoff로 사실상 무제한
  const cutoff = new Date(new Date(result.collectedAt).getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

  const counts = {
    blog: kd.naver.blog.periodCount ?? kd.naver.blog.items.length,
    news: kd.naver.news.periodCount ?? kd.naver.news.items.length,
    cafe: kd.naver.cafe.periodCount ?? kd.naver.cafe.items.length,
    google: kd.google.periodCount ?? kd.google.items.length,
  };
  const grandTotal = Object.values(counts).reduce((a, b) => a + b, 0);

  const pieData = PLATFORMS.map((p) => ({
    name: p.label,
    value: counts[p.key],
    color: p.color,
  })).filter((d) => d.value > 0);

  return (
    <div className="mention-list">
      <div className="mention-header">
        <h3>"{keyword}" 언급 현황 <span className="period-tag">{periodLabel}</span></h3>
        <span className="total-count">총 {grandTotal.toLocaleString()}건</span>
      </div>

      {grandTotal > 0 && (
        <div className="pie-section">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie data={pieData} cx={85} cy={85} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${Number(v).toLocaleString()}건`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {PLATFORMS.map((p) => {
              const cnt = counts[p.key];
              const pct = grandTotal > 0 ? ((cnt / grandTotal) * 100).toFixed(1) : '0';
              return (
                <div key={p.key} className="legend-item">
                  <span className="legend-dot" style={{ background: p.color }} />
                  <span className="legend-label">{p.label}</span>
                  <span className="legend-val">{cnt.toLocaleString()}건</span>
                  <span className="legend-pct">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="platform-grid">
        <PlatformCard
          label="네이버 블로그" color="#03C75A"
          count={counts.blog} total={grandTotal}
          items={filterRecentItems(kd.naver.blog.items ?? [], cutoff)}
        />
        <PlatformCard
          label="네이버 뉴스" color="#1EC800"
          count={counts.news} total={grandTotal}
          items={filterRecentItems(kd.naver.news.items ?? [], cutoff)}
        />
        <PlatformCard
          label="네이버 카페" color="#00B4B4"
          count={counts.cafe} total={grandTotal}
          items={filterRecentItems(kd.naver.cafe.items ?? [], cutoff)}
        />
        <PlatformCard
          label="구글" color="#4285F4"
          count={counts.google} total={grandTotal}
          items={filterRecentItems(kd.google.items ?? [], cutoff, true)}
        />
      </div>
    </div>
  );
}
