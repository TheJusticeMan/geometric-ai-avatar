import { AvatarParser } from './AvatarParser';
import { AnimationEngine } from './AnimationEngine';
import { StateManager } from './StateManager';
import { PersonalityMapper } from './PersonalityMapper';
import { Mirror } from './Mirror';
import { SchemaValidator } from './SchemaValidator';
import type { CharacterSchema, MoodState } from './types';

// Animation timing constants
const BLINK_TO_PROCESSING_DELAY = 300;
const MEDIUM_MESSAGE_PROCESSING_DURATION = 2000;
const BASE_PROCESSING_DURATION = 2000;
const MAX_PROCESSING_DURATION = 5000;
const DURATION_PER_CHAR = 10;

// Message length thresholds
const SHORT_MESSAGE_THRESHOLD = 20;
const MEDIUM_MESSAGE_THRESHOLD = 100;

class GeometricAvatarApp {
  private parser: AvatarParser | null = null;
  private animationEngine: AnimationEngine;
  private stateManager: StateManager;
  private personalityMapper: PersonalityMapper;
  private mirror: Mirror;
  private validator: SchemaValidator;
  private svgContainer: SVGSVGElement | null = null;
  private originalCharacter: CharacterSchema | null = null;

  constructor() {
    this.animationEngine = new AnimationEngine();
    this.stateManager = new StateManager();
    this.personalityMapper = new PersonalityMapper();
    this.mirror = new Mirror();
    this.validator = new SchemaValidator();
  }

  async initialize(): Promise<void> {
    // Get SVG container
    const svgElement = document.getElementById('avatar-svg');
    if (!svgElement || !(svgElement instanceof SVGSVGElement)) {
      console.error('SVG container not found or invalid');
      return;
    }
    this.svgContainer = svgElement;

    // Initialize parser
    this.parser = new AvatarParser(this.svgContainer);

    // Load default character
    await this.loadDefaultCharacter();

    // Set up event listeners
    this.setupEventListeners();

    // Set up state change listener
    this.stateManager.onStateChange(state => {
      this.updateMirror();
      
      // Update character rendering when state changes
      if (state.activeCharacter && this.parser) {
        this.parser.render(state.activeCharacter);
      }
    });

    // Load and start default animations
    await this.loadDefaultAnimations();

    // Initial mirror update
    this.updateMirror();
  }

  private async loadDefaultCharacter(): Promise<void> {
    try {
      const response = await fetch('/data/characters/default.json');
      const characterData = await response.json();

      // Validate the character schema
      const validation = this.validator.validateCharacterSchema(characterData);
      if (!validation.valid) {
        console.error('Invalid character schema:', validation.errors);
        return;
      }

      // Set the character (this triggers render via state change listener)
      this.stateManager.setCharacter(characterData as CharacterSchema);
      
      // Store original character for mood modifiers
      this.originalCharacter = JSON.parse(JSON.stringify(characterData));
    } catch (error) {
      console.error('Failed to load default character:', error);
    }
  }

