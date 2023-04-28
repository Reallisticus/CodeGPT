class ModelInterface {
  async chatCompletion(messages: string) {
    throw new Error('Not implemented');
  }

  async imageGeneration(prompt: string) {
    throw new Error('Not implemented');
  }
}

module.exports = ModelInterface;
