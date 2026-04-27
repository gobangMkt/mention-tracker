import { useState } from 'react';
import { Plus, X, Search, Loader2 } from 'lucide-react';
import { PERIOD_OPTIONS } from '../types';

interface Props {
  keywords: string[];
  days: number;
  onSave: (keywords: string[]) => void;
  onDaysChange: (days: number) => void;
  onCollect: (keywords: string[], days: number) => Promise<void>;
  collecting: boolean;
}

export default function KeywordManager({ keywords, days, onSave, onDaysChange, onCollect, collecting }: Props) {
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
        <span className="period-label">기간</span>
        <div className="period-btns">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              className={`period-btn ${days === opt.days ? 'active' : ''}`}
              onClick={() => onDaysChange(opt.days)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn-collect"
        onClick={() => onCollect(keywords, days)}
        disabled={collecting || keywords.length === 0}
      >
        {collecting ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
        {collecting ? '수집 중...' : '지금 수집하기'}
      </button>
    </div>
  );
}
