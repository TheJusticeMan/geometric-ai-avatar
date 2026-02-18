import { describe, it, expect } from 'vitest';
import { PersonalityMapper } from '../src/PersonalityMapper';

describe('PersonalityMapper', () => {
  const mapper = new PersonalityMapper();

  describe('getGeometricModifiers', () => {
    it('should return neutral modifiers for neutral mood', () => {
      const modifiers = mapper.getGeometricModifiers('neutral');
      expect(modifiers.eyeRadiusMultiplier).toBe(1.0);
      expect(modifiers.colorBrightness).toBe(1.0);
    });

    it('should return analytical modifiers with narrow eyes', () => {
      const modifiers = mapper.getGeometricModifiers('analytical');
      expect(modifiers.eyeRadiusMultiplier).toBe(0.7);
      expect(modifiers.colorBrightness).toBe(1.0);
    });

    it('should return energetic modifiers with wide eyes and bright colors', () => {
      const modifiers = mapper.getGeometricModifiers('energetic');
      expect(modifiers.eyeRadiusMultiplier).toBe(1.3);
      expect(modifiers.colorBrightness).toBe(1.2);
    });

    it('should return pensive modifiers with asymmetry', () => {
      const modifiers = mapper.getGeometricModifiers('pensive');
      expect(modifiers.asymmetryFactor).toBe(5);
      expect(modifiers.colorBrightness).toBe(0.9);
    });

    it('should return erroneous modifiers with jitter', () => {
      const modifiers = mapper.getGeometricModifiers('erroneous');
      expect(modifiers.jitterAmount).toBe(3);
      expect(modifiers.colorBrightness).toBe(0.7);
    });
  });

  describe('getAnimationBehavior', () => {
    it('should return appropriate behavior for neutral mood', () => {
      const behavior = mapper.getAnimationBehavior('neutral');
      expect(behavior).toBe('Gentle floating and breathing animations');
    });

    it('should return appropriate behavior for analytical mood', () => {
      const behavior = mapper.getAnimationBehavior('analytical');
      expect(behavior).toBe('Slow, 360-degree rotation of the torso');
    });

    it('should return appropriate behavior for energetic mood', () => {
      const behavior = mapper.getAnimationBehavior('energetic');
      expect(behavior).toBe('High-frequency pulse of secondary shapes');
    });

    it('should return appropriate behavior for pensive mood', () => {
      const behavior = mapper.getAnimationBehavior('pensive');
      expect(behavior).toBe('Slow easeInOutSine tilt of the head circle');
    });

    it('should return appropriate behavior for erroneous mood', () => {
      const behavior = mapper.getAnimationBehavior('erroneous');
      expect(behavior).toBe('Rapid, non-easing position resets');
    });
  });

  describe('getAnimationParams', () => {
    it('should return slow linear animation for analytical mood', () => {
      const params = mapper.getAnimationParams('analytical');
      expect(params.duration).toBe(8000);
      expect(params.easing).toBe('linear');
      expect(params.loop).toBe(true);
      expect(params.direction).toBe('normal');
    });

    it('should return fast animation for energetic mood', () => {
      const params = mapper.getAnimationParams('energetic');
      expect(params.duration).toBe(500);
      expect(params.easing).toBe('easeInOutQuad');
      expect(params.loop).toBe(true);
      expect(params.direction).toBe('alternate');
    });
  });
});
