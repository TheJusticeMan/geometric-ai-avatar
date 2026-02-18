import type { AnyCharacterSchema, AvatarState, GeometricElement, AnimeElement, MoodState, StateChangeListener } from './types';
import { isAnimeCharacter } from './types';

export class StateManager {
  private state: AvatarState;
  private listeners: StateChangeListener[] = [];

  constructor() {
    this.state = {
      activeCharacter: null,
      currentMood: 'neutral'
    };
  }

  getState(): AvatarState {
    return { ...this.state };
  }

  setCharacter(character: AnyCharacterSchema): void {
    this.state.activeCharacter = character;
    this.notifyListeners();
  }

  getCharacter(): AnyCharacterSchema | null {
    return this.state.activeCharacter;
  }

  updateElement(elementId: string, element: GeometricElement | AnimeElement): void {
    if (!this.state.activeCharacter) {
      console.error('No active character to update');
      return;
    }

    // Handle v1.0 geometric characters
    if (!isAnimeCharacter(this.state.activeCharacter)) {
      const elementIndex = this.state.activeCharacter.elements.findIndex(
        el => el.id === elementId
      );

      if (elementIndex === -1) {
        console.error(`Element "${elementId}" not found`);
        return;
      }

      this.state.activeCharacter.elements[elementIndex] = element as GeometricElement;
      this.notifyListeners();
      return;
    }

    // Handle v2.0 anime characters - update would be more complex
    // For now, we just log a message
    console.warn('Element updates for anime characters not yet implemented');
  }

  setMood(mood: MoodState): void {
    if (this.state.currentMood === mood) {
      return;
    }

    this.state.currentMood = mood;
    this.notifyListeners();
  }

  getMood(): MoodState {
    return this.state.currentMood;
  }

  onStateChange(listener: StateChangeListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.getState());
    });
  }
}
