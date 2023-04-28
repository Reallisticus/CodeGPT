# CodeGPT

CodeGPT is a Discord bot that utilizes OpenAI's GPT models to provide assistance, advice, and feedback for developers in a wide range of programming topics. It can also search for relevant information from the internet, recommend suitable code snippets, help debug issues, and map the whole folder structure of a project to generate responses based on user queries.

## Features

- Responds to user queries on a variety of programming topics
- Visits websites to fetch relevant information
- Provides recommendations for code snippets
- Assists in debugging issues and finding solutions to problems
- Maps the folder structure of a project and inspects file content
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

Make sure to configure the Discord bot and Google Search Engine settings before running the script.

4. Compile TypeScript:

```bash
npx tsc
```

5. Run the bot:

```bash
node main.js
```

## Examples

Here are some examples of how to interact with the bot using commands:

- To initiate a chat with the bot:

```
/chat Hello, I need help with a JavaScript problem.
```

- To reset the conversation:

```
/reset
```

- To generate an image from a description (TODO: Currently not implemented):

```
/imagine A beautiful sunset over a beach with palm trees.
```

- To search the web for relevant information:

```
/search How to use WebSocket in Node.js?
```

- To use the "sfs" functionality to map the folder structure and inspect file contents:

```
/chat Map the folder structure of the project and show me the contents of the "README.md" file.
```

## Contributing

Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

```

```
