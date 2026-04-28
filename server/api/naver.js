import axios from 'axios';

const parseNaverDate = (dateStr) => {
  if (!dateStr) return null;
  if (/^\d{8}$/.test(dateStr)) {
    return new Date(
      parseInt(dateStr.slice(0, 4)),
      parseInt(dateStr.slice(4, 6)) - 1,
      parseInt(dateStr.slice(6, 8))
    );
  }
  return new Date(dateStr);
};

const searchType = async (type, keyword) => {
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
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const items = res.data.items.map((item) => ({
      title: item.title.replace(/<[^>]+>/g, ''),
      link: item.link || item.originallink,
      date: item.postdate || item.pubDate,
      titleMatch: /<b>/i.test(item.title),
    }));
    const periodCount = items.filter((item) => {
      const d = parseNaverDate(item.date);
      return d && d >= cutoff;
    }).length;
    return { total: res.data.total, periodCount, items };
  } catch (e) {
    console.error(`네이버 ${type} 오류:`, e.response?.status, e.response?.data?.errorMessage || e.message);
    return { total: 0, periodCount: 0, items: [] };
  }
};

export const searchNaver = async (keyword) => ({
  blog: await searchType('blog', keyword),
  news: await searchType('news', keyword),
  cafe: await searchType('cafearticle', keyword),
});
