import { describe, it, expect } from 'vitest';
import { CharacterGallery } from '../src/CharacterGallery';

describe('CharacterGallery', () => {
  it('should return 4 presets', () => {
    const gallery = new CharacterGallery();
    const presets = gallery.getPresets();
    
    expect(presets).toHaveLength(4);
  });

  it('should have unique preset IDs', () => {
    const gallery = new CharacterGallery();
    const presets = gallery.getPresets();
    
    const ids = presets.map(p => p.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(presets.length);
  });

  it('should have valid path strings', () => {
    const gallery = new CharacterGallery();
    const presets = gallery.getPresets();
    
    presets.forEach(preset => {
      expect(typeof preset.path).toBe('string');
      expect(preset.path).toMatch(/^\/data\/characters\/.+\.json$/);
    });
  });

  it('should include all expected character presets', () => {
    const gallery = new CharacterGallery();
    const presets = gallery.getPresets();
    
    const ids = presets.map(p => p.id);
    expect(ids).toContain('default-avatar');
    expect(ids).toContain('scholar-avatar');
    expect(ids).toContain('guardian-avatar');
    expect(ids).toContain('trickster-avatar');
  });

  it('should return null for non-existent preset', async () => {
    const gallery = new CharacterGallery();
    const result = await gallery.loadPreset('non-existent');
    
    expect(result).toBeNull();
  });

  it('should have name and description for each preset', () => {
    const gallery = new CharacterGallery();
    const presets = gallery.getPresets();
    
    presets.forEach(preset => {
      expect(typeof preset.name).toBe('string');
      expect(preset.name.length).toBeGreaterThan(0);
      expect(typeof preset.description).toBe('string');
      expect(preset.description.length).toBeGreaterThan(0);
    });
  });
});
