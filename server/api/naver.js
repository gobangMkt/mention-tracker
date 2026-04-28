import axios from 'axios';

const parseNaverDate = (dateStr) => {
  if (!dateStr) return null;
  // postdate: YYYYMMDD
  if (/^\d{8}$/.test(dateStr)) {
    return new Date(`${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`);
  }
  // pubDate: Mon, DD Mon YYYY HH:MM:SS +0900
  return new Date(dateStr);
};

const filterByDays = (items, days) => {
  if (!days) return items;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return items.filter((item) => {
    const d = parseNaverDate(item.date);
    return d && d >= cutoff;
  });
};

const searchType = async (type, keyword, days) => {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  try {
    const res = await axios.get(`https://openapi.naver.com/v1/search/${type}.json`, {
      params: { query: `"${keyword}"`, display: 100, sort: 'date' },
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });
    const allItems = res.data.items.map((item) => ({
      title: item.title.replace(/<[^>]+>/g, ''),
      link: item.link || item.originallink,
      date: item.postdate || item.pubDate,
      titleMatch: /<b>/i.test(item.title),
    }));
    const filtered = filterByDays(allItems, days);
    return { total: res.data.total, periodCount: filtered.length, items: filtered };
  } catch (e) {
    console.error(`네이버 ${type} 오류:`, e.response?.status, e.response?.data?.errorMessage || e.message);
    return { total: 0, periodCount: 0, items: [] };
  }
};

export const searchNaver = async (keyword, days) => ({
  blog: await searchType('blog', keyword, days),
  news: await searchType('news', keyword, days),
  cafe: await searchType('cafearticle', keyword, days),
  web: await searchType('webkr', keyword, days),
});
