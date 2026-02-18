import type { CharacterSchema, MoodState } from './types';
import { PersonalityMapper } from './PersonalityMapper';

export class Mirror {
  private personalityMapper: PersonalityMapper;

  constructor() {
    this.personalityMapper = new PersonalityMapper();
  }

  describeCurrentState(
    character: CharacterSchema | null,
    mood: MoodState,
    svgContainer: SVGSVGElement
  ): string {
    if (!character) {
      return 'No active character loaded.';
    }

    const description: string[] = [];
    
    description.push(`Avatar State Report (ID: ${character.id}, Version: ${character.version})`);
    description.push('');
    description.push('=== Geometric Configuration ===');
    
    // Describe each element
    character.elements.forEach(element => {
      if (element.type === 'circle') {
        const { cx, cy, r } = element.coordinates;
        description.push(
          `• ${element.id}: Circle at position (${cx}, ${cy}) with radius ${r}`
        );
      } else if (element.type === 'polygon') {
        const pointCount = element.coordinates.points.length;
        const firstPoint = element.coordinates.points[0];
        description.push(
          `• ${element.id}: Polygon with ${pointCount} vertices, starting at (${firstPoint[0]}, ${firstPoint[1]})`
        );
      }
      
      description.push(
        `  Style: fill=${element.style.fill}, stroke=${element.style.stroke}, opacity=${element.style.opacity}`
      );
    });

    description.push('');
    description.push('=== Current Mood & Personality ===');
    description.push(`Emotional State: ${mood.toUpperCase()}`);
    description.push(`Animation Behavior: ${this.personalityMapper.getAnimationBehavior(mood)}`);
    
    const modifiers = this.personalityMapper.getGeometricModifiers(mood);
    description.push('Geometric Modifiers:');
    if (modifiers.eyeRadiusMultiplier) {
      description.push(`  - Eye radius multiplier: ${modifiers.eyeRadiusMultiplier}x`);
    }
    if (modifiers.colorBrightness) {
      description.push(`  - Color brightness: ${modifiers.colorBrightness}x`);
    }
    if (modifiers.asymmetryFactor) {
      description.push(`  - Asymmetry factor: ${modifiers.asymmetryFactor} units`);
    }
    if (modifiers.jitterAmount) {
      description.push(`  - Jitter amount: ${modifiers.jitterAmount} pixels`);
    }

    description.push('');
    description.push('=== Animation State ===');
    
    // Describe active animations by checking SVG transform states
    const animatedElements = svgContainer.querySelectorAll('[style*="transform"]');
    if (animatedElements.length > 0) {
      description.push(`${animatedElements.length} element(s) currently animated`);
    } else {
      description.push('Idle animations active (float, breathe)');
    }

    description.push('');
    description.push('=== Semantic Interpretation ===');
    
    // Find specific elements and describe their semantic meaning
    const head = character.elements.find(el => el.id.includes('head'));
    if (head && head.type === 'circle') {
      const size = head.coordinates.r > 35 ? 'large' : head.coordinates.r > 25 ? 'normal' : 'small';
      description.push(`The avatar has a ${size} circular head.`);
    }

    const eyes = character.elements.filter(el => el.id.includes('eye'));
    if (eyes.length === 2) {
      const avgRadius = eyes.reduce((sum, eye) => {
        return eye.type === 'circle' ? sum + eye.coordinates.r : sum;
      }, 0) / eyes.length;
      const eyeState = avgRadius > 7 ? 'wide' : avgRadius > 4 ? 'normal' : 'narrowed';
      description.push(`Eyes are ${eyeState}.`);
    }

    const torso = character.elements.find(el => el.id.includes('torso'));
    if (torso) {
      description.push('Torso is present and stable.');
    }

    return description.join('\n');
  }

  generateBase64Snapshot(svgContainer: SVGSVGElement): string {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgContainer);
    const base64 = btoa(svgString);
    return `data:image/svg+xml;base64,${base64}`;
  }
}
