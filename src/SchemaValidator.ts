import Ajv, { type ValidateFunction } from 'ajv';
import type { CharacterSchema, AnimationSchema, AnimeCharacterSchema, AnyCharacterSchema } from './types';
import { isAnimeCharacter } from './types';

// JSON Schema definitions for validation
const characterSchemaDefinition = {
  type: 'object',
  required: ['id', 'version', 'elements'],
  properties: {
    id: { type: 'string' },
    version: { type: 'string' },
    elements: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'id', 'z-index', 'coordinates', 'style'],
        properties: {
          type: { enum: ['circle', 'polygon'] },
          id: { type: 'string' },
          'z-index': { type: 'number' },
          coordinates: {
            oneOf: [
              {
                type: 'object',
                required: ['cx', 'cy', 'r'],
                properties: {
                  cx: { type: 'number' },
                  cy: { type: 'number' },
                  r: { type: 'number' }
                }
              },
              {
                type: 'object',
                required: ['points'],
                properties: {
                  points: {
                    type: 'array',
                    items: {
                      type: 'array',
                      minItems: 2,
                      maxItems: 2,
                      items: { type: 'number' }
                    }
                  }
                }
              }
            ]
          },
          style: {
            type: 'object',
            required: ['fill', 'stroke', 'opacity'],
            properties: {
              fill: { type: 'string' },
              stroke: { type: 'string' },
              opacity: { type: 'number', minimum: 0, maximum: 1 }
            }
          }
        }
      }
    }
  }
};

const animationSchemaDefinition = {
  type: 'object',
  required: ['targetId', 'property', 'timeline', 'easing', 'loop'],
  properties: {
    targetId: { type: 'string' },
    property: { enum: ['points', 'radius', 'transform', 'color'] },
    timeline: {
      type: 'array',
      items: {
        type: 'object',
        required: ['offset', 'value'],
        properties: {
          offset: { type: 'string' },
          value: { oneOf: [{ type: 'string' }, { type: 'number' }] }
        }
      }
    },
    easing: { type: 'string' },
    loop: { type: 'boolean' }
  }
};

// JSON Schema definition for v2.0 anime character schema
const animeCharacterSchemaDefinition = {
  type: 'object',
  required: ['id', 'version', 'style', 'layers', 'expressions'],
  properties: {
    id: { type: 'string' },
    version: { enum: ['2.0'] },
    style: { enum: ['chibi', 'standard', 'shounen', 'shoujo', 'pixel'] },
    layers: {
      type: 'object',
      required: ['base', 'face', 'hair', 'clothing', 'effects'],
      properties: {
        base: { type: 'array', items: { type: 'object' } },
        face: { type: 'array', items: { type: 'object' } },
        hair: {
          type: 'object',
          required: ['front', 'back'],
          properties: {
            front: { type: 'array', items: { type: 'object' } },
            back: { type: 'array', items: { type: 'object' } }
          }
        },
        clothing: { type: 'array', items: { type: 'object' } },
        effects: { type: 'array', items: { type: 'object' } }
      }
    },
    expressions: {
      type: 'object',
      required: ['current', 'presets'],
      properties: {
        current: { type: 'string' },
        presets: { type: 'object' }
      }
    },
    gradients: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'type', 'stops'],
        properties: {
          id: { type: 'string' },
          type: { enum: ['linear', 'radial'] },
          stops: {
            type: 'array',
            items: {
              type: 'object',
              required: ['offset', 'color'],
              properties: {
                offset: { type: 'string' },
                color: { type: 'string' },
                opacity: { type: 'number' }
              }
            }
          },
          x1: { type: 'string' },
          y1: { type: 'string' },
          x2: { type: 'string' },
          y2: { type: 'string' },
          cx: { type: 'string' },
          cy: { type: 'string' },
          r: { type: 'string' }
        }
      }
    },
    filters: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'type', 'params'],
        properties: {
          id: { type: 'string' },
          type: { enum: ['blur', 'shadow', 'glow'] },
          params: { type: 'object' }
        }
      }
    },
    clipPaths: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'shape'],
        properties: {
          id: { type: 'string' },
          shape: { type: 'object' }
        }
      }
    }
  }
};

export class SchemaValidator {
  private ajv: Ajv;
  private validateCharacter: ValidateFunction;
  private validateAnimation: ValidateFunction;
  private validateAnimeCharacter: ValidateFunction;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    this.validateCharacter = this.ajv.compile(characterSchemaDefinition);
    this.validateAnimation = this.ajv.compile(animationSchemaDefinition);
    this.validateAnimeCharacter = this.ajv.compile(animeCharacterSchemaDefinition);
  }

  validateCharacterSchema(data: unknown): { valid: boolean; errors: string[] } {
    const valid = this.validateCharacter(data);
    const errors = valid ? [] : (this.validateCharacter.errors?.map(err => 
      `${err.instancePath} ${err.message}`
    ) || []);
    
    return { valid, errors };
  }

  validateAnimationSchema(data: unknown): { valid: boolean; errors: string[] } {
    const valid = this.validateAnimation(data);
    const errors = valid ? [] : (this.validateAnimation.errors?.map(err => 
      `${err.instancePath} ${err.message}`
    ) || []);
    
    return { valid, errors };
  }

  isValidCharacter(data: unknown): data is CharacterSchema {
    return this.validateCharacter(data);
  }

  isValidAnimation(data: unknown): data is AnimationSchema {
    return this.validateAnimation(data);
  }

  // === PHASE 5: Anime Character Validation ===

  validateAnimeCharacterSchema(data: unknown): { valid: boolean; errors: string[] } {
    const valid = this.validateAnimeCharacter(data);
    const errors = valid ? [] : (this.validateAnimeCharacter.errors?.map(err => 
      `${err.instancePath} ${err.message}`
    ) || []);
    
    return { valid, errors };
  }

  isValidAnimeCharacter(data: unknown): data is AnimeCharacterSchema {
    return this.validateAnimeCharacter(data);
  }

  // Validate any character schema (v1.0 or v2.0)
  validateAnyCharacter(data: unknown): { valid: boolean; errors: string[]; version?: string } {
    // Try to detect version
    const dataObj = data as { version?: string };
    
    if (dataObj.version === '2.0') {
      const result = this.validateAnimeCharacterSchema(data);
      return { ...result, version: '2.0' };
    } else {
      const result = this.validateCharacterSchema(data);
      return { ...result, version: '1.0' };
    }
  }
}
