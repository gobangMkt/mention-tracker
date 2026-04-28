import axios from 'axios';

const daysToPeriod = (days) => {
  if (!days) return 'any time';
  if (days <= 7) return 'd7';
  if (days <= 30) return 'm1';
  if (days <= 90) return 'm3';
  return 'any time';
};

export const searchGoogle = async (keyword, days) => {
  const apiKey = process.env.SERPER_API_KEY;
  const tbs = days ? daysToPeriod(days) : null;

  try {
    const body = { q: `"${keyword}"`, gl: 'kr', hl: 'ko', num: 10 };
    if (tbs && tbs !== 'any time') body.tbs = `qdr:${tbs.replace('d','d').replace('m','m')}`;

    const res = await axios.post('https://google.serper.dev/search', body, {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    const organic = res.data.organic || [];
    return {
      total: res.data.searchInformation?.totalResults
        ? parseInt(res.data.searchInformation.totalResults)
        : organic.length,
      items: organic.map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        date: item.date,
        titleMatch: item.title.toLowerCase().includes(keyword.toLowerCase()),
      })),
    };
  } catch (e) {
    console.error('구글(Serper) 오류:', e.response?.status, e.response?.data || e.message);
    return { total: 0, items: [] };
  }
};
