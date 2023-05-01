const { SlashCommandBuilder } = require("discord.js");
const { DiscordClient } = require("../../utils/discordClient");
const client = new DiscordClient();
const { ChatGPT } = require("../../controllers/chatGPT");
const { OpenAIModel } = require("../../models/openaiModel");
const { Memory } = require("../../models/memoryModel");
const { splitResponse } = require("../../utils/helpers");
const path = require("path");
const { logger } = require("../../utils/logger");
const models = new OpenAIModel(
  process.env.OPENAI_API,
  process.env.OPENAI_MODEL_ENGINE
);

const memory = new Memory(process.env.OPENAI_SYSTEM_MESSAGE);
const chatgpt = new ChatGPT(models, memory);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Chat with ChatGPT")
    .addStringOption((option: any) =>
      option
        .setName("message")
        .setDescription("The message to send to ChatGPT")
        .setRequired(true)
    ),
  async execute(interaction: any) {
    const userId = interaction.user.id;
    const message = interaction.options.getString("message");

    console.log(userId);

    if (interaction.user === client.user) {
      return;
    }
    await interaction.deferReply();

    let followUpMessage;
    if (message.toLowerCase().includes("--sfs")) {
      followUpMessage = message.replace("--sfs", "").trim(); // Remove the "--sfs" part and any whitespace
    }

    const userKeywords =
      message.match(/"([^"]+)"/g)?.map((kw: string) => kw.replace(/"/g, "")) ||
      [];

    const response = await chatgpt.get_response(
      userId,
      message,
      followUpMessage,
      userKeywords
    );

    console.log(response);

    const chunks = splitResponse(response);

    for (const chunk of chunks) {
      await interaction.followUp({ content: chunk, ephemeral: true });
    }
  },
};

export {};
