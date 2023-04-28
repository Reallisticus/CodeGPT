const axios = require('axios');
const cheerio = require('cheerio');

async function scraper(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    let text = '';

    $('p, h1, h2, h3, h4, h5, h6, li, span, pre').each(
      (_index: any, element: any) => {
        text += $(element).text() + '\n';
      }
    );

    return text;
  } catch (error) {
    console.error(`Error while scraping ${url}: ${(error as Error).message}`);
    return '';
  }
}

export { scraper };
