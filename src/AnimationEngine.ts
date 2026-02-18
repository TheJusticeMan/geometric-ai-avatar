import { animate, type AnimationParams } from 'animejs';
import type { AnimationSchema, AnimationTrigger } from './types';

export interface AnimationPreset {
  name: string;
  targetIds: string[];
  animation: AnimationParams;
}

export class AnimationEngine {
  private activeAnimations: ReturnType<typeof animate>[] = [];
  private presets: Map<string, AnimationPreset> = new Map();

  constructor() {
    this.initializePresets();
  }

  private initializePresets(): void {
    // Blink animation - scales eye circles to 0 and back
    this.presets.set('blink', {
      name: 'blink',
      targetIds: ['eye-left', 'eye-right'],
      animation: {
        r: [
          { value: '5', duration: 100 },
          { value: '0', duration: 100 },
          { value: '5', duration: 100 }
        ],
        easing: 'easeInOutQuad',
        loop: true,
        delay: 3000
      }
    });

    // Float animation - gentle vertical oscillation
    this.presets.set('float', {
      name: 'float',
      targetIds: ['#avatar-root'],
      animation: {
        translateY: [-5, 5],
        easing: 'easeInOutSine',
        duration: 2000,
        loop: true,
        direction: 'alternate'
      }
    });

    // Breathe animation - subtle scale pulse
    this.presets.set('breathe', {
      name: 'breathe',
      targetIds: ['torso'],
      animation: {
        scale: [1, 1.05],
        easing: 'easeInOutSine',
        duration: 1500,
        loop: true,
        direction: 'alternate'
      }
    });

    // Ponder animation - slow torso rotation
    this.presets.set('ponder', {
      name: 'ponder',
      targetIds: ['torso'],
      animation: {
        rotate: 360,
        easing: 'linear',
        duration: 8000,
        loop: true
      }
    });
  }

  playPreset(presetName: string): void {
    const preset = this.presets.get(presetName);
    if (!preset) {
      console.error(`Preset "${presetName}" not found`);
      return;
    }

    preset.targetIds.forEach(targetId => {
      const element = document.getElementById(targetId) || document.querySelector(targetId);
      if (element) {
        const animation = animate(element, preset.animation);
        this.activeAnimations.push(animation);
      }
    });
  }

  playAnimation(schema: AnimationSchema): void {
    const target = document.getElementById(schema.targetId);
    if (!target) {
      console.error(`Target element "${schema.targetId}" not found`);
      return;
    }

    const animeParams: AnimationParams = {
      easing: schema.easing,
      loop: schema.loop
    } as AnimationParams;

    // Map property types to anime.js properties
    if (schema.property === 'radius') {
      animeParams.r = schema.timeline.map(kf => ({
        value: kf.value,
        duration: this.parseOffset(kf.offset)
      }));
    } else if (schema.property === 'points') {
      // For polygons, animate the points attribute
      animeParams.points = schema.timeline.map(kf => ({
        value: kf.value,
        duration: this.parseOffset(kf.offset)
      }));
    } else if (schema.property === 'transform') {
      animeParams.rotate = schema.timeline.map(kf => ({
        value: kf.value,
        duration: this.parseOffset(kf.offset)
      }));
    } else if (schema.property === 'color') {
      animeParams.fill = schema.timeline.map(kf => ({
        value: kf.value,
        duration: this.parseOffset(kf.offset)
      }));
    }

    const animation = animate(target, animeParams);
    this.activeAnimations.push(animation);
  }

  triggerAnimation(trigger: AnimationTrigger): void {
    switch (trigger) {
      case 'onLoad':
        this.playPreset('float');
        this.playPreset('breathe');
        break;
      case 'onMessageReceived':
        this.playPreset('blink');
        break;
      case 'isProcessing':
        this.playPreset('ponder');
        break;
      case 'onMoodChange':
        // Handled by PersonalityMapper
        break;
    }
  }

  stopAll(): void {
    this.activeAnimations.forEach(animation => {
      animation.pause();
    });
    this.activeAnimations = [];
  }

  private parseOffset(offset: string): number {
    // Convert percentage offset to milliseconds
    // "0%" -> 0, "100%" -> 1000 (default duration)
    const percentMatch = offset.match(/(\d+)%/);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1], 10);
      return (percent / 100) * 1000;
    }
    return 1000;
  }
}
