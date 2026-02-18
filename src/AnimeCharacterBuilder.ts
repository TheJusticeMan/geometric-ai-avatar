import type { 
  AnimeCharacterSchema, 
  AnimeStyle, 
  AnimeElement, 
  GradientDefinition,
  FilterDefinition,
  ExpressionConfig,
  PathElement,
  CircleElement
} from './types';

export interface CharacterPalette {
  skin: string;
  skinShadow: string;
  hair: string;
  hairHighlight: string;
  eyes: string;
  eyeHighlight: string;
  clothing: string;
  clothingAccent: string;
}

export interface EyeConfig {
  openness: number;
  irisSize: number;
  irisOffsetX: number;
  irisOffsetY: number;
}

export class AnimeCharacterBuilder {
  private style: AnimeStyle = 'standard';
  private palette: CharacterPalette;
  private characterId: string;
  
  constructor(style: AnimeStyle = 'standard') {
    this.style = style;
    this.characterId = `anime-${style}-${Date.now()}`;
    this.palette = this.getDefaultPalette();
  }
  
  private getDefaultPalette(): CharacterPalette {
    return {
      skin: '#FFE0BD',
      skinShadow: '#F4C2A0',
      hair: '#4A3728',
      hairHighlight: '#6B5346',
      eyes: '#4A90E2',
      eyeHighlight: '#87CEEB',
      clothing: '#E74C3C',
      clothingAccent: '#C0392B'
    };
  }
  
  // Set the art style
  setStyle(style: AnimeStyle): this {
    this.style = style;
    return this;
  }
  
  // Set character color palette
  setPalette(palette: Partial<CharacterPalette>): this {
    this.palette = { ...this.palette, ...palette };
    return this;
  }
  
  // Build a complete anime character schema
  build(): AnimeCharacterSchema {
    return {
      id: this.characterId,
      version: '2.0',
      style: this.style,
      layers: {
        base: this.buildBaseLayer(),
        face: this.buildFaceLayer(),
        hair: this.buildHairLayer(),
        clothing: this.buildClothingLayer(),
        effects: this.buildEffectsLayer()
      },
      expressions: {
        current: 'neutral',
        presets: this.generateDefaultExpressions()
      },
      gradients: this.generateGradients(),
      filters: this.generateFilters()
    };
  }
  
