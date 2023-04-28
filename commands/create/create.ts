const { PermissionFlagsBits } = require("discord.js");
const { SlashCommandBuilder, ChannelType } = require("discord.js");
require("dotenv").config();

const personalChannels = new Map<string, string>();

async function createPersonalChannel(interaction: any) {
  const user = interaction.user;
  const channelName = `Private-${user.username}`;

  try {
    const channel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guildId!,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
        },
        {
          id: user!.id, // Grant permissions to the channel creator
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
        },
        {
          id: process.env.DISCORD_BOT_ID, // Grant permissions to the specified user/bot
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
        },
      ],
    });
    personalChannels.set(user.id, channel.id);

    await interaction.reply(
      `Your personal channel has been created: <#${channel.id}>`
    );
  } catch (err) {
    console.log(`Error creating channel: ${(err as Error).message}`);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create your own personal channel"),
  async execute(interaction: any) {
    if (!interaction.isCommand()) return;
    await createPersonalChannel(interaction);
  },
};

export {};