  private async loadDefaultAnimations(): Promise<void> {
    try {
      const response = await fetch('/data/animations/idle.json');
      const animationsData = await response.json();

      // Validate and play each animation
      if (Array.isArray(animationsData)) {
        animationsData.forEach(animationSchema => {
          // Validate animation schema
          const validation = this.validator.validateAnimationSchema(animationSchema);
          if (validation.valid) {
            this.animationEngine.playAnimation(animationSchema);
          } else {
            console.error('Invalid animation schema:', validation.errors);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load default animations:', error);
    }
  }

  private setupEventListeners(): void {
    // Mood selector buttons
    const moodButtons = document.querySelectorAll<HTMLButtonElement>('.mood-btn');
    moodButtons.forEach(button => {
      button.addEventListener('click', () => {
        const mood = button.dataset.mood as MoodState;
        this.handleMoodChange(mood);
      });
    });

    // Text input for message received trigger
    const textInput = document.getElementById('message-input') as HTMLInputElement;
    const sendButton = document.getElementById('send-btn') as HTMLButtonElement;

    if (textInput && sendButton) {
      const handleMessage = (): void => {
        const message = textInput.value.trim();
        if (message) {
          this.handleMessage(message);
          textInput.value = '';
        }
      };

      sendButton.addEventListener('click', handleMessage);
      textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleMessage();
        }
      });
    }
  }

  private handleMessage(message: string): void {
    const messageLength = message.length;

    // Quick blink acknowledgment for all messages
    this.animationEngine.triggerAnimation('onMessageReceived');

    // Graduated animation responses based on message length
    if (messageLength < SHORT_MESSAGE_THRESHOLD) {
      // Short messages: Quick blink acknowledgment (already triggered above)
      // No additional animation needed
    } else if (messageLength >= SHORT_MESSAGE_THRESHOLD && messageLength <= MEDIUM_MESSAGE_THRESHOLD) {
      // Medium messages: Blink + brief processing animation
      setTimeout(() => {
        this.animationEngine.triggerAnimation('isProcessing');
      }, BLINK_TO_PROCESSING_DELAY);
      
      // Auto-resolve after brief duration
      setTimeout(() => {
        this.animationEngine.stopAll();
        this.animationEngine.triggerAnimation('onLoad');
      }, MEDIUM_MESSAGE_PROCESSING_DURATION);
    } else {
      // Long messages (> 100 chars): Blink + extended processing animation
      setTimeout(() => {
        this.animationEngine.triggerAnimation('isProcessing');
      }, BLINK_TO_PROCESSING_DELAY);
      
      // Auto-resolve after duration proportional to message length
      const processingDuration = Math.min(
        MAX_PROCESSING_DURATION,
        BASE_PROCESSING_DURATION + (messageLength - MEDIUM_MESSAGE_THRESHOLD) * DURATION_PER_CHAR
      );
      setTimeout(() => {
        this.animationEngine.stopAll();
        this.animationEngine.triggerAnimation('onLoad');
      }, processingDuration);
    }
  }

  private handleMoodChange(mood: MoodState): void {
    this.stateManager.setMood(mood);
    
    // Stop current animations
    this.animationEngine.stopAll();
    
    // Apply geometric modifiers to character
    this.applyMoodModifiers(mood);

    // Trigger mood-specific animations
    this.animationEngine.triggerMoodAnimation(mood);
    
    // Restart idle animations with mood-specific parameters
    this.animationEngine.triggerAnimation('onLoad');

    // Update active mood button styling
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-mood="${mood}"]`)?.classList.add('active');
  }

  private applyMoodModifiers(mood: MoodState): void {
    if (!this.originalCharacter || !this.parser) return;

    // Create a fresh copy from original character
    const character: CharacterSchema = JSON.parse(JSON.stringify(this.originalCharacter));
    const modifiers = this.personalityMapper.getGeometricModifiers(mood);

    // Apply modifiers to character elements
    character.elements.forEach(element => {
      if (element.id.includes('eye') && element.type === 'circle' && modifiers.eyeRadiusMultiplier) {
        element.coordinates.r = element.coordinates.r * modifiers.eyeRadiusMultiplier;
      }
    });

    // Update state with modified character (this triggers render via state change listener)
    this.stateManager.setCharacter(character);
  }

  private updateMirror(): void {
    const mirrorOutput = document.getElementById('mirror-output');
    if (!mirrorOutput || !this.svgContainer) return;

    const description = this.mirror.describeCurrentState(
      this.stateManager.getCharacter(),
      this.stateManager.getMood(),
      this.svgContainer
    );

    mirrorOutput.textContent = description;
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new GeometricAvatarApp();
  app.initialize().catch(error => {
    console.error('Failed to initialize application:', error);
  });
});
