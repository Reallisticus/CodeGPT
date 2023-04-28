# CodeGPT

CodeGPT is a Discord bot that utilizes OpenAI's GPT models to provide assistance, advice, and feedback for developers in a wide range of programming topics. It can also search for relevant information from the internet, recommend suitable code snippets, help debug issues, and map the whole folder structure of a project to generate responses based on user queries.

## Features

- Responds to user queries on a variety of programming topics
- Visits websites to fetch relevant information
- Provides recommendations for code snippets
- Assists in debugging issues and finding solutions to problems
- Maps the folder structure of a project, inspects file contents and provides responses for the given project.
- Generates images from textual descriptions (TODO: Currently not implemented)

## Technologies Used

- Node.js
- TypeScript
- Discord.js
- OpenAI API
- Cheerio (for web scraping)
- Google Custom Search API
- Winston (for logging)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/user/codegpt.git
cd codegpt
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file in the root directory of the project and add the required environment variables:

```
DISCORD_TOKEN=<your-discord-bot-token>
OPENAI_API_KEY=<your-openai-api-key>
OPENAI_ORGANIZATION_ID=<your-openai-organization-id>
OPENAI_MODEL_ENGINE=<your-openai-model-engine>
GOOGLE_API_KEY=<your-google-api-key>
GOOGLE_SEARCH_ENGINE_ID=<your-google-search-engine-id>
```

4. Create a Discord Application, following the [Discord Developer Portal](https://discord.com/developers/applications)
   &nbsp;
5. Create a Google Developer Account, set up a Custom Search Engine and get the key for it. (If you do not want to do this, simply remove the "search" entry from the
   array located in `utils/deployCommands @commandFolders` and run Step 6)
   &nbsp;
6. Run

   `ts-node utils\deployCommands.ts`
   &nbsp;

7. Run
   `ts-node main.ts`

## Commands

- /chat: Chat with the AI developer to get help or advice (If you drop a link, it'll web-scrape it, and provide an answer based on it, perfect for dropping updated docs)
- /create: Create a personal channel for yourself, thus keeping your conversations private.
- /files: Drop a .txt file with more than 2000/4000 symbols to bypass Discords character limit
- /modify: #TODO: Directly modify the files of a project.
- /search: Search the web for relevant information or resources
- /whoami: Show quick info about the bot.

## Contributing

Currently not available, but feel free to fork the repository and make changes as you see fit.

## License

This project is licensed under the MIT License.

## Authors

- [@reallisticus](https://www.github.com/reallisticus)

```

```
