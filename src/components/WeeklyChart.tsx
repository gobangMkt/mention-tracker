import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { WeeklyResult } from '../types';

interface Props {
  results: WeeklyResult[];
  keyword: string;
}

const PLATFORMS = [
  { name: '네이버 블로그', color: '#03C75A' },
  { name: '네이버 뉴스', color: '#007A3D' },
  { name: '네이버 카페', color: '#89D44A' },
  { name: '구글', color: '#4285F4' },
];

export default function WeeklyChart({ results, keyword }: Props) {
  const chartData = results.map((r) => {
    const kd = r.data.find((d) => d.keyword === keyword);
    return {
      week: r.week,
      '네이버 블로그': kd?.naver.blog.periodCount ?? kd?.naver.blog.total ?? 0,
      '네이버 뉴스': kd?.naver.news.periodCount ?? kd?.naver.news.total ?? 0,
      '네이버 카페': kd?.naver.cafe.periodCount ?? kd?.naver.cafe.total ?? 0,
      구글: kd?.google.total ?? 0,
    };
  });

  return (
    <div className="chart-wrap">
      <div className="chart-header">
        <h3>"{keyword}" 주간 언급량 추이</h3>
        {chartData.length < 2 && <span className="chart-hint">데이터가 쌓일수록 추이를 확인할 수 있습니다</span>}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="week" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {PLATFORMS.map(({ name, color }) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 5, fill: color }}
              activeDot={{ r: 7 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
