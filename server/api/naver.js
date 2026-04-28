import axios from 'axios';

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
    const items = res.data.items.map((item) => ({
      title: item.title.replace(/<[^>]+>/g, ''),
      link: item.link || item.originallink,
      date: item.postdate || item.pubDate,
      titleMatch: /<b>/i.test(item.title),
    }));
    return { total: res.data.total, items };
  } catch (e) {
    console.error(`네이버 ${type} 오류:`, e.response?.status, e.response?.data?.errorMessage || e.message);
    return { total: 0, items: [] };
  }
};

export const searchNaver = async (keyword) => ({
  blog: await searchType('blog', keyword),
  news: await searchType('news', keyword),
  cafe: await searchType('cafearticle', keyword),
});
