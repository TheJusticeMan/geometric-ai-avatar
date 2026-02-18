import { describe, it, expect } from 'vitest';
import { SchemaValidator } from '../src/SchemaValidator';
import type { CharacterSchema, AnimationSchema } from '../src/types';

describe('SchemaValidator', () => {
  const validator = new SchemaValidator();

  describe('validateCharacterSchema', () => {
    it('should validate a valid character schema', () => {
      const validCharacter: CharacterSchema = {
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

      const result = validator.validateCharacterSchema(validCharacter);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject character schema with missing required fields', () => {
      const invalidCharacter = {
        id: 'test-avatar',
        // missing version and elements
      };

      const result = validator.validateCharacterSchema(invalidCharacter);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject character schema with wrong type for element', () => {
      const invalidCharacter = {
        id: 'test-avatar',
        version: '1.0',
        elements: [
          {
            type: 'invalid-type', // wrong type
            id: 'head',
            'z-index': 1,
            coordinates: { cx: 200, cy: 200, r: 50 },
            style: { fill: '#FF0000', stroke: '#000000', opacity: 1 }
          }
        ]
      };

      const result = validator.validateCharacterSchema(invalidCharacter);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject character with invalid opacity range', () => {
      const invalidCharacter = {
        id: 'test-avatar',
        version: '1.0',
        elements: [
          {
            type: 'circle',
            id: 'head',
            'z-index': 1,
            coordinates: { cx: 200, cy: 200, r: 50 },
            style: { fill: '#FF0000', stroke: '#000000', opacity: 1.5 } // invalid opacity
          }
        ]
      };

      const result = validator.validateCharacterSchema(invalidCharacter);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate polygon element with points array', () => {
      const validPolygonCharacter: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: [
          {
            type: 'polygon',
            id: 'torso',
            'z-index': 1,
            coordinates: { points: [[100, 100], [200, 100], [200, 200], [100, 200]] },
            style: { fill: '#00FF00', stroke: '#000000', opacity: 0.8 }
          }
        ]
      };

      const result = validator.validateCharacterSchema(validPolygonCharacter);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateAnimationSchema', () => {
    it('should validate a valid animation schema', () => {
      const validAnimation: AnimationSchema = {
        targetId: 'head',
        property: 'radius',
        timeline: [
          { offset: '0%', value: 50 },
          { offset: '100%', value: 60 }
        ],
        easing: 'easeInOut',
        loop: true
      };

      const result = validator.validateAnimationSchema(validAnimation);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject animation schema with missing required fields', () => {
      const invalidAnimation = {
        targetId: 'head',
        property: 'radius'
        // missing timeline, easing, and loop
      };

      const result = validator.validateAnimationSchema(invalidAnimation);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject animation schema with invalid property', () => {
      const invalidAnimation = {
        targetId: 'head',
        property: 'invalid-property', // wrong property
        timeline: [
          { offset: '0%', value: 50 }
        ],
        easing: 'linear',
        loop: true
      };

      const result = validator.validateAnimationSchema(invalidAnimation);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
