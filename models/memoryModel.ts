const MemoryInterface = require('./interfaces/memoryInterface');

class DefaultDict<K, V> {
  private defaultInit: () => V;
  private dict: Map<K, V>;

  constructor(defaultInit: () => V) {
    this.defaultInit = defaultInit;
    this.dict = new Map<K, V>();
  }

  getItem(key: K): V {
    if (!this.dict.has(key)) {
      this.dict.set(key, this.defaultInit());
    }
    return this.dict.get(key) as V;
  }

  setItem(key: K, value: V): void {
    this.dict.set(key, value);
  }

  removeItem(key: K): void {
    this.dict.delete(key);
  }
}

class Memory extends MemoryInterface {
  private storage: DefaultDict<string, any[]>;
  private systemMessage: string;

  constructor(systemMessage: string) {
    super();
    this.storage = new DefaultDict<string, any[]>(() => []);
    this.systemMessage = systemMessage;
  }

  initialize(userId: string): void {
    this.storage.setItem(userId, [
      {
        role: 'system',
        content: this.systemMessage,
      },
    ]);
  }

  append(userId: string, message: any): void {
    const userData = this.storage.getItem(userId);
    userData.push(message);
  }

  get(userId: string): any[] {
    return this.storage.getItem(userId);
  }

  remove(userId: string): void {
    this.storage.removeItem(userId);
  }
}

module.exports = { Memory };

export {};
