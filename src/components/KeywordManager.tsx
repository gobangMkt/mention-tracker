import { useState } from 'react';
import { Plus, X, Search, Loader2 } from 'lucide-react';
import { VIEW_PERIOD_OPTIONS } from '../types';

interface Props {
  keywords: string[];
  viewWeeks: number;
  onSave: (keywords: string[]) => void;
  onViewWeeksChange: (weeks: number) => void;
  onCollect: (keywords: string[]) => Promise<void>;
  collecting: boolean;
}

export default function KeywordManager({ keywords, viewWeeks, onSave, onViewWeeksChange, onCollect, collecting }: Props) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !keywords.includes(trimmed)) onSave([...keywords, trimmed]);
    setInput('');
  };

  const remove = (kw: string) => onSave(keywords.filter((k) => k !== kw));

  return (
    <div className="keyword-manager">
      <h2>키워드 관리</h2>
      <div className="keyword-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="키워드 입력 (Enter)"
        />
        <button onClick={add} className="btn-add"><Plus size={16} /></button>
      </div>
      <div className="keyword-tags">
        {keywords.map((kw) => (
          <span key={kw} className="tag">
            {kw}
            <button onClick={() => remove(kw)}><X size={12} /></button>
          </span>
        ))}
      </div>

      <div className="period-selector">
        <span className="period-label">조회 범위</span>
        <div className="period-btns">
          {VIEW_PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              className={`period-btn ${viewWeeks === opt.weeks ? 'active' : ''}`}
              onClick={() => onViewWeeksChange(opt.weeks)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn-collect"
        onClick={() => onCollect(keywords)}
        disabled={collecting || keywords.length === 0}
      >
        {collecting ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
        {collecting ? '수집 중...' : '지금 수집하기'}
      </button>
    </div>
  );
}
