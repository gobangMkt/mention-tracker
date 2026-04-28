import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import { searchNaver } from './api/naver.js';
import { searchGoogle } from './api/google.js';
import { saveWeeklyResult, loadAllResults, loadKeywords, saveKeywords, cleanupOldWeeks } from './data/store.js';

const app = express();
app.use(cors());
app.use(express.json());

const collectKeywords = async (keywords) => {
  const results = [];
  for (const keyword of keywords) {
    const naver = await searchNaver(keyword);
    const google = await searchGoogle(keyword);
    results.push({ keyword, naver, google });
  }
  const week = await saveWeeklyResult(results);
  return { week, results };
};

app.get('/api/results', async (req, res) => {
  try {
    res.json(await loadAllResults());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/collect', async (req, res) => {
  const { keywords } = req.body;
  if (!keywords?.length) return res.status(400).json({ error: '키워드 없음' });
  try {
    const { week, results } = await collectKeywords(keywords);
    await cleanupOldWeeks();
    res.json({ success: true, week, results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/keywords', async (req, res) => {
  try {
    res.json(await loadKeywords());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/keywords', async (req, res) => {
  try {
    await saveKeywords(req.body.keywords);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 매주 월요일 오전 9시 자동 수집
cron.schedule('0 9 * * 1', async () => {
  try {
    const keywords = await loadKeywords();
    if (keywords.length) {
      await collectKeywords(keywords);
      await cleanupOldWeeks();
    }
    console.log('주간 자동 수집 완료:', new Date().toISOString());
  } catch (e) {
    console.error('자동 수집 실패:', e.message);
  }
});

// 프론트엔드 정적 파일 서빙 (프로덕션)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
