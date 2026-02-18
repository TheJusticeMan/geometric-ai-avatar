import { describe, it, expect } from 'vitest';
import { SchemaValidator } from '../src/SchemaValidator';
import { AnimeCharacterBuilder } from '../src/AnimeCharacterBuilder';
import type { AnimeCharacterSchema } from '../src/types';

describe('AnimeSchemaValidator', () => {
  const validator = new SchemaValidator();

  describe('Valid Anime Character Schemas', () => {
    it('should validate a valid anime character schema built by AnimeCharacterBuilder', () => {
      const builder = new AnimeCharacterBuilder('standard');
      const schema = builder.build();
      
      const result = validator.validateAnimeCharacterSchema(schema);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate chibi style anime character', () => {
      const builder = new AnimeCharacterBuilder('chibi');
      const schema = builder.build();
      
      const result = validator.validateAnimeCharacterSchema(schema);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate minimal anime character schema', () => {
      const minimalSchema: AnimeCharacterSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral',
          presets: {}
        }
      };
      
      const result = validator.validateAnimeCharacterSchema(minimalSchema);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate anime character with optional gradients', () => {
      const builder = new AnimeCharacterBuilder('standard');
      const schema = builder.build();
      
      const result = validator.validateAnimeCharacterSchema(schema);
      
      expect(result.valid).toBe(true);
      expect(schema.gradients).toBeDefined();
    });

    it('should validate anime character with optional filters', () => {
      const builder = new AnimeCharacterBuilder('standard');
      const schema = builder.build();
      
      const result = validator.validateAnimeCharacterSchema(schema);
      
      expect(result.valid).toBe(true);
      expect(schema.filters).toBeDefined();
    });
  });

  describe('Invalid Anime Character Schemas', () => {
    it('should reject schema with missing required fields', () => {
      const invalidSchema = {
        id: 'test-anime',
        version: '2.0'
        // missing style, layers, expressions
      };
      
      const result = validator.validateAnimeCharacterSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject schema with wrong version', () => {
      const invalidSchema = {
        id: 'test-anime',
        version: '1.0', // wrong version for anime character
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral',
          presets: {}
        }
      };
      
      const result = validator.validateAnimeCharacterSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
    });

    it('should reject schema with invalid style', () => {
      const invalidSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'invalid-style', // not a valid AnimeStyle
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral',
          presets: {}
        }
      };
      
      const result = validator.validateAnimeCharacterSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
    });

    it('should reject schema with missing layer properties', () => {
      const invalidSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: []
          // missing hair, clothing, effects
        },
        expressions: {
          current: 'neutral',
          presets: {}
        }
      };
      
      const result = validator.validateAnimeCharacterSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
    });

    it('should reject schema with incomplete hair layer', () => {
      const invalidSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [] }, // missing back
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral',
          presets: {}
        }
      };
      
      const result = validator.validateAnimeCharacterSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
    });

    it('should reject schema with missing expressions', () => {
      const invalidSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        }
        // missing expressions
      };
      
      const result = validator.validateAnimeCharacterSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
    });

    it('should reject schema with incomplete expressions', () => {
      const invalidSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral'
          // missing presets
        }
      };
      
      const result = validator.validateAnimeCharacterSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
    });
  });

  describe('Type Guard', () => {
    it('should return true for valid anime character schema', () => {
      const builder = new AnimeCharacterBuilder('standard');
      const schema = builder.build();
      
      const isValid = validator.isValidAnimeCharacter(schema);
      
      expect(isValid).toBe(true);
    });

    it('should return false for invalid anime character schema', () => {
      const invalidSchema = {
        id: 'test',
        version: '2.0'
      };
      
      const isValid = validator.isValidAnimeCharacter(invalidSchema);
      
      expect(isValid).toBe(false);
    });

    it('should return false for v1.0 character schema', () => {
      const v1Schema = {
        id: 'test-avatar',
        version: '1.0',
        elements: []
      };
      
      const isValid = validator.isValidAnimeCharacter(v1Schema);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Backward Compatibility', () => {
    it('should still validate v1.0 character schemas', () => {
      const v1Schema = {
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
      
      const result = validator.validateCharacterSchema(v1Schema);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should distinguish between v1.0 and v2.0 schemas with validateAnyCharacter', () => {
      const v1Schema = {
        id: 'test-avatar',
        version: '1.0',
        elements: []
      };
      
      const builder = new AnimeCharacterBuilder();
      const v2Schema = builder.build();
      
      const v1Result = validator.validateAnyCharacter(v1Schema);
      const v2Result = validator.validateAnyCharacter(v2Schema);
      
      expect(v1Result.version).toBe('1.0');
      expect(v2Result.version).toBe('2.0');
    });
  });

  describe('Gradient Validation', () => {
    it('should validate gradient with required fields', () => {
      const schema: AnimeCharacterSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral',
          presets: {}
        },
        gradients: [
          {
            id: 'test-gradient',
            type: 'linear',
            stops: [
              { offset: '0%', color: '#FF0000' },
              { offset: '100%', color: '#0000FF' }
            ]
          }
        ]
      };
      
      const result = validator.validateAnimeCharacterSchema(schema);
      
      expect(result.valid).toBe(true);
    });

    it('should validate radial gradient', () => {
      const schema: AnimeCharacterSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral',
          presets: {}
        },
        gradients: [
          {
            id: 'test-gradient',
            type: 'radial',
            stops: [
              { offset: '0%', color: '#FF0000' }
            ],
            cx: '50%',
            cy: '50%',
            r: '50%'
          }
        ]
      };
      
      const result = validator.validateAnimeCharacterSchema(schema);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('Filter Validation', () => {
    it('should validate blur filter', () => {
      const schema: AnimeCharacterSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral',
          presets: {}
        },
        filters: [
          {
            id: 'blur-filter',
            type: 'blur',
            params: { stdDeviation: 3 }
          }
        ]
      };
      
      const result = validator.validateAnimeCharacterSchema(schema);
      
      expect(result.valid).toBe(true);
    });

    it('should validate shadow filter', () => {
      const schema: AnimeCharacterSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral',
          presets: {}
        },
        filters: [
          {
            id: 'shadow-filter',
            type: 'shadow',
            params: { dx: 2, dy: 2 }
          }
        ]
      };
      
      const result = validator.validateAnimeCharacterSchema(schema);
      
      expect(result.valid).toBe(true);
    });

    it('should validate glow filter', () => {
      const schema: AnimeCharacterSchema = {
        id: 'test-anime',
        version: '2.0',
        style: 'standard',
        layers: {
          base: [],
          face: [],
          hair: { front: [], back: [] },
          clothing: [],
          effects: []
        },
        expressions: {
          current: 'neutral',
          presets: {}
        },
        filters: [
          {
            id: 'glow-filter',
            type: 'glow',
            params: { stdDeviation: 2 }
          }
        ]
      };
      
      const result = validator.validateAnimeCharacterSchema(schema);
      
      expect(result.valid).toBe(true);
    });
  });
});
