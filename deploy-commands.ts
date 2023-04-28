const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const clientId = '1101368215415828480';
const guildId = '1100055194202538064';
const commands = [];
const commandFolders = ['chat', 'search', 'create', 'files'];

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(path.join(__dirname, 'commands', folder))
    .filter((file: any) => file.endsWith('.ts'));

  for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', folder, file));
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
