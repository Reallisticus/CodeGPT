const { Client, ActivityType, GatewayIntentBits } = require("discord.js");
const logging = require("./logger"); // Replace this with the path to your logger file

const intents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
];

class DiscordClient extends Client {
  constructor() {
    super({ intents });
    this.synced = false;
    this.added = false;
    this.activity = {
      type: ActivityType.WATCHING,
      name: "/chat | /reset | /imagine | /create | /files | /search",
    };
  }

  async onReady() {
    await this.waitUntilReady();
    logging.info("Syncing");
    if (!this.synced) {
      await this.tree.sync();
      this.synced = true;
    }
    if (!this.added) {
      this.added = true;
    }
    logging.info(`Synced, ${this.user.tag} is running!`);
  }
}

class Sender {
  async sendMessage(interaction: any, send: any, receive: any) {
    try {
      const userId = interaction.user.id;
      const response = `> **${send}** - <@${userId}> \n\n ${receive}`;
      await interaction.followUp.send(response);
      logging.info(`${userId} sent: ${send}, response: ${receive}`);
    } catch (error) {
      await interaction.followUp.send(
        "> **Error: Something went wrong, please try again later!**"
      );
      logging.error(
        `Error while sending: ${send} in chatgpt model, error: ${error}`
      );
    }
  }

  async sendImage(interaction: any, send: any, receive: any) {
    try {
      const userId = interaction.user.id;
      const response = `> **${send}** - <@${userId}> \n\n`;
      await interaction.followUp.send(response);
      await interaction.followUp.send(receive);
      logging.info(`${userId} sent: ${send}, response: ${receive}`);
    } catch (error) {
      await interaction.followUp.send(
        "> **Error: Something went wrong, please try again later!**"
      );
      logging.error(
        `Error while sending: ${send} in dalle model, error: ${error}`
      );
    }
  }
}

module.exports = { DiscordClient, Sender };
