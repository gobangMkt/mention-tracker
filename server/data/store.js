import axios from 'axios';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY = process.env.FIREBASE_API_KEY;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const getWeekLabel = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

// Firestore REST: JS 값 → Firestore 필드 (JSON 문자열로 단순화)
const toFirestore = (obj) => ({
  fields: Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      { stringValue: typeof v === 'string' ? v : JSON.stringify(v) },
    ])
  ),
});

// Firestore REST: 문서 → JS 값
const fromFirestore = (doc) => {
  const id = doc.name.split('/').pop();
  const fields = {};
  for (const [k, v] of Object.entries(doc.fields || {})) {
    const raw = v.stringValue ?? '';
    try { fields[k] = JSON.parse(raw); } catch { fields[k] = raw; }
  }
  return { id, ...fields };
};

export const loadAllResults = async () => {
  try {
    const res = await axios.get(`${BASE}/weeks?key=${API_KEY}`);
    const docs = res.data.documents || [];
    return docs.map(fromFirestore).sort((a, b) => a.id.localeCompare(b.id))
      .map(({ id, collectedAt, data }) => ({ week: id, collectedAt, data }));
  } catch (e) {
    console.error('loadAllResults 오류:', e.response?.data || e.message);
    return [];
  }
};

export const saveWeeklyResult = async (results) => {
  const week = getWeekLabel();
  const body = toFirestore({
    collectedAt: new Date().toISOString(),
    data: results,
  });
  await axios.patch(`${BASE}/weeks/${week}?key=${API_KEY}`, body);
  return week;
};

export const loadKeywords = async () => {
  try {
    const res = await axios.get(`${BASE}/config/keywords?key=${API_KEY}`);
    const doc = fromFirestore(res.data);
    return doc.list || [];
  } catch { return []; }
};

export const saveKeywords = async (keywords) => {
  const body = toFirestore({ list: keywords });
  await axios.patch(`${BASE}/config/keywords?key=${API_KEY}`, body);
};

export const cleanupOldWeeks = async () => {
  try {
    const res = await axios.get(`${BASE}/weeks?key=${API_KEY}`);
    const docs = res.data.documents || [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 84);

    let count = 0;
    for (const doc of docs) {
      const entry = fromFirestore(doc);
      const collectedAt = new Date(entry.collectedAt);
      if (collectedAt >= cutoff) continue;
      const hasItems = entry.data?.some((kd) => kd.naver?.blog?.items?.length > 0);
      if (!hasItems) continue;

      const stripped = entry.data.map((kd) => ({
        keyword: kd.keyword,
        naver: {
          blog: { total: kd.naver.blog.total, items: [] },
          news: { total: kd.naver.news.total, items: [] },
          cafe: { total: kd.naver.cafe.total, items: [] },
        },
        google: { total: kd.google.total, items: [] },
      }));

      const week = entry.id;
      const body = toFirestore({ collectedAt: entry.collectedAt, data: stripped });
      await axios.patch(`${BASE}/weeks/${week}?key=${API_KEY}`, body);
      count++;
    }
    if (count) console.log(`cleanup 완료: ${count}개 주차 아이템 삭제`);
  } catch (e) {
    console.error('cleanupOldWeeks 오류:', e.response?.data || e.message);
  }
};
