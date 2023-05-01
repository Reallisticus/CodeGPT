const { SlashCommandBuilder } = require("discord.js");
const { DiscordClient } = require("../../utils/discordClient");
const client = new DiscordClient();
const { ChatGPT } = require("../../controllers/chatGPT");
const { OpenAIModel } = require("../../models/openaiModel");
const { Memory } = require("../../models/memoryModel");
const { splitResponse } = require("../../utils/helpers");
const { search } = require("../../utils/searchEngine");

const models = new OpenAIModel(
  process.env.OPENAI_API,
  process.env.OPENAI_MODEL_ENGINE
);

const memory = new Memory(process.env.OPENAI_SYSTEM_MESSAGE);
const chatgpt = new ChatGPT(models, memory);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search with ChatGPT")
    .addStringOption((option: any) =>
      option
        .setName("query")
        .setDescription("What do you want to search for?")
        .setRequired(true)
    ),
  async execute(interaction: any) {
    const userId = interaction.user.id;
    const query = interaction.options.getString("query");

    if (interaction.user === client.user) {
      return;
    }
    await interaction.deferReply();
    const results = await search(query);
    const links = results.slice(0, 3).join("\n"); // Limit the number of links provided to the model
    const message = `Based on a search of the internet, please provide a brief answer to the following question: ${query}. Here are some links to help you:\n${links}`;

    const response = await chatgpt.get_response(userId, message);
    const chunks = splitResponse(response);

    for (const chunk of chunks) {
      await interaction.followUp({ content: chunk, ephemeral: true });
    }
  },
};

export {};
