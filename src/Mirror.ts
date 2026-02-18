import type { AnyCharacterSchema, MoodState } from './types';
import { isAnimeCharacter } from './types';
import { PersonalityMapper } from './PersonalityMapper';

export class Mirror {
  private personalityMapper: PersonalityMapper;

  constructor() {
    this.personalityMapper = new PersonalityMapper();
  }

  describeCurrentState(
    character: AnyCharacterSchema | null,
    mood: MoodState,
    svgContainer: SVGSVGElement
  ): string {
    if (!character) {
      return 'No active character loaded.';
    }

    const description: string[] = [];
    
    description.push(`Avatar State Report (ID: ${character.id}, Version: ${character.version})`);
    description.push('');
    
    // Handle v2.0 anime characters
    if (isAnimeCharacter(character)) {
      description.push('=== Anime Character Configuration ===');
      description.push(`Style: ${character.style}`);
      description.push(`Current Expression: ${character.expressions.current}`);
      description.push('');
      description.push('Layers:');
      description.push(`  Base elements: ${character.layers.base.length}`);
      description.push(`  Face elements: ${character.layers.face.length}`);
      description.push(`  Hair (front): ${character.layers.hair.front.length}`);
      description.push(`  Hair (back): ${character.layers.hair.back.length}`);
      description.push(`  Clothing elements: ${character.layers.clothing.length}`);
      description.push(`  Effects elements: ${character.layers.effects.length}`);
      description.push('');
      description.push(`Available Expressions: ${Object.keys(character.expressions.presets).join(', ')}`);
      description.push(`Gradients: ${character.gradients?.length || 0}`);
      description.push(`Filters: ${character.filters?.length || 0}`);
    } else {
      // Handle v1.0 geometric characters
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
    }

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
    
    if (isAnimeCharacter(character)) {
      // Anime character interpretation
      description.push(`This is a ${character.style}-style anime character.`);
      description.push(`Currently displaying "${character.expressions.current}" expression.`);
      description.push(`The character has ${character.layers.hair.front.length + character.layers.hair.back.length} hair strand elements.`);
    } else {
      // V1.0 geometric character interpretation
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
    }

    return description.join('\n');
  }

  generateBase64Snapshot(svgContainer: SVGSVGElement): string {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgContainer);
    const base64 = btoa(svgString);
    return `data:image/svg+xml;base64,${base64}`;
  }

  // Generate LLM-optimized context for inclusion in prompts
  generateLLMContext(
    character: AnyCharacterSchema | null,
    mood: MoodState,
    _svgContainer: SVGSVGElement
  ): string {
    if (!character) {
      return 'No active character loaded.';
    }

    const context: string[] = [];

    // Compact character JSON
    context.push('Current Character (JSON):');
    context.push(JSON.stringify(character, null, 2));
    context.push('');

    // Current mood state
    context.push(`Mood: ${mood}`);
    const modifiers = this.personalityMapper.getGeometricModifiers(mood);
    if (Object.keys(modifiers).length > 0) {
      context.push(`Active Modifiers: ${JSON.stringify(modifiers)}`);
    }
    context.push('');

    // Semantic summary
    context.push('Semantic Summary:');
    
    if (isAnimeCharacter(character)) {
      // Anime character summary
      context.push(`Anime character (v2.0) with ${character.style} style.`);
      context.push(`Current expression: ${character.expressions.current}`);
      const totalElements = character.layers.base.length + character.layers.face.length +
        character.layers.hair.front.length + character.layers.hair.back.length +
        character.layers.clothing.length + character.layers.effects.length;
      context.push(`Total elements: ${totalElements} across 6 layers.`);
      context.push(`Available expressions: ${Object.keys(character.expressions.presets).join(', ')}`);
    } else {
      // V1.0 geometric character summary
      const elementCount = character.elements.length;
      const circleCount = character.elements.filter(el => el.type === 'circle').length;
      const polygonCount = character.elements.filter(el => el.type === 'polygon').length;
      
      context.push(`Avatar with ${elementCount} elements (${circleCount} circles, ${polygonCount} polygons).`);
      
      const head = character.elements.find(el => el.id.includes('head'));
      const eyes = character.elements.filter(el => el.id.includes('eye'));
      const torso = character.elements.find(el => el.id.includes('torso'));
      
      if (head) context.push('Has head.');
      if (eyes.length > 0) context.push(`Has ${eyes.length} eye(s).`);
      if (torso) context.push('Has torso.');
    }
    context.push('');

    // Available modification axes
    context.push('Available Modifications:');
    context.push('- Position: Adjust cx, cy coordinates');
    context.push('- Size: Adjust r (circles) or points (polygons)');
    context.push('- Colors: Change fill, stroke (hex format)');
    context.push('- Opacity: Adjust opacity (0-1)');
    context.push('- Z-Index: Reorder layers');

    return context.join('\n');
  }
}
