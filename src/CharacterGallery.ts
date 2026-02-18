export interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  path: string;
}

export class CharacterGallery {
  private presets: CharacterPreset[] = [
    { id: 'default-avatar', name: 'Default', description: 'The standard geometric avatar', path: '/data/characters/default.json' },
    { id: 'scholar-avatar', name: 'Scholar', description: 'A focused academic with a hexagonal cap', path: '/data/characters/scholar.json' },
    { id: 'guardian-avatar', name: 'Guardian', description: 'A broad, powerful protector', path: '/data/characters/guardian.json' },
    { id: 'trickster-avatar', name: 'Trickster', description: 'An asymmetric, playful spirit', path: '/data/characters/trickster.json' },
  ];

  getPresets(): CharacterPreset[] {
    return [...this.presets];
  }

  async loadPreset(presetId: string): Promise<unknown> {
    const preset = this.presets.find(p => p.id === presetId);
    if (!preset) return null;
    const response = await fetch(preset.path);
    return await response.json();
  }
}
