import type { CharacterSchema, MoodState, SessionData } from './types';

export class PersistenceManager {
  private storageKey: string;
  private moodKey: string;
  private sessionKey: string;

  constructor(storageKey: string = 'geometric-avatar') {
    this.storageKey = `${storageKey}-character`;
    this.moodKey = `${storageKey}-mood`;
    this.sessionKey = `${storageKey}-session`;
  }

  // Save the current character to localStorage
  saveCharacter(character: CharacterSchema): void {
    try {
      const serialized = JSON.stringify(character);
      localStorage.setItem(this.storageKey, serialized);
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  }

  // Load a previously saved character from localStorage (returns null if none)
  loadCharacter(): CharacterSchema | null {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) {
        return null;
      }
      return JSON.parse(serialized) as CharacterSchema;
    } catch (error) {
      console.error('Failed to load character:', error);
      return null;
    }
  }

  // Check if a saved character exists
  hasSavedCharacter(): boolean {
    return localStorage.getItem(this.storageKey) !== null;
  }

  // Clear saved character data
  clearSaved(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.moodKey);
      localStorage.removeItem(this.sessionKey);
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }

  // Save the current mood state
  saveMood(mood: MoodState): void {
    try {
      localStorage.setItem(this.moodKey, mood);
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  }

  // Load saved mood state
  loadMood(): MoodState | null {
    try {
      const mood = localStorage.getItem(this.moodKey);
      if (!mood) {
        return null;
      }
      return mood as MoodState;
    } catch (error) {
      console.error('Failed to load mood:', error);
      return null;
    }
  }

  // Save full session state (character + mood + timestamp)
  saveSession(character: CharacterSchema, mood: MoodState): void {
    try {
      const session: SessionData = {
        character,
        mood,
        timestamp: Date.now()
      };
      const serialized = JSON.stringify(session);
      localStorage.setItem(this.sessionKey, serialized);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  // Load full session
  loadSession(): SessionData | null {
    try {
      const serialized = localStorage.getItem(this.sessionKey);
      if (!serialized) {
        return null;
      }
      return JSON.parse(serialized) as SessionData;
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }
}
