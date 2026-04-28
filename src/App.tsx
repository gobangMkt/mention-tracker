import { useEffect, useState } from 'react';
import KeywordManager from './components/KeywordManager';
import WeeklyChart from './components/WeeklyChart';
import MentionList from './components/MentionList';
import SummaryCards from './components/SummaryCards';
import { fetchResults, fetchKeywords, saveKeywords, collectNow } from './api';
import type { WeeklyResult } from './types';
import './App.css';

export default function App() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<WeeklyResult[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [collecting, setCollecting] = useState(false);
  const [lastCollected, setLastCollected] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [days, setDays] = useState<number>(30);

  useEffect(() => {
    fetchKeywords().then(setKeywords).catch(() => {});
    fetchResults().then((data) => {
      setResults(data);
      if (data.length) setLastCollected(data[data.length - 1].collectedAt);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (keywords.length && !selectedKeyword) setSelectedKeyword(keywords[0]);
  }, [keywords]);

  const handleSaveKeywords = async (kws: string[]) => {
    setKeywords(kws);
    await saveKeywords(kws);
    if (kws.length && !kws.includes(selectedKeyword)) setSelectedKeyword(kws[0]);
  };

  const handleCollect = async (kws: string[], d: number) => {
    setCollecting(true);
    setError('');
    try {
      await collectNow(kws, d);
      const data = await fetchResults();
      setResults(data);
      if (data.length) setLastCollected(data[data.length - 1].collectedAt);
    } catch {
      setError('수집 실패: API 키 또는 서버 연결을 확인해주세요.');
    } finally {
      setCollecting(false);
    }
  };

  const latestResult = results.length ? results[results.length - 1] : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>멘션 트래커</h1>
          <p className="subtitle">키워드 언급량 주간 모니터링</p>
        </div>
        {lastCollected && (
          <span className="last-collected">
            마지막 수집: {new Date(lastCollected).toLocaleString('ko-KR')}
          </span>
        )}
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <KeywordManager
            keywords={keywords}
            days={days}
            onSave={handleSaveKeywords}
            onDaysChange={setDays}
            onCollect={handleCollect}
            collecting={collecting}
          />
          {error && <p className="error-msg">{error}</p>}
          {keywords.length > 0 && (
            <div className="keyword-select">
              <h3>키워드 선택</h3>
              {keywords.map((kw) => (
                <button
                  key={kw}
                  className={`kw-btn ${selectedKeyword === kw ? 'active' : ''}`}
                  onClick={() => setSelectedKeyword(kw)}
                >
                  {kw}
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="content">
          {collecting && (
            <div className="collecting-overlay">
              <div className="collecting-box">
                <div className="collecting-spinner" />
                <p className="collecting-title">수집 중입니다…</p>
                <p className="collecting-desc">
                  키워드 {keywords.length}개를 검색하고 있습니다.<br />
                  플랫폼별 언급량을 가져오는 중이니 잠시만 기다려주세요.
                </p>
              </div>
            </div>
          )}
          {selectedKeyword ? (
            <>
              <SummaryCards result={latestResult} keyword={selectedKeyword} />
              {results.length > 0 && (
                <WeeklyChart results={results} keyword={selectedKeyword} />
              )}
              <MentionList result={latestResult} keyword={selectedKeyword} />
            </>
          ) : (
            <div className="empty-state">
              <p>왼쪽에서 키워드를 추가하고 "지금 수집하기"를 클릭하세요.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
