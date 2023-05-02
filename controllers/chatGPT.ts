const { scraper } = require('../utils/webScraper');
const { extractURLs } = require('../utils/isURI');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const { extractKeywords } = require('../utils/helpers');
require('dotenv').config();

interface ModelInterface {
  chatCompletion(messages: any[]): Promise<any>;
  imageGeneration(text: string): Promise<string>;
}

interface MemoryInterface {
  append(user_id: string, message: any): void;
  get(user_id: string): any[];
  remove(user_id: string): void;
}

class ChatGPT {
  private model: ModelInterface;
  private memory: MemoryInterface;

  constructor(model: ModelInterface, memory: MemoryInterface) {
    this.model = model;
    this.memory = memory;
  }

  async get_ai_response(
    messages: any[]
  ): Promise<{ role: string; content: string }> {
    try {
      const response = await this.model.chatCompletion(messages);
      logger.info(
        `[ChatGPT|get_ai_response]: Prompt sent to OpenAI: ${JSON.stringify(
          messages
        )}`
      );
      const role = response.data.choices[0].message.role;
      const content = response.data.choices[0].message.content;
      logger.info(`[ChatGPT|get_ai_response]: Model response: ${content}`);

      return { role, content };
    } catch (e) {
      console.log(e);
      logger.error(
        `[ChatG{T|get_ai_response]: Error in ${path.resolve(__dirname)}: ${
          (e as Error).message
        }`
      );
      return {
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      };
    }
  }

  async get_relevant_keywords_or_files(
    query: string,
    user_id: string,
    keywords?: string[] // Add the keywords parameter
  ): Promise<string[]> {
    const prompt = keywords
      ? `Given the following query: "${query}" and these keywords: "${keywords.join(
          '", "'
        )}", suggest relevant keywords, files or folders that might be useful to look into.`
      : `Given the following query: "${query}", suggest relevant keywords, files or folders that might be useful to look into.`;

    const responseObj = await this.get_ai_response(
      this.memory.get(user_id).concat({ role: 'user', content: prompt })
    );

    // Process the response to extract keywords or file/folder names
    const extractedKeywords = extractKeywords(responseObj.content);

    return extractedKeywords;
  }

  // We're using keywords from the user message to fetch only relevant files/codeblocks from the folder structure and send that to the openAI API.
  // If we do not do this, and the project which gets associated is even a mid-sized one, the API will throw an error.

  async access_folder_structure_and_files(
    currentFolderPath: string,
    keywords: any,
    depth = 0,
    currentContentLength = 0
  ): Promise<any> {
    if (depth > 3) {
      logger.error(
        `[ChatGPT|access_folder_structure_and_files]: Depth is ${depth} (max allowed: 3)  `
      );
      return { error: "You've reached the maximum allowed content length." };
    }

    const ignoreList = [
      'node_modules',
      '.env',
      'package-lock.json',
      '.git',
      '.gitignore',
      'README.md',
      'logs',
    ];

    let output: {
      directory: string;
      children: Array<{
        type: 'directory' | 'file' | 'error';
        name?: string;
        contents?: any;
      }>;
    } = {
      directory: path.basename(currentFolderPath),
      children: [],
    };

    try {
      const items = fs.readdirSync(currentFolderPath);

      for (const item of items) {
        if (ignoreList.includes(item)) {
          continue;
        }

        const itemPath = path.join(currentFolderPath, item);
        const isDirectory = fs.statSync(itemPath).isDirectory();

        if (isDirectory) {
          if (depth < 3) {
            const subdirOutput = await this.access_folder_structure_and_files(
              itemPath,
              keywords,
              depth + 1,
              currentContentLength
            );

            output.children.push({
              type: 'directory',
              name: item,
              contents: subdirOutput,
            });

            currentContentLength += JSON.stringify(subdirOutput).length;
          }
        } else {
          const fileContent = fs.readFileSync(itemPath, 'utf-8');
          const fileRelevant =
            keywords.fileNames.some((filename: string) =>
              item.toLowerCase().includes(filename.toLowerCase())
            ) ||
            keywords.functionNames.some((fn: string) =>
              fileContent.includes(fn)
            ) ||
            keywords.variables.some((varName: string) =>
              fileContent.includes(varName)
            );

          if (fileRelevant) {
            let limitedContent = fileContent;

            if (depth < 2 && fs.statSync(itemPath).size < 150 * 1024) {
              limitedContent = fileContent.substring(
                0,
                Math.min(1500, fileContent.length)
              );
            }

            output.children.push({
              type: 'file',
              name: item,
              contents: limitedContent,
            });

            currentContentLength += JSON.stringify(
              output.children[output.children.length - 1]
            ).length;
          }
        }

        if (currentContentLength > 22000) {
          logger.error(
            `[ChatGPT|access_folder_structure_and_files]: Content Length is ${currentContentLength} (max allowed: 22000)  `
          );
          output.children.push({
            type: 'error',
            contents:
              'Content length limit reached. Some content may be omitted.',
          });
          break;
        }
      }
    } catch (e) {
      logger.error(
        `[ChatGPT|access_folder_structure_and_files]: Error accessing folder ${currentFolderPath}:  ${
          e as Error
        }`
      );
      output.children.push({
        type: 'error',
        contents: `Error accessing folder ${currentFolderPath}: ${e as Error}`,
      });
    }
    return output;
  }

