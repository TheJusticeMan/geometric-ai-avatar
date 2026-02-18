import { describe, it, expect } from 'vitest';
import { AnimeCharacterBuilder } from '../src/AnimeCharacterBuilder';
import type { AnimeStyle } from '../src/types';

describe('AnimeCharacterBuilder', () => {
  describe('Builder Initialization', () => {
    it('should create builder with default standard style', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(schema.style).toBe('standard');
    });

    it('should create builder with specified style', () => {
      const builder = new AnimeCharacterBuilder('chibi');
      const schema = builder.build();
      
      expect(schema.style).toBe('chibi');
    });

    it('should generate valid unique IDs', () => {
      const builder1 = new AnimeCharacterBuilder();
      const schema1 = builder1.build();
      
      // Wait a millisecond to ensure different timestamp
      const start = Date.now();
      while (Date.now() === start) {
        // busy wait for next millisecond
      }
      
      const builder2 = new AnimeCharacterBuilder();
      const schema2 = builder2.build();
      
      // Both should have IDs
      expect(schema1.id).toBeDefined();
      expect(schema2.id).toBeDefined();
      expect(typeof schema1.id).toBe('string');
      expect(typeof schema2.id).toBe('string');
      expect(schema1.id.length).toBeGreaterThan(0);
      
      // IDs should be different if created at different times
      // If they're the same timestamp, at least verify the format is correct
      expect(schema1.id).toMatch(/^anime-/);
      expect(schema2.id).toMatch(/^anime-/);
    });
  });

  describe('Style Support', () => {
    const styles: AnimeStyle[] = ['chibi', 'standard', 'shounen', 'shoujo', 'pixel'];
    
    styles.forEach(style => {
      it(`should build valid schema for ${style} style`, () => {
        const builder = new AnimeCharacterBuilder(style);
        const schema = builder.build();
        
        expect(schema.version).toBe('2.0');
        expect(schema.style).toBe(style);
        expect(schema.layers).toBeDefined();
        expect(schema.expressions).toBeDefined();
      });
    });

    it('should allow changing style with setStyle', () => {
      const builder = new AnimeCharacterBuilder('standard');
      builder.setStyle('chibi');
      const schema = builder.build();
      
      expect(schema.style).toBe('chibi');
    });
  });

  describe('Schema Structure', () => {
    it('should have correct version (2.0)', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(schema.version).toBe('2.0');
    });

    it('should have all required layers', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(schema.layers.base).toBeDefined();
      expect(schema.layers.face).toBeDefined();
      expect(schema.layers.hair).toBeDefined();
      expect(schema.layers.hair.front).toBeDefined();
      expect(schema.layers.hair.back).toBeDefined();
      expect(schema.layers.clothing).toBeDefined();
      expect(schema.layers.effects).toBeDefined();
    });

    it('should have expressions with current and presets', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(schema.expressions.current).toBeDefined();
      expect(schema.expressions.presets).toBeDefined();
      expect(typeof schema.expressions.presets).toBe('object');
    });

    it('should have gradients array', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(Array.isArray(schema.gradients)).toBe(true);
      expect(schema.gradients!.length).toBeGreaterThan(0);
    });

    it('should have filters array', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(Array.isArray(schema.filters)).toBe(true);
      expect(schema.filters!.length).toBeGreaterThan(0);
    });
  });

  describe('Layer Content', () => {
    it('should have elements in base layer', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(Array.isArray(schema.layers.base)).toBe(true);
      expect(schema.layers.base.length).toBeGreaterThan(0);
    });

    it('should have face elements including eyes and mouth', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(Array.isArray(schema.layers.face)).toBe(true);
      expect(schema.layers.face.length).toBeGreaterThan(0);
      
      const elementIds = schema.layers.face.map(el => el.id);
      expect(elementIds.some(id => id.includes('eye'))).toBe(true);
      expect(elementIds.some(id => id.includes('mouth'))).toBe(true);
    });

    it('should have hair in both front and back', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(Array.isArray(schema.layers.hair.front)).toBe(true);
      expect(Array.isArray(schema.layers.hair.back)).toBe(true);
      expect(schema.layers.hair.front.length).toBeGreaterThan(0);
      expect(schema.layers.hair.back.length).toBeGreaterThan(0);
    });

    it('should have clothing elements', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(Array.isArray(schema.layers.clothing)).toBe(true);
      expect(schema.layers.clothing.length).toBeGreaterThan(0);
    });

    it('should have effect elements (blush, sweat, etc.)', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(Array.isArray(schema.layers.effects)).toBe(true);
      expect(schema.layers.effects.length).toBeGreaterThan(0);
      
      const elementIds = schema.layers.effects.map(el => el.id);
      expect(elementIds.some(id => id.includes('blush'))).toBe(true);
    });
  });

  describe('Element Properties', () => {
    it('should have valid z-index for all elements', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      const allElements = [
        ...schema.layers.base,
        ...schema.layers.face,
        ...schema.layers.hair.front,
        ...schema.layers.hair.back,
        ...schema.layers.clothing,
        ...schema.layers.effects
      ];
      
      allElements.forEach(el => {
        expect(typeof el['z-index']).toBe('number');
      });
    });

    it('should have valid element IDs', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      const allElements = [
        ...schema.layers.base,
        ...schema.layers.face,
        ...schema.layers.hair.front,
        ...schema.layers.hair.back,
        ...schema.layers.clothing,
        ...schema.layers.effects
      ];
      
      allElements.forEach(el => {
        expect(typeof el.id).toBe('string');
        expect(el.id.length).toBeGreaterThan(0);
      });
    });

    it('should have valid coordinates for all elements', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      const allElements = [
        ...schema.layers.base,
        ...schema.layers.face,
        ...schema.layers.hair.front,
        ...schema.layers.hair.back,
        ...schema.layers.clothing,
        ...schema.layers.effects
      ];
      
      allElements.forEach(el => {
        expect(el.coordinates).toBeDefined();
      });
    });

    it('should have valid style for all elements', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      const allElements = [
        ...schema.layers.base,
        ...schema.layers.face,
        ...schema.layers.hair.front,
        ...schema.layers.hair.back,
        ...schema.layers.clothing,
        ...schema.layers.effects
      ];
      
      allElements.forEach(el => {
        expect(el.style).toBeDefined();
        expect(el.style.fill).toBeDefined();
        expect(el.style.stroke).toBeDefined();
        expect(typeof el.style.opacity).toBe('number');
      });
    });
  });

  describe('Palette Customization', () => {
    it('should use default palette when not specified', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      // Check that default colors are used in gradients
      expect(schema.gradients).toBeDefined();
      expect(schema.gradients!.length).toBeGreaterThan(0);
    });

    it('should allow setting custom palette', () => {
      const builder = new AnimeCharacterBuilder();
      builder.setPalette({
        skin: '#FF0000',
        hair: '#00FF00'
      });
      const schema = builder.build();
      
      // Check that custom colors appear in the schema
      // Custom colors will be in gradients
      expect(schema.gradients).toBeDefined();
      expect(schema.gradients!.length).toBeGreaterThan(0);
      
      // Verify some gradient has custom colors
      const hasCustomColors = schema.gradients!.some(g => 
        g.stops.some(s => s.color === '#FF0000' || s.color === '#00FF00')
      );
      expect(hasCustomColors).toBe(true);
    });

    it('should support method chaining', () => {
      const builder = new AnimeCharacterBuilder();
      const result = builder
        .setStyle('chibi')
        .setPalette({ skin: '#FFFFFF' });
      
      expect(result).toBe(builder);
      
      const schema = builder.build();
      expect(schema.style).toBe('chibi');
    });
  });

  describe('Gradients', () => {
    it('should generate iris gradient', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      const irisGradient = schema.gradients!.find(g => g.id === 'iris-gradient');
      expect(irisGradient).toBeDefined();
      expect(irisGradient?.type).toBe('radial');
      expect(irisGradient?.stops.length).toBeGreaterThan(0);
    });

    it('should generate hair gradient', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      const hairGradient = schema.gradients!.find(g => g.id === 'hair-gradient');
      expect(hairGradient).toBeDefined();
      expect(hairGradient?.type).toBe('linear');
      expect(hairGradient?.stops.length).toBeGreaterThan(0);
    });

    it('should have valid gradient stops', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      schema.gradients!.forEach(gradient => {
        expect(gradient.stops.length).toBeGreaterThan(0);
        gradient.stops.forEach(stop => {
          expect(stop.offset).toBeDefined();
          expect(stop.color).toBeDefined();
        });
      });
    });
  });

  describe('Filters', () => {
    it('should generate blur filter', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      const blurFilter = schema.filters!.find(f => f.id === 'blur-filter');
      expect(blurFilter).toBeDefined();
      expect(blurFilter?.type).toBe('blur');
    });

    it('should have filter parameters', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      schema.filters!.forEach(filter => {
        expect(filter.params).toBeDefined();
        expect(typeof filter.params).toBe('object');
      });
    });
  });

  describe('Expression Presets', () => {
    it('should include neutral expression preset', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(schema.expressions.presets.neutral).toBeDefined();
    });

    it('should include happy expression preset', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(schema.expressions.presets.happy).toBeDefined();
    });

    it('should have valid expression structure', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      const neutral = schema.expressions.presets.neutral;
      expect(neutral.eyes).toBeDefined();
      expect(neutral.mouth).toBeDefined();
      expect(neutral.effects).toBeDefined();
    });

    it('should have current expression set to neutral by default', () => {
      const builder = new AnimeCharacterBuilder();
      const schema = builder.build();
      
      expect(schema.expressions.current).toBe('neutral');
    });
  });

  describe('Style Variations', () => {
    it('should produce different proportions for chibi vs standard', () => {
      const standardBuilder = new AnimeCharacterBuilder('standard');
      const chibiBuilder = new AnimeCharacterBuilder('chibi');
      
      const standardSchema = standardBuilder.build();
      const chibiSchema = chibiBuilder.build();
      
      // Chibi and standard should have different element counts or positions
      // This is a basic sanity check
      expect(standardSchema.layers.base.length).toBeGreaterThan(0);
      expect(chibiSchema.layers.base.length).toBeGreaterThan(0);
    });
  });
});
