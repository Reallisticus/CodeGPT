const { scraper } = require('./webScraper');
const { containsURL, extractURLs } = require('./utils/isURI');
const fs = require('fs');
const path = require('path');

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

  async access_folder_structure_and_files(
    currentFolderPath: string,
    depth = 0
  ): Promise<string> {
    // Avoid going too deep in the folder structure or showing sensitive files to the user
    if (depth > 3) {
      return "You've reached the maximum allowed folder depth.";
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

    try {
      const items = fs.readdirSync(currentFolderPath);
      let output = `Folder: ${path.basename(currentFolderPath)}\n\n`;

      for (const item of items) {
        if (ignoreList.includes(item)) {
          continue; // Skip the current item if it is in the ignore list
        }
        const itemPath = path.join(currentFolderPath, item);
        const isDirectory = fs.statSync(itemPath).isDirectory();
        if (isDirectory) {
          output += `📁 ${item}\n`;
          if (depth < 3) {
            output += await this.access_folder_structure_and_files(
              itemPath,
              depth + 1
            );
            output += '\n';
          }
        } else {
          output += `📄 ${item}\n`;

          // Set file size limit to prevent extremely long content display, e.g., 50 KB for plain text files
          if (depth < 2 && fs.statSync(itemPath).size < 50 * 1024) {
            const fileContent = fs.readFileSync(itemPath, 'utf-8');
            output += `---\nFile content (first 1000 characters):\n${fileContent.substring(
              0,
              1000
            )}\n---\n\n`;
          }
        }
      }
      return output;
    } catch (e) {
      return `Error accessing folder ${currentFolderPath}: ${
        (e as Error).message
      }`;
    }
  }

  async get_documentation_content(
    question: string,
    url?: string
  ): Promise<string> {
    // If no URL is provided, use the default documentation URL
    const documentationUrl = url || 'https://example.com/documentation';

    const scrapedContent = await scraper(documentationUrl);
    console.log(scrapedContent);

    return scrapedContent;
  }

  async get_response(
    user_id: string,
    text: string,
    followUpMessage?: string
  ): Promise<string> {
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

    if (text.toLowerCase().includes('show folder structure')) {
      const folderStructureContent =
        await this.access_folder_structure_and_files(
          'C:\\Users\\nickj.DC1\\Desktop\\CodeGPT'
        );
      this.memory.append(user_id, {
        role: 'assistant',
        content: folderStructureContent,
      });
    }

    if (followUpMessage) {
      this.memory.append(user_id, { role: 'user', content: followUpMessage });
    }

    const response = await this.model.chatCompletion(this.memory.get(user_id));

    const role = response.data.choices[0].message.role;
    const content = response.data.choices[0].message.content;
    this.memory.append(user_id, { role: role, content: content });
    return content;
  }

  clean_history(user_id: string): void {
    this.memory.remove(user_id);
  }
}

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
