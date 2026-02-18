import { describe, it, expect } from 'vitest';
import { ExpressionEngine } from '../src/ExpressionEngine';
import type { MoodState } from '../src/types';

describe('ExpressionEngine', () => {
  describe('Expression Presets', () => {
    it('should have at least 10 default expression presets', () => {
      const engine = new ExpressionEngine();
      const names = engine.getAllExpressionNames();
      
      expect(names.length).toBeGreaterThanOrEqual(10);
    });

    it('should include standard expression presets', () => {
      const engine = new ExpressionEngine();
      const names = engine.getAllExpressionNames();
      
      expect(names).toContain('neutral');
      expect(names).toContain('happy');
      expect(names).toContain('sad');
      expect(names).toContain('angry');
      expect(names).toContain('surprised');
      expect(names).toContain('thinking');
      expect(names).toContain('embarrassed');
      expect(names).toContain('determined');
      expect(names).toContain('sleepy');
      expect(names).toContain('excited');
    });

    it('should return valid expression config for existing preset', () => {
      const engine = new ExpressionEngine();
      const config = engine.getExpression('happy');
      
      expect(config).not.toBeNull();
      expect(config?.eyes).toBeDefined();
      expect(config?.mouth).toBeDefined();
      expect(config?.effects).toBeDefined();
    });

    it('should return null for non-existent expression', () => {
      const engine = new ExpressionEngine();
      const config = engine.getExpression('non-existent');
      
      expect(config).toBeNull();
    });
  });

  describe('Expression Structure', () => {
    it('should have valid eye configuration', () => {
      const engine = new ExpressionEngine();
      const config = engine.getExpression('neutral');
      
      expect(config?.eyes.leftEye).toBeDefined();
      expect(config?.eyes.rightEye).toBeDefined();
      expect(config?.eyes.eyebrows).toBeDefined();
      
      expect(typeof config?.eyes.leftEye.openness).toBe('number');
      expect(typeof config?.eyes.leftEye.irisSize).toBe('number');
      expect(typeof config?.eyes.leftEye.irisOffsetX).toBe('number');
      expect(typeof config?.eyes.leftEye.irisOffsetY).toBe('number');
    });

    it('should have valid mouth configuration', () => {
      const engine = new ExpressionEngine();
      const config = engine.getExpression('happy');
      
      expect(config?.mouth).toBeDefined();
      expect(typeof config?.mouth.shape).toBe('string');
      expect(typeof config?.mouth.openness).toBe('number');
      expect(typeof config?.mouth.width).toBe('number');
    });

    it('should have valid effects configuration', () => {
      const engine = new ExpressionEngine();
      const config = engine.getExpression('embarrassed');
      
      expect(config?.effects).toBeDefined();
      expect(typeof config?.effects.blush).toBe('number');
      expect(typeof config?.effects.sweatDrop).toBe('boolean');
      expect(typeof config?.effects.sparkles).toBe('boolean');
      expect(typeof config?.effects.angryVein).toBe('boolean');
    });
  });

  describe('Custom Expression Registration', () => {
    it('should register custom expression', () => {
      const engine = new ExpressionEngine();
      const customConfig = {
        eyes: {
          leftEye: { openness: 0.5, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 },
          rightEye: { openness: 0.5, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 },
          eyebrows: { leftAngle: 0, rightAngle: 0, leftHeight: 0, rightHeight: 0 }
        },
        mouth: { shape: 'neutral' as const, openness: 0, width: 1 },
        effects: { blush: 0, sweatDrop: false, sparkles: false, angryVein: false }
      };
      
      engine.registerExpression('custom', customConfig);
      const retrieved = engine.getExpression('custom');
      
      expect(retrieved).toEqual(customConfig);
    });

    it('should allow overriding existing expressions', () => {
      const engine = new ExpressionEngine();
      const originalHappy = engine.getExpression('happy');
      
      const newHappy = {
        eyes: {
          leftEye: { openness: 1, irisSize: 1, irisOffsetX: 0, irisOffsetY: 0 },
          rightEye: { openness: 1, irisSize: 1, irisOffsetX: 0, irisOffsetY: 0 },
          eyebrows: { leftAngle: 0, rightAngle: 0, leftHeight: 0, rightHeight: 0 }
        },
        mouth: { shape: 'smile' as const, openness: 1, width: 1 },
        effects: { blush: 0, sweatDrop: false, sparkles: false, angryVein: false }
      };
      
      engine.registerExpression('happy', newHappy);
      const retrieved = engine.getExpression('happy');
      
      expect(retrieved).not.toEqual(originalHappy);
      expect(retrieved).toEqual(newHappy);
    });
  });

  describe('Expression Blending', () => {
    it('should blend between two expressions at t=0', () => {
      const engine = new ExpressionEngine();
      const neutral = engine.getExpression('neutral')!;
      const happy = engine.getExpression('happy')!;
      
      const blended = engine.blendExpressions(neutral, happy, 0);
      
      expect(blended.eyes.leftEye.openness).toBeCloseTo(neutral.eyes.leftEye.openness);
      expect(blended.mouth.openness).toBeCloseTo(neutral.mouth.openness);
    });

    it('should blend between two expressions at t=1', () => {
      const engine = new ExpressionEngine();
      const neutral = engine.getExpression('neutral')!;
      const happy = engine.getExpression('happy')!;
      
      const blended = engine.blendExpressions(neutral, happy, 1);
      
      expect(blended.eyes.leftEye.openness).toBeCloseTo(happy.eyes.leftEye.openness);
      expect(blended.mouth.openness).toBeCloseTo(happy.mouth.openness);
    });

    it('should blend between two expressions at t=0.5', () => {
      const engine = new ExpressionEngine();
      const neutral = engine.getExpression('neutral')!;
      const happy = engine.getExpression('happy')!;
      
      const blended = engine.blendExpressions(neutral, happy, 0.5);
      
      const expectedOpenness = (neutral.eyes.leftEye.openness + happy.eyes.leftEye.openness) / 2;
      expect(blended.eyes.leftEye.openness).toBeCloseTo(expectedOpenness);
    });

    it('should interpolate numeric values smoothly', () => {
      const engine = new ExpressionEngine();
      const neutral = engine.getExpression('neutral')!;
      const happy = engine.getExpression('happy')!;
      
      const blended25 = engine.blendExpressions(neutral, happy, 0.25);
      const blended75 = engine.blendExpressions(neutral, happy, 0.75);
      
      expect(blended25.eyes.leftEye.openness).toBeGreaterThanOrEqual(Math.min(neutral.eyes.leftEye.openness, happy.eyes.leftEye.openness));
      expect(blended25.eyes.leftEye.openness).toBeLessThanOrEqual(Math.max(neutral.eyes.leftEye.openness, happy.eyes.leftEye.openness));
      
      expect(blended75.eyes.leftEye.openness).toBeGreaterThanOrEqual(Math.min(neutral.eyes.leftEye.openness, happy.eyes.leftEye.openness));
      expect(blended75.eyes.leftEye.openness).toBeLessThanOrEqual(Math.max(neutral.eyes.leftEye.openness, happy.eyes.leftEye.openness));
    });
  });

  describe('Mood to Expression Mapping', () => {
    it('should map neutral mood to neutral expression', () => {
      const engine = new ExpressionEngine();
      const expression = engine.moodToExpression('neutral' as MoodState);
      
      expect(expression).toBe('neutral');
    });

    it('should map analytical mood to thinking expression', () => {
      const engine = new ExpressionEngine();
      const expression = engine.moodToExpression('analytical' as MoodState);
      
      expect(expression).toBe('thinking');
    });

    it('should map energetic mood to excited expression', () => {
      const engine = new ExpressionEngine();
      const expression = engine.moodToExpression('energetic' as MoodState);
      
      expect(expression).toBe('excited');
    });

    it('should map pensive mood to thinking expression', () => {
      const engine = new ExpressionEngine();
      const expression = engine.moodToExpression('pensive' as MoodState);
      
      expect(expression).toBe('thinking');
    });

    it('should map erroneous mood to embarrassed expression', () => {
      const engine = new ExpressionEngine();
      const expression = engine.moodToExpression('erroneous' as MoodState);
      
      expect(expression).toBe('embarrassed');
    });
  });

  describe('Expression Effects', () => {
    it('should have blush effect in embarrassed expression', () => {
      const engine = new ExpressionEngine();
      const config = engine.getExpression('embarrassed');
      
      expect(config?.effects.blush).toBeGreaterThan(0);
    });

    it('should have sweat drop in sad or embarrassed expressions', () => {
      const engine = new ExpressionEngine();
      const sad = engine.getExpression('sad');
      const embarrassed = engine.getExpression('embarrassed');
      
      expect(sad?.effects.sweatDrop || embarrassed?.effects.sweatDrop).toBe(true);
    });

    it('should have sparkles in happy or excited expressions', () => {
      const engine = new ExpressionEngine();
      const happy = engine.getExpression('happy');
      const excited = engine.getExpression('excited');
      
      expect(happy?.effects.sparkles || excited?.effects.sparkles).toBe(true);
    });

    it('should have angry vein in angry expression', () => {
      const engine = new ExpressionEngine();
      const config = engine.getExpression('angry');
      
      expect(config?.effects.angryVein).toBe(true);
    });
  });
});
