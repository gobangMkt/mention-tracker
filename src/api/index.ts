import axios from 'axios';
import type { WeeklyResult } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'https://mention-tracker-production.up.railway.app/api';

export const fetchResults = (): Promise<WeeklyResult[]> =>
  axios.get(`${BASE}/results`).then((r) => r.data);

export const fetchKeywords = (): Promise<string[]> =>
  axios.get(`${BASE}/keywords`).then((r) => r.data);

export const saveKeywords = (keywords: string[]): Promise<void> =>
  axios.post(`${BASE}/keywords`, { keywords }).then(() => undefined);

export const collectNow = (keywords: string[], days: number): Promise<{ success: boolean }> =>
  axios.post(`${BASE}/collect`, { keywords, days: days || null }).then((r) => r.data);
