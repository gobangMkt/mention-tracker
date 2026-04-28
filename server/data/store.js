import { db } from '../lib/firebase.js';
import {
  doc, getDoc, setDoc, getDocs, collection, updateDoc,
} from 'firebase/firestore';

const getWeekLabel = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

export const loadAllResults = async () => {
  const snap = await getDocs(collection(db, 'weeks'));
  const results = [];
  snap.forEach((d) => results.push({ week: d.id, ...d.data() }));
  return results.sort((a, b) => a.week.localeCompare(b.week));
};

export const saveWeeklyResult = async (results) => {
  const week = getWeekLabel();
  await setDoc(doc(db, 'weeks', week), {
    collectedAt: new Date().toISOString(),
    data: results,
  });
  return week;
};

export const loadKeywords = async () => {
  const snap = await getDoc(doc(db, 'config', 'keywords'));
  return snap.exists() ? snap.data().list : [];
};

export const saveKeywords = async (keywords) => {
  await setDoc(doc(db, 'config', 'keywords'), { list: keywords });
};

// 12주(84일) 초과 데이터는 아이템 목록만 삭제, 건수는 유지
export const cleanupOldWeeks = async () => {
  const snap = await getDocs(collection(db, 'weeks'));
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 84);

  const updates = [];
  snap.forEach((d) => {
    const entry = d.data();
    const collectedAt = new Date(entry.collectedAt);
    if (collectedAt >= cutoff) return;
    const hasItems = entry.data?.some((kd) => kd.naver?.blog?.items?.length > 0);
    if (!hasItems) return;

    const stripped = entry.data.map((kd) => ({
      keyword: kd.keyword,
      naver: {
        blog: { total: kd.naver.blog.total, items: [] },
        news: { total: kd.naver.news.total, items: [] },
        cafe: { total: kd.naver.cafe.total, items: [] },
      },
      google: { total: kd.google.total, items: [] },
    }));
    updates.push(updateDoc(doc(db, 'weeks', d.id), { data: stripped }));
  });

  await Promise.all(updates);
  console.log(`cleanup 완료: ${updates.length}개 주차 아이템 삭제`);
};
