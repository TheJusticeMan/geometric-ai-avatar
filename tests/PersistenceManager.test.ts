import { describe, it, expect, beforeEach } from 'vitest';
import { PersistenceManager } from '../src/PersistenceManager';
import type { CharacterSchema, MoodState } from '../src/types';

describe('PersistenceManager', () => {
  let manager: PersistenceManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    manager = new PersistenceManager('test-avatar');
  });

  describe('saveSession and loadSession', () => {
    it('should save and load a complete session', () => {
      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: [
          {
            type: 'circle',
            id: 'head',
            'z-index': 1,
            coordinates: { cx: 200, cy: 200, r: 50 },
            style: { fill: '#FF0000', stroke: '#000000', opacity: 1 }
          }
        ]
      };
      const mood: MoodState = 'energetic';

      manager.saveSession(character, mood);
      const session = manager.loadSession();

      expect(session).not.toBeNull();
      expect(session?.character).toEqual(character);
      expect(session?.mood).toBe(mood);
      expect(session?.timestamp).toBeTypeOf('number');
    });

    it('should return null when no session is saved', () => {
      const session = manager.loadSession();
      expect(session).toBeNull();
    });
  });

  describe('hasSavedCharacter', () => {
    it('should return false when no character is saved', () => {
      expect(manager.hasSavedCharacter()).toBe(false);
    });

    it('should return true after saving a character', () => {
      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: []
      };

      manager.saveCharacter(character);
      expect(manager.hasSavedCharacter()).toBe(true);
    });
  });

  describe('clearSaved', () => {
    it('should clear all saved data', () => {
      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: []
      };
      const mood: MoodState = 'pensive';

      manager.saveSession(character, mood);
      manager.saveCharacter(character);
      manager.saveMood(mood);

      expect(manager.hasSavedCharacter()).toBe(true);

      manager.clearSaved();

      expect(manager.hasSavedCharacter()).toBe(false);
      expect(manager.loadSession()).toBeNull();
      expect(manager.loadMood()).toBeNull();
    });
  });

  describe('saveMood and loadMood', () => {
    it('should save and load mood state', () => {
      const mood: MoodState = 'analytical';

      manager.saveMood(mood);
      const loadedMood = manager.loadMood();

      expect(loadedMood).toBe(mood);
    });

    it('should return null when no mood is saved', () => {
      const mood = manager.loadMood();
      expect(mood).toBeNull();
    });
  });
});
