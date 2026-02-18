import { describe, it, expect, beforeEach } from 'vitest';
import { Mirror } from '../src/Mirror';
import type { CharacterSchema } from '../src/types';

describe('Mirror', () => {
  let mirror: Mirror;
  let mockSVG: SVGSVGElement;

  beforeEach(() => {
    mirror = new Mirror();
    // Create a mock SVG element using jsdom
    mockSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  });

  describe('describeCurrentState', () => {
    it('should return message when no character is loaded', () => {
      const description = mirror.describeCurrentState(null, 'neutral', mockSVG);
      expect(description).toBe('No active character loaded.');
    });

    it('should include Geometric Configuration section', () => {
      const character: CharacterSchema = {
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

      const description = mirror.describeCurrentState(character, 'neutral', mockSVG);
      expect(description).toContain('Geometric Configuration');
      expect(description).toContain('head');
      expect(description).toContain('Circle at position (200, 200) with radius 50');
    });

    it('should include Current Mood section', () => {
      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: []
      };

      const description = mirror.describeCurrentState(character, 'energetic', mockSVG);
      expect(description).toContain('Current Mood');
      expect(description).toContain('ENERGETIC');
      expect(description).toContain('Animation Behavior');
    });

    it('should include Semantic Interpretation section', () => {
      const character: CharacterSchema = {
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

      const description = mirror.describeCurrentState(character, 'neutral', mockSVG);
      expect(description).toContain('Semantic Interpretation');
    });

    it('should describe polygon elements correctly', () => {
      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: [
          {
            type: 'polygon',
            id: 'torso',
            'z-index': 1,
            coordinates: { points: [[100, 100], [200, 100], [200, 200]] },
            style: { fill: '#00FF00', stroke: '#000000', opacity: 0.8 }
          }
        ]
      };

      const description = mirror.describeCurrentState(character, 'neutral', mockSVG);
      expect(description).toContain('torso');
      expect(description).toContain('Polygon with 3 vertices');
    });
  });

  describe('generateLLMContext', () => {
    it('should generate compact context for LLM', () => {
      const character: CharacterSchema = {
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

      const context = mirror.generateLLMContext(character, 'analytical', mockSVG);
      expect(context).toContain('Current Character (JSON)');
      expect(context).toContain('Mood: analytical');
      expect(context).toContain('Semantic Summary');
    });
  });
});
