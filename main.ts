import { Events, Interaction } from "discord.js";

const { Collection } = require("discord.js");
const { DiscordClient } = require("./utils/discordClient");
const client = new DiscordClient();
const { ChatGPT } = require("./controllers/chatGPT");
const { OpenAIModel } = require("./models/openaiModel");
const { Memory } = require("./models/memoryModel");
const { splitResponse } = require("./utils/helpers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const models = new OpenAIModel(
  process.env.OPENAI_API,
  process.env.OPENAI_MODEL_ENGINE
);

const memory = new Memory(process.env.OPENAI_SYSTEM_MESSAGE);
const chatgpt = new ChatGPT(models, memory);

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file: any) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

client.once(Events.ClientReady, () => {
  console.log("Ready!");
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.on("messageCreate", async (message: any) => {
  if (!message.content.startsWith("!fileparse") || message.author.bot) return;

  if (message.attachments.size === 0) {
    await message.reply("Please attach a .txt file.");
    return;
  }

  const file = message.attachments.first();

  if (!file.name.endsWith(".txt")) {
    await message.reply("Invalid file type. Please upload a .txt file.");
    return;
  }

  try {
    const fileText = await fetch(file.url).then((response) => response.text());
    const response = await chatgpt.get_response(message.author.id, fileText);
    const chunks = splitResponse(response);

    for (const chunk of chunks) {
      await message.reply(chunk);
    }
  } catch (error) {
    console.error(
      `Error while parsing the .txt file: ${(error as Error).message}`
    );
    await message.reply("An error occurred while parsing the .txt file.");
  }
});

client.login(process.env.DISCORD_TOKEN);

export {};
