import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { APIKeyManager } from '../../src/llm/APIKeyManager';

describe('APIKeyManager', () => {
  let manager: APIKeyManager;

  beforeEach(() => {
    manager = new APIKeyManager();
    // Clear all keys before each test
    manager.clearAll();
  });

  afterEach(() => {
    // Clean up after each test
    manager.clearAll();
  });

  describe('saveKey and loadKey', () => {
    it('should save and load API key', () => {
      const testKey = 'sk-test-key-123';
      manager.saveKey('openai', testKey);

      const loaded = manager.loadKey('openai');
      expect(loaded).toBe(testKey);
    });

    it('should return null for non-existent key', () => {
      const loaded = manager.loadKey('nonexistent');
      expect(loaded).toBeNull();
    });

    it('should encode keys in base64', () => {
      const testKey = 'sk-test-key-456';
      manager.saveKey('anthropic', testKey);

      // Check that the stored value is base64 encoded
      const stored = localStorage.getItem('gai-avatar-key-anthropic');
      expect(stored).toBe(btoa(testKey));
    });

    it('should overwrite existing key', () => {
      manager.saveKey('google', 'old-key');
      manager.saveKey('google', 'new-key');

      const loaded = manager.loadKey('google');
      expect(loaded).toBe('new-key');
    });
  });

  describe('hasKey', () => {
    it('should return true when key exists', () => {
      manager.saveKey('openai', 'test-key');
      expect(manager.hasKey('openai')).toBe(true);
    });

    it('should return false when key does not exist', () => {
      expect(manager.hasKey('nonexistent')).toBe(false);
    });
  });

  describe('removeKey', () => {
    it('should remove a specific key', () => {
      manager.saveKey('openai', 'key1');
      manager.saveKey('anthropic', 'key2');

      manager.removeKey('openai');

      expect(manager.hasKey('openai')).toBe(false);
      expect(manager.hasKey('anthropic')).toBe(true);
    });

    it('should handle removing non-existent key gracefully', () => {
      expect(() => manager.removeKey('nonexistent')).not.toThrow();
    });
  });

  describe('getStoredProviders', () => {
    it('should return list of providers with saved keys', () => {
      manager.saveKey('openai', 'key1');
      manager.saveKey('anthropic', 'key2');
      manager.saveKey('google', 'key3');

      const providers = manager.getStoredProviders();
      expect(providers).toContain('openai');
      expect(providers).toContain('anthropic');
      expect(providers).toContain('google');
      expect(providers).toHaveLength(3);
    });

    it('should return empty array when no keys are stored', () => {
      const providers = manager.getStoredProviders();
      expect(providers).toEqual([]);
    });
  });

  describe('clearAll', () => {
    it('should remove all saved keys', () => {
      manager.saveKey('openai', 'key1');
      manager.saveKey('anthropic', 'key2');
      manager.saveKey('google', 'key3');

      manager.clearAll();

      expect(manager.getStoredProviders()).toHaveLength(0);
      expect(manager.hasKey('openai')).toBe(false);
      expect(manager.hasKey('anthropic')).toBe(false);
      expect(manager.hasKey('google')).toBe(false);
    });

    it('should not affect other localStorage items', () => {
      localStorage.setItem('other-key', 'other-value');
      manager.saveKey('openai', 'test-key');

      manager.clearAll();

      expect(localStorage.getItem('other-key')).toBe('other-value');
    });
  });

  describe('error handling', () => {
    it('should handle corrupt base64 data', () => {
      // Manually set corrupt data
      localStorage.setItem('gai-avatar-key-corrupt', 'not-valid-base64!!!');

      const loaded = manager.loadKey('corrupt');
      expect(loaded).toBeNull();
      expect(manager.hasKey('corrupt')).toBe(false);
    });
  });
});
