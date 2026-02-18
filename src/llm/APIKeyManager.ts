// API Key Manager for secure local storage
// Uses base64 encoding for basic obfuscation (not true encryption)

export class APIKeyManager {
  private storagePrefix = 'gai-avatar-key-';

  /**
   * Save API key to localStorage with base64 encoding
   */
  saveKey(provider: string, key: string): void {
    const encoded = btoa(key);
    localStorage.setItem(this.storagePrefix + provider, encoded);
  }

  /**
   * Load API key from localStorage and decode
   */
  loadKey(provider: string): string | null {
    const encoded = localStorage.getItem(this.storagePrefix + provider);
    if (!encoded) return null;

    try {
      return atob(encoded);
    } catch {
      // If decoding fails, remove corrupt key
      this.removeKey(provider);
      return null;
    }
  }

  /**
   * Check if a key exists for a provider
   */
  hasKey(provider: string): boolean {
    return localStorage.getItem(this.storagePrefix + provider) !== null;
  }

  /**
   * Remove a key for a specific provider
   */
  removeKey(provider: string): void {
    localStorage.removeItem(this.storagePrefix + provider);
  }

  /**
   * List all providers with saved keys
   */
  getStoredProviders(): string[] {
    const providers: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        providers.push(key.substring(this.storagePrefix.length));
      }
    }
    return providers;
  }

  /**
   * Clear all saved API keys
   */
  clearAll(): void {
    const providers = this.getStoredProviders();
    providers.forEach(provider => this.removeKey(provider));
  }
}
