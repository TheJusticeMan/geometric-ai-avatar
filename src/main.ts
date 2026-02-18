import { AvatarParser } from './AvatarParser';
import { AnimationEngine } from './AnimationEngine';
import { StateManager } from './StateManager';
import { PersonalityMapper } from './PersonalityMapper';
import { Mirror } from './Mirror';
import { SchemaValidator } from './SchemaValidator';
import { PersistenceManager } from './PersistenceManager';
import { LLMBridge } from './LLMBridge';
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
  private persistence: PersistenceManager;
  private llmBridge: LLMBridge;
  private svgContainer: SVGSVGElement | null = null;
  private originalCharacter: CharacterSchema | null = null;

  constructor() {
    this.animationEngine = new AnimationEngine();
    this.stateManager = new StateManager();
    this.personalityMapper = new PersonalityMapper();
    this.mirror = new Mirror();
    this.validator = new SchemaValidator();
    this.persistence = new PersistenceManager();
    this.llmBridge = new LLMBridge();
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

    // Try to load saved session first, otherwise load default
    const savedSession = this.persistence.loadSession();
    if (savedSession) {
      await this.loadSavedSession(savedSession);
    } else {
      await this.loadDefaultCharacter();
    }

    // Set up event listeners
    this.setupEventListeners();

    // Set up state change listener
    this.stateManager.onStateChange(state => {
      this.updateMirror();
      this.updateJSONEditor();
      
      // Auto-save session on state changes
      this.persistence.saveSession(
        state.activeCharacter || this.originalCharacter!,
        state.currentMood
      );
      
      // Update character rendering when state changes
      if (state.activeCharacter && this.parser) {
        this.parser.render(state.activeCharacter);
      }
    });

    // Load and start default animations
    await this.loadDefaultAnimations();

    // Initial UI updates
    this.updateMirror();
    this.updateJSONEditor();
    this.updateSessionIndicator();
  }

  private async loadSavedSession(session: { character: CharacterSchema; mood: MoodState; timestamp: number }): Promise<void> {
    // Validate the saved character
    const validation = this.validator.validateCharacterSchema(session.character);
    if (!validation.valid) {
      console.error('Invalid saved character, loading default:', validation.errors);
      await this.loadDefaultCharacter();
      return;
    }

    // Set the character and mood
    this.stateManager.setCharacter(session.character);
    this.stateManager.setMood(session.mood);
    
    // Store as original character for mood modifiers
    this.originalCharacter = JSON.parse(JSON.stringify(session.character));

    // Update mood button styling
    document.querySelectorAll('.mood-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-mood="${session.mood}"]`)?.classList.add('active');

    this.updateSessionIndicator(true);
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

    // JSON Editor controls
    const applyJsonBtn = document.getElementById('apply-json-btn');
    const resetJsonBtn = document.getElementById('reset-json-btn');
    
    if (applyJsonBtn) {
      applyJsonBtn.addEventListener('click', () => this.handleApplyJSON());
    }
    
    if (resetJsonBtn) {
      resetJsonBtn.addEventListener('click', () => this.handleResetToDefault());
    }

    // LLM Integration controls
    const copyPromptBtn = document.getElementById('copy-prompt-btn');
    const applyLlmBtn = document.getElementById('apply-llm-btn');
    
    if (copyPromptBtn) {
      copyPromptBtn.addEventListener('click', () => this.handleCopyPrompt());
    }
    
    if (applyLlmBtn) {
      applyLlmBtn.addEventListener('click', () => this.handleApplyLLMResponse());
    }

    // Character Management controls
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importInput = document.getElementById('import-input') as HTMLInputElement;
    const saveSessionBtn = document.getElementById('save-session-btn');
    const clearSavedBtn = document.getElementById('clear-saved-btn');
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }
    
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', (e) => this.handleImport(e));
    }
    
    if (saveSessionBtn) {
      saveSessionBtn.addEventListener('click', () => this.handleSaveSession());
    }
    
    if (clearSavedBtn) {
      clearSavedBtn.addEventListener('click', () => this.handleClearSaved());
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
    } else if (messageLength <= MEDIUM_MESSAGE_THRESHOLD) {
      // Medium messages: Blink + brief processing animation
      setTimeout(() => {
        this.animationEngine.triggerAnimation('isProcessing');
      }, BLINK_TO_PROCESSING_DELAY);
      
      // Auto-resolve after brief duration
      setTimeout(() => {
        this.resetToIdleAnimations();
      }, MEDIUM_MESSAGE_PROCESSING_DURATION);
    } else {
      // Long messages (> 100 chars): Blink + extended processing animation
      setTimeout(() => {
        this.animationEngine.triggerAnimation('isProcessing');
      }, BLINK_TO_PROCESSING_DELAY);
      
      // Auto-resolve after duration proportional to message length
      // Formula: base 2s + 10ms per char beyond 100 chars, capped at 5s
      const processingDuration = Math.min(
        MAX_PROCESSING_DURATION,
        BASE_PROCESSING_DURATION + (messageLength - MEDIUM_MESSAGE_THRESHOLD) * DURATION_PER_CHAR
      );
      setTimeout(() => {
        this.resetToIdleAnimations();
      }, processingDuration);
    }
  }

  private resetToIdleAnimations(): void {
    this.animationEngine.stopAll();
    // onLoad trigger starts the default idle animations (float and breathe)
    // Note: blink animations are loaded separately from idle.json
    this.animationEngine.triggerAnimation('onLoad');
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

  private updateJSONEditor(): void {
    const jsonEditor = document.getElementById('json-editor') as HTMLTextAreaElement;
    if (!jsonEditor) return;

    const character = this.stateManager.getCharacter();
    if (character) {
      jsonEditor.value = JSON.stringify(character, null, 2);
    }
  }

  private updateSessionIndicator(isSaved: boolean = false): void {
    const indicator = document.getElementById('session-indicator');
    if (!indicator) return;

    if (isSaved || this.persistence.loadSession()) {
      indicator.textContent = '✓ Saved Session Loaded';
      indicator.classList.remove('default');
    } else {
      indicator.textContent = 'Using Default Character';
      indicator.classList.add('default');
    }
  }

  private showError(containerId: string, message: string): void {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.textContent = message;
    container.classList.add('show');
    
    setTimeout(() => {
      container.classList.remove('show');
    }, 5000);
  }

  private showSuccess(containerId: string, message: string): void {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.textContent = message;
    container.classList.add('show');
    
    setTimeout(() => {
      container.classList.remove('show');
    }, 3000);
  }

  private handleApplyJSON(): void {
    const jsonEditor = document.getElementById('json-editor') as HTMLTextAreaElement;
    if (!jsonEditor) return;

    try {
      const jsonText = jsonEditor.value.trim();
      const parsed = JSON.parse(jsonText);
      
      // Validate the schema
      const validation = this.validator.validateCharacterSchema(parsed);
      if (!validation.valid) {
        this.showError('json-error', 'Validation errors:\n' + validation.errors.join('\n'));
        return;
      }

      // Apply the character
      const character = parsed as CharacterSchema;
      this.stateManager.setCharacter(character);
      this.originalCharacter = JSON.parse(JSON.stringify(character));
      
      // Re-apply mood modifiers
      this.applyMoodModifiers(this.stateManager.getMood());
      
      this.showSuccess('json-success', 'Character JSON applied successfully!');
    } catch (error) {
      this.showError('json-error', `Parse error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async handleResetToDefault(): Promise<void> {
    try {
      const response = await fetch('/data/characters/default.json');
      const characterData = await response.json();
      
      const validation = this.validator.validateCharacterSchema(characterData);
      if (!validation.valid) {
        this.showError('json-error', 'Default character is invalid');
        return;
      }

      this.stateManager.setCharacter(characterData as CharacterSchema);
      this.originalCharacter = JSON.parse(JSON.stringify(characterData));
      
      // Reset mood to neutral
      this.stateManager.setMood('neutral');
      document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelector('[data-mood="neutral"]')?.classList.add('active');
      
      this.showSuccess('json-success', 'Reset to default character!');
    } catch (error) {
      this.showError('json-error', `Failed to reset: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private handleCopyPrompt(): void {
    const character = this.stateManager.getCharacter();
    if (!character || !this.svgContainer) return;

    const llmContext = this.mirror.generateLLMContext(
      character,
      this.stateManager.getMood(),
      this.svgContainer
    );

    const systemPrompt = this.llmBridge.generateSystemPrompt(llmContext, character);
    const fullPrompt = `${systemPrompt}\n\n---\n\nPlease modify this avatar as requested by the user.`;

    navigator.clipboard.writeText(fullPrompt)
      .then(() => {
        this.showSuccess('llm-success', 'LLM prompt copied to clipboard!');
      })
      .catch(error => {
        this.showError('llm-error', `Failed to copy: ${error instanceof Error ? error.message : String(error)}`);
      });
  }

  private handleApplyLLMResponse(): void {
    const responseTextarea = document.getElementById('llm-response') as HTMLTextAreaElement;
    if (!responseTextarea) return;

    const response = responseTextarea.value.trim();
    if (!response) {
      this.showError('llm-error', 'Please paste an LLM response first');
      return;
    }

    const result = this.llmBridge.parseResponse(response);
    
    if (!result.character) {
      this.showError('llm-error', result.message);
      return;
    }

    // Apply the character
    this.stateManager.setCharacter(result.character);
    this.originalCharacter = JSON.parse(JSON.stringify(result.character));
    
    // Re-apply mood modifiers
    this.applyMoodModifiers(this.stateManager.getMood());
    
    this.showSuccess('llm-success', result.message);
    responseTextarea.value = '';
  }

  private handleExport(): void {
    const character = this.stateManager.getCharacter();
    if (!character) {
      this.showError('management-error', 'No character to export');
      return;
    }

    try {
      const jsonString = JSON.stringify(character, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${character.id}-${timestamp}.json`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showSuccess('management-success', `Exported as ${filename}`);
    } catch (error) {
      this.showError('management-error', `Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private handleImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e): void => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        const validation = this.validator.validateCharacterSchema(parsed);
        if (!validation.valid) {
          this.showError('management-error', 'Invalid character file:\n' + validation.errors.join('\n'));
          return;
        }

        const character = parsed as CharacterSchema;
        this.stateManager.setCharacter(character);
        this.originalCharacter = JSON.parse(JSON.stringify(character));
        
        // Re-apply mood modifiers
        this.applyMoodModifiers(this.stateManager.getMood());
        
        this.showSuccess('management-success', `Imported ${file.name} successfully!`);
      } catch (error) {
        this.showError('management-error', `Import failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Reset the input
      input.value = '';
    };
    
    reader.readAsText(file);
  }

  private handleSaveSession(): void {
    const character = this.stateManager.getCharacter();
    if (!character) {
      this.showError('management-error', 'No character to save');
      return;
    }

    this.persistence.saveSession(character, this.stateManager.getMood());
    this.updateSessionIndicator(true);
    this.showSuccess('management-success', 'Session saved to browser storage!');
  }

  private handleClearSaved(): void {
    this.persistence.clearSaved();
    this.updateSessionIndicator(false);
    this.showSuccess('management-success', 'Saved session cleared!');
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new GeometricAvatarApp();
  app.initialize().catch(error => {
    console.error('Failed to initialize application:', error);
  });
});
