import Ajv, { type ValidateFunction } from 'ajv';
import type { CharacterSchema, AnimationSchema } from './types';

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

export class SchemaValidator {
  private ajv: Ajv;
  private validateCharacter: ValidateFunction;
  private validateAnimation: ValidateFunction;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    this.validateCharacter = this.ajv.compile(characterSchemaDefinition);
    this.validateAnimation = this.ajv.compile(animationSchemaDefinition);
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
}
