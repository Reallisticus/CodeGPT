const { SlashCommandBuilder } = require('discord.js');
const { DiscordClient, Sender } = require('../../discordClient');
const client = new DiscordClient();
const sender = new Sender();
const { ChatGPT, DALLE } = require('../../chatgpt');
const { OpenAIModel } = require('../../models/openaiModel');
const { Memory } = require('../../models/memoryModel');
const { splitResponse } = require('../../utils/helpers');

const models = new OpenAIModel(
  process.env.OPENAI_API,
  process.env.OPENAI_MODEL_ENGINE
);

const memory = new Memory(process.env.SYSTEM_MESSAGE);
const chatgpt = new ChatGPT(models, memory);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with ChatGPT')
    .addStringOption((option: any) =>
      option
        .setName('message')
        .setDescription('The message to send to ChatGPT')
        .setRequired(true)
    ),
  async execute(interaction: any) {
    const userId = interaction.user.id;
    const message = interaction.options.getString('message');

    if (interaction.user === client.user) {
      return;
    }
    await interaction.deferReply();
    if (message.toLowerCase().startsWith('sfs')) {
      const folderStructureMessage = 'show folder structure';
      const followUpMessage = message.slice(3).trim(); // Remove the "sfs" part and any whitespace

      const response = await chatgpt.get_response(
        userId,
        folderStructureMessage,
        followUpMessage
      );
      const chunks = splitResponse(response);

      for (const chunk of chunks) {
        await interaction.followUp({ content: chunk, ephemeral: true });
      }
    } else {
      const response = await chatgpt.get_response(userId, message);
      const chunks = splitResponse(response);

      for (const chunk of chunks) {
        await interaction.followUp({ content: chunk, ephemeral: true });
      }
    }
  },
};

export {};
