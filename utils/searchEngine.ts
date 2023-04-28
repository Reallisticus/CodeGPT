const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("./logger");

async function search(query: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await axios.get(url);
    const results = response.data.items.map((item: any) => item.link);
    console.log(results);

    return results;
  } catch (error) {
    console.error(`Error while searching: ${(error as Error).message}`);
    logger.error(`Error while searching: ${error}`);
    return [];
  }
}

async function getRelevantInfo(url: string, keyword: string): Promise<string> {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const bodyText = $("body").text(); // Get the entire text of the body
    const index = bodyText.toLowerCase().indexOf(keyword.toLowerCase()); // Find the index of the keyword (case-insensitive)

    if (index === -1) {
      return "Keyword not found in the text.";
    }

    const snippet = bodyText.slice(index, index + 2000); // Extract 2000 characters after the keyword
    return snippet;
  } catch (error) {
    console.error(`Error while scraping: ${(error as Error).message}`);
    logger.error(`Error while scraping: ${error}`);
    return "";
  }
}

export { search, getRelevantInfo };
