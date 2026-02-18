import type { AvatarState, CharacterSchema, GeometricElement, MoodState, StateChangeListener } from './types';

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

  setCharacter(character: CharacterSchema): void {
    this.state.activeCharacter = character;
    this.notifyListeners();
  }

  getCharacter(): CharacterSchema | null {
    return this.state.activeCharacter;
  }

  updateElement(elementId: string, element: GeometricElement): void {
    if (!this.state.activeCharacter) {
      console.error('No active character to update');
      return;
    }

    const elementIndex = this.state.activeCharacter.elements.findIndex(
      el => el.id === elementId
    );

    if (elementIndex === -1) {
      console.error(`Element "${elementId}" not found`);
      return;
    }

    this.state.activeCharacter.elements[elementIndex] = element;
    this.notifyListeners();
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
