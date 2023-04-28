// #TODO: Allow the bot to fix the code that it's provided by itself...

// const { SlashCommandBuilder } = require('@discordjs/builders');
// const fs = require('fs');
// const path = require('path');
// const { getLogger } = require('../../logger');

// const logger = getLogger('ModifyCommand');

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName('modify')
//     .setDescription('Modify bot files (use with caution)')
//     .addStringOption((option: any) =>
//       option
//         .setName('file')
//         .setDescription('The file to modify')
//         .setRequired(true)
//     )
//     .addStringOption((option: any) =>
//       option
//         .setName('content')
//         .setDescription('The new content to add to the file')
//         .setRequired(true)
//     ),
//   async execute(interaction: any) {
//     const file = interaction.options.getString('file');
//     const content = interaction.options.getString('content');

//     try {
//       const filePath = path.join(__dirname, '..', '..', file);

//       if (!fs.existsSync(filePath)) {
//         await interaction.reply("Error: The specified file doesn't exist.");
//         return;
//       }

//       fs.writeFileSync(filePath, content, { encoding: 'utf8', flag: 'a' });
//       logger.info(`Modified file: ${filePath} – Content added: ${content}`);

//       await interaction.reply('File successfully modified');
//     } catch (error) {
//       logger.error(`Error while modifying file: ${(error as Error).message}`);
//       await interaction.reply('Error: Could not modify the file');
//     }
//   },
// };

// export {};
