const { SlashCommandBuilder } = require("discord.js");
const { DiscordClient } = require("../../utils/discordClient");
const client = new DiscordClient();
const { ChatGPT } = require("../../controllers/chatGPT");
const { OpenAIModel } = require("../../models/openaiModel");
const { Memory } = require("../../models/memoryModel");
const { splitResponse } = require("../../utils/helpers");

import type { RequestInfo, RequestInit, Response } from "node-fetch";

const fetch = (...args: [RequestInfo, RequestInit?]) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const models = new OpenAIModel(
  process.env.OPENAI_API,
  process.env.OPENAI_MODEL_ENGINE
);

const memory = new Memory(process.env.OPENAI_SYSTEM_MESSAGE);
const chatgpt = new ChatGPT(models, memory);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fileparse")
    .setDescription("Parse a .txt file and get a response from ChatGPT")
    .addStringOption((option: any) =>
      option
        .setName("file")
        .setDescription("The URL of the .txt file you want to parse")
        .setRequired(true)
    ),
  async execute(interaction: any) {
    const userId = interaction.user.id;
    const fileUrl = interaction.options.getString("file");

    if (interaction.user === client.user) {
      return;
    }

    if (interaction.attachments.size === 0) {
      await interaction.reply("Please attach a .txt file.");
      return;
    }

    const file = interaction.attachments.first();

    if (!file.name.endsWith(".txt")) {
      await interaction.reply("Invalid file type. Please upload a .txt file.");
      return;
    }

    await interaction.deferReply();
    try {
      const fileText = await fetch(file.url).then((response: any) =>
        response.text()
      );
      const response = await chatgpt.get_response(userId, fileText);
      const chunks = splitResponse(response);

      for (const chunk of chunks) {
        await interaction.followUp({ content: chunk, ephemeral: true });
      }
    } catch (error) {
      console.error(
        `Error while parsing the .txt file: ${(error as Error).message}`
      );
      await interaction.followUp({
        content: "An error occurred while parsing the .txt file.",
        ephemeral: true,
      });
    }
  },
};

export {};
