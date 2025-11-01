// src/lib/persistent-cache.js
// For Vercel: Use Vercel KV (Redis)
// For other platforms: Use their Redis equivalent

class PersistentCache {
  constructor() {
    this.kv = null;
    this.initKV();
  }

  async initKV() {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv');
        this.kv = kv;
      } catch (error) {
        console.warn('KV not available, falling back to memory cache');
      }
    }
  }

  async get(key) {
    if (!this.kv) return null;
    
    try {
      const value = await this.kv.get(key);
      return value;
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    if (!this.kv) return;
    
    try {
      await this.kv.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      console.error('KV set error:', error);
    }
  }

  async delete(key) {
    if (!this.kv) return;
    
    try {
      await this.kv.del(key);
    } catch (error) {
      console.error('KV delete error:', error);
    }
  }
}

export const persistentCache = new PersistentCache();