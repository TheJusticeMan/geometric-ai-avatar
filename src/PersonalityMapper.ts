import type { MoodState, GeometricModifiers, AnimationParams } from './types';

export class PersonalityMapper {
  getGeometricModifiers(mood: MoodState): GeometricModifiers {
    switch (mood) {
      case 'analytical':
        return {
          eyeRadiusMultiplier: 0.7, // Narrow eyes
          colorBrightness: 1.0
        };
      
      case 'energetic':
        return {
          eyeRadiusMultiplier: 1.3, // Wide eyes
          colorBrightness: 1.2 // Brighter colors
        };
      
      case 'pensive':
        return {
          asymmetryFactor: 5, // Slight asymmetry in points
          colorBrightness: 0.9
        };
      
      case 'erroneous':
        return {
          jitterAmount: 3, // Coordinate jitter
          colorBrightness: 0.7 // Desaturated colors
        };
      
      case 'neutral':
      default:
        return {
          eyeRadiusMultiplier: 1.0,
          colorBrightness: 1.0
        };
    }
  }

  getAnimationParams(mood: MoodState): AnimationParams {
    switch (mood) {
      case 'analytical':
        return {
          duration: 8000,
          easing: 'linear',
          loop: true,
          direction: 'normal'
        };
      
      case 'energetic':
        return {
          duration: 500,
          easing: 'easeInOutQuad',
          loop: true,
          direction: 'alternate'
        };
      
      case 'pensive':
        return {
          duration: 3000,
          easing: 'easeInOutSine',
          loop: true,
          direction: 'alternate'
        };
      
      case 'erroneous':
        return {
          duration: 200,
          easing: 'linear',
          loop: true,
          direction: 'normal'
        };
      
      case 'neutral':
      default:
        return {
          duration: 2000,
          easing: 'easeInOutSine',
          loop: true,
          direction: 'alternate'
        };
    }
  }

  getAnimationBehavior(mood: MoodState): string {
    switch (mood) {
      case 'analytical':
        return 'Slow, 360-degree rotation of the torso';
      case 'energetic':
        return 'High-frequency pulse of secondary shapes';
      case 'pensive':
        return 'Slow easeInOutSine tilt of the head circle';
      case 'erroneous':
        return 'Rapid, non-easing position resets';
      case 'neutral':
      default:
        return 'Gentle floating and breathing animations';
    }
  }
}
