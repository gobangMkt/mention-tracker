import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { searchNaver } from './api/naver.js';
import { searchGoogle } from './api/google.js';
import { saveWeeklyResult, loadAllResults, loadKeywords, saveKeywords } from './data/store.js';

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const collectKeywords = async (keywords, days) => {
  const results = [];
  for (const keyword of keywords) {
    const naver = await searchNaver(keyword, days);
    const google = await searchGoogle(keyword, days);
    results.push({ keyword, naver, google });
  }
  saveWeeklyResult(results, days);
  return results;
};

app.get('/api/results', (req, res) => {
  res.json(loadAllResults());
});

app.post('/api/collect', async (req, res) => {
  const { keywords, days } = req.body;
  if (!keywords?.length) return res.status(400).json({ error: '키워드 없음' });
  try {
    const results = await collectKeywords(keywords, days);
    res.json({ success: true, results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/keywords', (req, res) => {
  res.json(loadKeywords());
});

app.post('/api/keywords', (req, res) => {
  const { keywords } = req.body;
  saveKeywords(keywords);
  res.json({ success: true });
});

// 매주 월요일 오전 9시 자동 수집
cron.schedule('0 9 * * 1', async () => {
  const keywords = loadKeywords();
  if (keywords.length) await collectKeywords(keywords);
  console.log('주간 자동 수집 완료:', new Date().toISOString());
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
