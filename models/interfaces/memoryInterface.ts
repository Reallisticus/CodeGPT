class MemoryInterface {
  append(userId: string, message: string) {
    throw new Error('Not implemented');
  }

  get(userId: string) {
    throw new Error('Not implemented');
  }

  remove(userId: string) {
    throw new Error('Not implemented');
  }
}

module.exports = MemoryInterface;
