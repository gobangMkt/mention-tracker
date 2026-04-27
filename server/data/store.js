import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_FILE = path.join(__dirname, 'results.json');
const KEYWORDS_FILE = path.join(__dirname, 'keywords.json');

const readJson = (file, fallback) => {
  if (!fs.existsSync(file)) return fallback;
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return fallback; }
};

const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');

export const loadAllResults = () => readJson(RESULTS_FILE, []);

export const saveWeeklyResult = (results, days) => {
  const all = loadAllResults();
  const week = getWeekLabel();
  const existing = all.findIndex((r) => r.week === week);
  const entry = { week, collectedAt: new Date().toISOString(), days: days || null, data: results };
  if (existing >= 0) all[existing] = entry;
  else all.push(entry);
  writeJson(RESULTS_FILE, all);
};

export const loadKeywords = () => readJson(KEYWORDS_FILE, []);
export const saveKeywords = (keywords) => writeJson(KEYWORDS_FILE, keywords);

const getWeekLabel = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
};
