import axios from 'axios';

export const searchGoogle = async (keyword) => {
  const apiKey = process.env.SERPER_API_KEY;
  try {
    const res = await axios.post('https://google.serper.dev/search', {
      q: `"${keyword}"`, gl: 'kr', hl: 'ko', num: 10,
    }, {
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
