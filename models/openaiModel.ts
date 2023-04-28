const BaseModelInterface = require('./interfaces/modelInterface');
const openai = require('../openai');

class OpenAIModel extends BaseModelInterface {
  constructor(apiKey: string, modelEngine: string, imageSize = '512x512') {
    super();
    openai.apiKey = apiKey;
    this.modelEngine = modelEngine;
    this.imageSize = imageSize;
  }

  async chatCompletion(messages: string) {
    const response = await openai.createChatCompletion({
      model: this.modelEngine,
      messages: messages,
    });
    return response;
  }

  async imageGeneration(prompt: string) {
    const response = await openai.Image.create({
      prompt: prompt,
      n: 1,
      size: this.imageSize,
    });
    const imageUrl = response.data[0].url;
    return imageUrl;
  }
}

module.exports = { OpenAIModel };

export {};