  async get_documentation_content(
    question: string,
    url?: string
  ): Promise<string> {
    // If no URL is provided, use the default documentation URL
    const documentationUrl = url || 'https://example.com/documentation';

    const scrapedContent = await scraper(documentationUrl);

    return scrapedContent;
  }

  async get_response(
    user_id: string,
    text: string,
    followUpMessage?: string,
    userKeywords?: string[]
  ): Promise<string> {
    try {
      this.memory.append(user_id, { role: 'user', content: text });

      let documentationContent = '';

      const urls = extractURLs(text);

      if (urls.length > 0) {
        // Use the first URL found in the user's message
        const url = urls[0];

        // Get the scraped content from the provided URL
        documentationContent = await this.get_documentation_content(text, url);
      }

      if (documentationContent) {
        // Add the scraped content as an assistant message
        this.memory.append(user_id, {
          role: 'assistant',
          content: documentationContent,
        });
      }

      // Extract keywords from the user's message
      // Extract keywords from the user's message
      const extractedKeywords = extractKeywords(text);

      // Combine the userKeywords and extractedKeywords
      const combinedKeywords = [...(userKeywords || []), extractedKeywords];

      console.log(combinedKeywords);

      if (text.toLowerCase().includes('--sfs')) {
        const suggestions = await this.get_relevant_keywords_or_files(
          text,
          user_id,
          combinedKeywords
        );

        const folderStructureContent =
          await this.access_folder_structure_and_files(
            process.env.FS_PROJECT_FOLDER_PATH!,
            suggestions
          );

        for (const fileObj of folderStructureContent.children) {
          console.log(fileObj.contents.children);
          if (fileObj.type === 'file') {
            this.memory.append(user_id, {
              role: 'user',
              content: fileObj.contents,
            });
          }
        }
      }

      if (followUpMessage) {
        this.memory.append(user_id, { role: 'user', content: followUpMessage });
        logger.info(`[ChatGPT]: Follow-up message: ${followUpMessage}`);
      }

      const responseObj = await this.get_ai_response(this.memory.get(user_id));

      this.memory.append(user_id, {
        role: responseObj.role,
        content: responseObj.content,
      });
      logger.info(
        `[ChatGPT|get_response]: Final response: ${responseObj.content}`
      );
      return responseObj.content;
    } catch (e) {
      console.log(e);
      logger.error(
        `[ChatGPT|get_response]: Error in get_response: ${e as Error}`
      );
      return 'Something went wrong. Please try again.';
    }
  }

  clean_history(user_id: string): void {
    this.memory.remove(user_id);
  }
}

/*
# TODO: /imagine integration
*/

class DALLE {
  private model: ModelInterface;

  constructor(model: ModelInterface) {
    this.model = model;
  }

  async generate(text: string): Promise<string> {
    return await this.model.imageGeneration(text);
  }
}

export { ChatGPT, DALLE };
