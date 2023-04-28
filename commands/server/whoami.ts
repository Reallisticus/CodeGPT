const { SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const whoami = `CodeGPT is a Discord bot that leverages OpenAI's GPT models to provide assistance, advice, and feedback to developers on various programming topics. It can search relevant information from the internet, recommend code snippets, help debug issues, and map a project's folder structure to generate responses based on user queries. The bot is built using technologies such as Node.js, TypeScript, Discord.js, OpenAI API, Google Custom Search API, Cheerio (for web scraping), and Winston (for logging). The GitHub repository includes information on features, technologies used, setup instructions, and example interactions with the bot.
`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whoami")
    .setDescription("Information about CodeGPT"),
  async execute(interaction: any) {
    if (!interaction.isCommand()) return;
    await interaction.reply(whoami);
  },
};

export {};