  // Build base layer (head and body shapes)
  private buildBaseLayer(): AnimeElement[] {
    const elements: AnimeElement[] = [];
    const headY = this.style === 'chibi' ? 80 : 100;
    
    // Head outline
    elements.push({
      type: 'path',
      id: 'head-outline',
      'z-index': 1,
      coordinates: {
        d: this.generateHeadPath(this.style)
      },
      style: {
        fill: this.palette.skin,
        stroke: '#2C3E50',
        opacity: 1,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    } as PathElement);
    
    // Head shadow for depth
    elements.push({
      type: 'path',
      id: 'head-shadow',
      'z-index': 2,
      coordinates: {
        d: this.generateHeadShadowPath(this.style)
      },
      style: {
        fill: this.palette.skinShadow,
        stroke: 'none',
        opacity: 0.3,
        filter: 'url(#blur-filter)'
      }
    } as PathElement);
    
    // Neck
    elements.push({
      type: 'path',
      id: 'neck',
      'z-index': 0,
      coordinates: {
        d: `M 185 ${headY + 50} L 215 ${headY + 50} L 210 ${headY + 70} L 190 ${headY + 70} Z`
      },
      style: {
        fill: this.palette.skin,
        stroke: '#2C3E50',
        opacity: 1,
        strokeWidth: 1.5
      }
    } as PathElement);
    
    // Body
    elements.push({
      type: 'path',
      id: 'body',
      'z-index': 0,
      coordinates: {
        d: this.generateBodyPath(this.style)
      },
      style: {
        fill: 'url(#body-gradient)',
        stroke: '#2C3E50',
        opacity: 1,
        strokeWidth: 2,
        strokeLinecap: 'round'
      }
    } as PathElement);
    
    return elements;
  }
  
  // Build face layer (eyes, nose, mouth, eyebrows)
  private buildFaceLayer(): AnimeElement[] {
    const elements: AnimeElement[] = [];
    const eyeY = this.style === 'chibi' ? 90 : 100;
    const eyeSpacing = this.style === 'chibi' ? 25 : 20;
    
    // Left eye outline
    elements.push({
      type: 'path',
      id: 'left-eye-outline',
      'z-index': 10,
      coordinates: {
        d: this.generateEyePath({ openness: 1, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 }, 200 - eyeSpacing, eyeY, true)
      },
      style: {
        fill: '#FFFFFF',
        stroke: '#2C3E50',
        opacity: 1,
        strokeWidth: 2.5,
        strokeLinecap: 'round'
      }
    } as PathElement);
    
    // Right eye outline
    elements.push({
      type: 'path',
      id: 'right-eye-outline',
      'z-index': 10,
      coordinates: {
        d: this.generateEyePath({ openness: 1, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 }, 200 + eyeSpacing, eyeY, false)
      },
      style: {
        fill: '#FFFFFF',
        stroke: '#2C3E50',
        opacity: 1,
        strokeWidth: 2.5,
        strokeLinecap: 'round'
      }
    } as PathElement);
    
    // Left iris
    elements.push({
      type: 'circle',
      id: 'left-iris',
      'z-index': 11,
      coordinates: {
        cx: 200 - eyeSpacing,
        cy: eyeY,
        r: this.style === 'chibi' ? 6 : 5
      },
      style: {
        fill: 'url(#iris-gradient)',
        stroke: 'none',
        opacity: 1
      }
    } as CircleElement);
    
    // Right iris
    elements.push({
      type: 'circle',
      id: 'right-iris',
      'z-index': 11,
      coordinates: {
        cx: 200 + eyeSpacing,
        cy: eyeY,
        r: this.style === 'chibi' ? 6 : 5
      },
      style: {
        fill: 'url(#iris-gradient)',
        stroke: 'none',
        opacity: 1
      }
    } as CircleElement);
    
    // Left pupil
    elements.push({
      type: 'circle',
      id: 'left-pupil',
      'z-index': 12,
      coordinates: {
        cx: 200 - eyeSpacing,
        cy: eyeY,
        r: this.style === 'chibi' ? 3 : 2.5
      },
      style: {
        fill: '#2C3E50',
        stroke: 'none',
        opacity: 1
      }
    } as CircleElement);
    
    // Right pupil
    elements.push({
      type: 'circle',
      id: 'right-pupil',
      'z-index': 12,
      coordinates: {
        cx: 200 + eyeSpacing,
        cy: eyeY,
        r: this.style === 'chibi' ? 3 : 2.5
      },
      style: {
        fill: '#2C3E50',
        stroke: 'none',
        opacity: 1
      }
    } as CircleElement);
    
    // Eye highlights
    elements.push({
      type: 'circle',
      id: 'left-eye-highlight',
      'z-index': 13,
      coordinates: {
        cx: 200 - eyeSpacing + 2,
        cy: eyeY - 2,
        r: this.style === 'chibi' ? 2 : 1.5
      },
      style: {
        fill: '#FFFFFF',
        stroke: 'none',
        opacity: 0.9
      }
    } as CircleElement);
    
    elements.push({
      type: 'circle',
      id: 'right-eye-highlight',
      'z-index': 13,
      coordinates: {
        cx: 200 + eyeSpacing + 2,
        cy: eyeY - 2,
        r: this.style === 'chibi' ? 2 : 1.5
      },
      style: {
        fill: '#FFFFFF',
        stroke: 'none',
        opacity: 0.9
      }
    } as CircleElement);
    
    // Eyebrows
    elements.push({
      type: 'path',
      id: 'left-eyebrow',
      'z-index': 9,
      coordinates: {
        d: `M ${200 - eyeSpacing - 10} ${eyeY - 12} Q ${200 - eyeSpacing} ${eyeY - 14} ${200 - eyeSpacing + 10} ${eyeY - 12}`
      },
      style: {
        fill: 'none',
        stroke: this.palette.hair,
        opacity: 1,
        strokeWidth: 2.5,
        strokeLinecap: 'round'
      }
    } as PathElement);
    
    elements.push({
      type: 'path',
      id: 'right-eyebrow',
      'z-index': 9,
      coordinates: {
        d: `M ${200 + eyeSpacing - 10} ${eyeY - 12} Q ${200 + eyeSpacing} ${eyeY - 14} ${200 + eyeSpacing + 10} ${eyeY - 12}`
      },
      style: {
        fill: 'none',
        stroke: this.palette.hair,
        opacity: 1,
        strokeWidth: 2.5,
        strokeLinecap: 'round'
      }
    } as PathElement);
    
    // Nose (simple dot)
    elements.push({
      type: 'circle',
      id: 'nose',
      'z-index': 10,
      coordinates: {
        cx: 200,
        cy: eyeY + 15,
        r: 1
      },
      style: {
        fill: this.palette.skinShadow,
        stroke: 'none',
        opacity: 0.5
      }
    } as CircleElement);
    
    // Mouth
    elements.push({
      type: 'path',
      id: 'mouth',
      'z-index': 10,
      coordinates: {
        d: this.generateMouthPath('neutral')
      },
      style: {
        fill: 'none',
        stroke: '#E74C3C',
        opacity: 1,
        strokeWidth: 2,
        strokeLinecap: 'round'
      }
    } as PathElement);
    
    return elements;
  }
  
  // Build hair layer
  private buildHairLayer(): { front: AnimeElement[]; back: AnimeElement[] } {
    const front: AnimeElement[] = [];
    const back: AnimeElement[] = [];
    
    // Back hair (behind head)
    back.push({
      type: 'path',
      id: 'hair-back',
      'z-index': 0,
      coordinates: {
        d: this.generateBackHairPath(this.style)
      },
      style: {
        fill: 'url(#hair-gradient)',
        stroke: '#2C3E50',
        opacity: 1,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }
    } as PathElement);
    
    // Front hair strands
    for (let i = 0; i < 5; i++) {
      front.push({
        type: 'path',
        id: `hair-strand-${i}`,
        'z-index': 20 + i,
        coordinates: {
          d: this.generateHairStrandPath(i)
        },
        style: {
          fill: i % 2 === 0 ? this.palette.hair : this.palette.hairHighlight,
          stroke: '#2C3E50',
          opacity: 1,
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round'
        }
      } as PathElement);
    }
    
    return { front, back };
  }
  
  // Build clothing layer
  private buildClothingLayer(): AnimeElement[] {
    const elements: AnimeElement[] = [];
    const bodyY = this.style === 'chibi' ? 180 : 200;
    
    // Shirt/clothing
    elements.push({
      type: 'path',
      id: 'shirt',
      'z-index': 5,
      coordinates: {
        d: `M 160 ${bodyY - 30} L 240 ${bodyY - 30} L 245 ${bodyY + 20} L 235 ${bodyY + 40} L 165 ${bodyY + 40} L 155 ${bodyY + 20} Z`
      },
      style: {
        fill: 'url(#clothing-gradient)',
        stroke: '#2C3E50',
        opacity: 1,
        strokeWidth: 2,
        strokeLinecap: 'round'
      }
    } as PathElement);
    
    // Collar
    elements.push({
      type: 'path',
      id: 'collar',
      'z-index': 6,
      coordinates: {
        d: `M 185 ${bodyY - 30} L 200 ${bodyY - 20} L 215 ${bodyY - 30}`
      },
      style: {
        fill: 'none',
        stroke: this.palette.clothingAccent,
        opacity: 1,
        strokeWidth: 2,
        strokeLinecap: 'round'
      }
    } as PathElement);
    
    return elements;
  }
  
  // Build effects layer (blush, sweat, sparkles, etc.)
  private buildEffectsLayer(): AnimeElement[] {
    const elements: AnimeElement[] = [];
    const eyeY = this.style === 'chibi' ? 90 : 100;
    
    // Blush (initially hidden)
    elements.push({
      type: 'circle',
      id: 'blush-left',
      'z-index': 15,
      coordinates: {
        cx: 170,
        cy: eyeY + 10,
        r: 8
      },
      style: {
        fill: '#FF6B9D',
        stroke: 'none',
        opacity: 0 // Hidden by default
      }
    } as CircleElement);
    
    elements.push({
      type: 'circle',
      id: 'blush-right',
      'z-index': 15,
      coordinates: {
        cx: 230,
        cy: eyeY + 10,
        r: 8
      },
      style: {
        fill: '#FF6B9D',
        stroke: 'none',
        opacity: 0 // Hidden by default
      }
    } as CircleElement);
    
    // Sweat drop (initially hidden)
    elements.push({
      type: 'path',
      id: 'sweat-drop',
      'z-index': 16,
      coordinates: {
        d: 'M 235 75 Q 240 78 237 83 Q 235 85 233 83 Q 230 78 235 75 Z'
      },
      style: {
        fill: '#87CEEB',
        stroke: '#4A90E2',
        opacity: 0, // Hidden by default
        strokeWidth: 1
      }
    } as PathElement);
    
    // Sparkles (initially hidden)
    for (let i = 0; i < 3; i++) {
      elements.push({
        type: 'path',
        id: `sparkle-${i}`,
        'z-index': 17,
        coordinates: {
          d: this.generateSparklePath(140 + i * 40, 60 + i * 10)
        },
        style: {
          fill: '#FFD700',
          stroke: 'none',
          opacity: 0 // Hidden by default
        }
      } as PathElement);
    }
    
    // Angry vein (initially hidden)
    elements.push({
      type: 'path',
      id: 'angry-vein',
      'z-index': 16,
      coordinates: {
        d: 'M 230 70 L 235 65 M 235 70 L 230 65'
      },
      style: {
        fill: 'none',
        stroke: '#E74C3C',
        opacity: 0, // Hidden by default
        strokeWidth: 3,
        strokeLinecap: 'round'
      }
    } as PathElement);
    
    return elements;
  }
  
  // Generate SVG path data for head
  private generateHeadPath(style: AnimeStyle): string {
    if (style === 'chibi') {
      // Large round head for chibi
      return 'M 150 80 Q 150 40 200 40 Q 250 40 250 80 Q 250 130 200 140 Q 150 130 150 80 Z';
    } else {
      // Standard head shape
      return 'M 160 70 Q 160 50 200 50 Q 240 50 240 70 Q 245 100 240 120 Q 220 140 200 140 Q 180 140 160 120 Q 155 100 160 70 Z';
    }
  }
  
  // Generate head shadow path
  private generateHeadShadowPath(style: AnimeStyle): string {
    if (style === 'chibi') {
      return 'M 200 120 Q 180 125 160 115 Q 165 130 200 140 Q 235 130 240 115 Q 220 125 200 120 Z';
    } else {
      return 'M 200 120 Q 180 125 165 115 Q 170 130 200 140 Q 230 130 235 115 Q 220 125 200 120 Z';
    }
  }
  
  // Generate body path
  private generateBodyPath(style: AnimeStyle): string {
    if (style === 'chibi') {
      // Small, cute body
      return 'M 170 180 L 230 180 Q 235 200 230 220 L 170 220 Q 165 200 170 180 Z';
    } else {
      // Standard proportions
      return 'M 160 200 L 240 200 Q 245 240 240 280 L 160 280 Q 155 240 160 200 Z';
    }
  }
  
  // Generate eye path
  private generateEyePath(config: EyeConfig, x: number, y: number, _isLeft: boolean): string {
    const width = 12;
    const height = 10 * config.openness;
    
    // Almond-shaped eye
    return `M ${x - width} ${y} Q ${x - width} ${y - height} ${x} ${y - height} Q ${x + width} ${y - height} ${x + width} ${y} Q ${x + width} ${y + height} ${x} ${y + height} Q ${x - width} ${y + height} ${x - width} ${y} Z`;
  }
  
  // Generate mouth path
  private generateMouthPath(shape: string): string {
    const centerX = 200;
    const centerY = 120;
    
    switch (shape) {
      case 'smile':
        return `M ${centerX - 12} ${centerY} Q ${centerX} ${centerY + 5} ${centerX + 12} ${centerY}`;
      case 'frown':
        return `M ${centerX - 12} ${centerY} Q ${centerX} ${centerY - 3} ${centerX + 12} ${centerY}`;
      case 'open':
        return `M ${centerX - 8} ${centerY - 2} Q ${centerX} ${centerY + 3} ${centerX + 8} ${centerY - 2} Q ${centerX + 8} ${centerY + 6} ${centerX} ${centerY + 10} Q ${centerX - 8} ${centerY + 6} ${centerX - 8} ${centerY - 2} Z`;
      case 'surprised':
        return `M ${centerX - 6} ${centerY - 3} Q ${centerX - 6} ${centerY + 3} ${centerX} ${centerY + 3} Q ${centerX + 6} ${centerY + 3} ${centerX + 6} ${centerY - 3} Q ${centerX + 6} ${centerY - 9} ${centerX} ${centerY - 9} Q ${centerX - 6} ${centerY - 9} ${centerX - 6} ${centerY - 3} Z`;
      case 'smirk':
        return `M ${centerX - 12} ${centerY} Q ${centerX - 3} ${centerY + 3} ${centerX + 8} ${centerY - 2}`;
      case 'pout':
        return `M ${centerX - 8} ${centerY} L ${centerX + 8} ${centerY}`;
      case 'neutral':
      default:
        return `M ${centerX - 10} ${centerY} L ${centerX + 10} ${centerY}`;
    }
  }
  
  // Generate hair strand path
  private generateHairStrandPath(index: number): string {
    const baseX = 160 + index * 20;
    const baseY = 55;
    const controlX = baseX + (index % 2 === 0 ? -5 : 5);
    const endY = baseY + 25 + index * 3;
    
    return `M ${baseX} ${baseY} Q ${controlX} ${baseY + 10} ${baseX} ${endY} L ${baseX + 8} ${endY} Q ${controlX + 8} ${baseY + 10} ${baseX + 8} ${baseY} Z`;
  }
  
  // Generate back hair path
  private generateBackHairPath(style: AnimeStyle): string {
    if (style === 'chibi') {
      return 'M 145 75 Q 140 40 200 35 Q 260 40 255 75 Q 260 85 255 95 L 250 80 Q 200 130 150 80 L 145 95 Q 140 85 145 75 Z';
    } else {
      return 'M 155 65 Q 150 45 200 40 Q 250 45 245 65 Q 250 75 245 85 L 240 70 Q 200 115 160 70 L 155 85 Q 150 75 155 65 Z';
    }
  }
  
  // Generate sparkle path
  private generateSparklePath(x: number, y: number): string {
    const size = 4;
    return `M ${x} ${y - size} L ${x + 1} ${y - 1} L ${x + size} ${y} L ${x + 1} ${y + 1} L ${x} ${y + size} L ${x - 1} ${y + 1} L ${x - size} ${y} L ${x - 1} ${y - 1} Z`;
  }
  
  // Generate default expression presets
  private generateDefaultExpressions(): Record<string, ExpressionConfig> {
    return {
      neutral: {
        eyes: {
          leftEye: { openness: 1, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 },
          rightEye: { openness: 1, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 },
          eyebrows: { leftAngle: 0, rightAngle: 0, leftHeight: 0, rightHeight: 0 }
        },
        mouth: { shape: 'neutral', openness: 0, width: 1 },
        effects: { blush: 0, sweatDrop: false, sparkles: false, angryVein: false }
      },
      happy: {
        eyes: {
          leftEye: { openness: 0.7, irisSize: 0.6, irisOffsetX: 0, irisOffsetY: -0.1 },
          rightEye: { openness: 0.7, irisSize: 0.6, irisOffsetX: 0, irisOffsetY: -0.1 },
          eyebrows: { leftAngle: -5, rightAngle: 5, leftHeight: 2, rightHeight: 2 }
        },
        mouth: { shape: 'smile', openness: 0.3, width: 1.2 },
        effects: { blush: 0, sweatDrop: false, sparkles: true, angryVein: false }
      }
    };
  }
  
  // Generate gradients for the character
  private generateGradients(): GradientDefinition[] {
    return [
      {
        id: 'iris-gradient',
        type: 'radial',
        stops: [
          { offset: '0%', color: this.palette.eyeHighlight, opacity: 1 },
          { offset: '50%', color: this.palette.eyes, opacity: 1 },
          { offset: '100%', color: this.palette.eyes, opacity: 1 }
        ],
        cx: '50%',
        cy: '30%',
        r: '50%'
      },
      {
        id: 'hair-gradient',
        type: 'linear',
        stops: [
          { offset: '0%', color: this.palette.hairHighlight, opacity: 1 },
          { offset: '50%', color: this.palette.hair, opacity: 1 },
          { offset: '100%', color: this.palette.hair, opacity: 1 }
        ],
        x1: '0%',
        y1: '0%',
        x2: '0%',
        y2: '100%'
      },
      {
        id: 'body-gradient',
        type: 'linear',
        stops: [
          { offset: '0%', color: this.palette.skin, opacity: 1 },
          { offset: '100%', color: this.palette.skinShadow, opacity: 1 }
        ],
        x1: '0%',
        y1: '0%',
        x2: '0%',
        y2: '100%'
      },
      {
        id: 'clothing-gradient',
        type: 'linear',
        stops: [
          { offset: '0%', color: this.palette.clothing, opacity: 1 },
          { offset: '100%', color: this.palette.clothingAccent, opacity: 1 }
        ],
        x1: '0%',
        y1: '0%',
        x2: '0%',
        y2: '100%'
      }
    ];
  }
  
  // Generate filters for the character
  private generateFilters(): FilterDefinition[] {
    return [
      {
        id: 'blur-filter',
        type: 'blur',
        params: { stdDeviation: 3 }
      },
      {
        id: 'glow-filter',
        type: 'glow',
        params: { stdDeviation: 2, floodColor: '#FFD700', floodOpacity: 0.7 }
      },
      {
        id: 'shadow-filter',
        type: 'shadow',
        params: { dx: 2, dy: 2, stdDeviation: 2, floodColor: '#000000', floodOpacity: 0.3 }
      }
    ];
  }
}
