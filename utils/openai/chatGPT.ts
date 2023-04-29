const { scraper } = require("../webScraper");
const { extractURLs } = require("../isURI");
const fs = require("fs");
const path = require("path");
const { logger } = require("../logger");
const { extractKeywords } = require("../helpers");
require("dotenv").config();

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

  // We're using keywords from the user message to fetch only relevant files/codeblocks from the folder structure and send that to the openAI API.
  // If we do not do this, and the project which gets associated is even a mid-sized one, the API will throw an error.
  async access_folder_structure_and_files(
    currentFolderPath: string,
    keywords: any,
    depth = 0,
    currentContentLength = 0
  ): Promise<any> {
    if (depth > 3 || currentContentLength > 22000) {
      return { error: "You've reached the maximum allowed content length." };
    }

    const ignoreList = [
      "node_modules",
      ".env",
      "package-lock.json",
      ".git",
      ".gitignore",
      "README.md",
      "logs",
    ];

    let output: {
      directory: string;
      children: Array<{
        type: "directory" | "file" | "error";
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
              type: "directory",
              name: item,
              contents: subdirOutput,
            });

            currentContentLength += JSON.stringify(subdirOutput).length;
          }
        } else {
          const fileContent = fs.readFileSync(itemPath, "utf-8");
          const fileRelevant =
            keywords.fileNames.includes(item) ||
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
              type: "file",
              name: item,
              contents: limitedContent,
            });

            currentContentLength += JSON.stringify(
              output.children[output.children.length - 1]
            ).length;
          }
        }

        if (currentContentLength > 22000) {
          output.children.push({
            type: "error",
            contents:
              "Content length limit reached. Some content may be omitted.",
          });
          break;
        }
      }
      return output;
    } catch (e) {
      return {
        type: "error",
        contents: `Error accessing folder ${currentFolderPath}: ${
          (e as Error).message
        }`,
      };
    }
  }

  async get_documentation_content(
    question: string,
    url?: string
  ): Promise<string> {
    // If no URL is provided, use the default documentation URL
    const documentationUrl = url || "https://example.com/documentation";

    const scrapedContent = await scraper(documentationUrl);
    console.log(scrapedContent);

    return scrapedContent;
  }

  async get_response(
    user_id: string,
    text: string,
    followUpMessage?: string
  ): Promise<string> {
    try {
      this.memory.append(user_id, { role: "user", content: text });

      let documentationContent = "";

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
          role: "assistant",
          content: documentationContent,
        });
      }

      // Extract keywords from the user's message
      const keywords = extractKeywords(text);

      if (text.toLowerCase().includes("show folder structure")) {
        const folderStructureContent =
          await this.access_folder_structure_and_files(
            process.env.FS_PROJECT_FOLDER_PATH!,
            keywords
          );

        console.log(folderStructureContent);
        this.memory.append(user_id, {
          role: "user",
          content: folderStructureContent,
        });
      }

      if (followUpMessage) {
        this.memory.append(user_id, { role: "user", content: followUpMessage });
      }

      const response = await this.model.chatCompletion(
        this.memory.get(user_id)
      );

      const role = response.data.choices[0].message.role;
      const content = response.data.choices[0].message.content;
      this.memory.append(user_id, { role: role, content: content });
      return content;
    } catch (e) {
      console.log(e);
      logger.error(
        `[L152]: Error in ${path.resolve(__dirname)}:  ${e as Error}`
      );
      return "Something went wrong. Please try again.";
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
