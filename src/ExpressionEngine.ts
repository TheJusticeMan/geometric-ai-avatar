import type { ExpressionConfig, MoodState } from './types';

export class ExpressionEngine {
  private presets: Map<string, ExpressionConfig>;
  
  constructor() {
    this.presets = new Map();
    this.initializeDefaults();
  }
  
  private initializeDefaults(): void {
    // Neutral expression
    this.presets.set('neutral', {
      eyes: {
        leftEye: { openness: 1, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 },
        rightEye: { openness: 1, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 },
        eyebrows: { leftAngle: 0, rightAngle: 0, leftHeight: 0, rightHeight: 0 }
      },
      mouth: {
        shape: 'neutral',
        openness: 0,
        width: 1
      },
      effects: {
        blush: 0,
        sweatDrop: false,
        sparkles: false,
        angryVein: false
      }
    });

    // Happy expression
    this.presets.set('happy', {
      eyes: {
        leftEye: { openness: 0.7, irisSize: 0.6, irisOffsetX: 0, irisOffsetY: -0.1 },
        rightEye: { openness: 0.7, irisSize: 0.6, irisOffsetX: 0, irisOffsetY: -0.1 },
        eyebrows: { leftAngle: -5, rightAngle: 5, leftHeight: 2, rightHeight: 2 }
      },
      mouth: {
        shape: 'smile',
        openness: 0.3,
        width: 1.2
      },
      effects: {
        blush: 0,
        sweatDrop: false,
        sparkles: true,
        angryVein: false
      }
    });

    // Sad expression
    this.presets.set('sad', {
      eyes: {
        leftEye: { openness: 0.8, irisSize: 0.6, irisOffsetX: 0, irisOffsetY: 0.1 },
        rightEye: { openness: 0.8, irisSize: 0.6, irisOffsetX: 0, irisOffsetY: 0.1 },
        eyebrows: { leftAngle: 15, rightAngle: -15, leftHeight: -5, rightHeight: -5 }
      },
      mouth: {
        shape: 'frown',
        openness: 0.2,
        width: 0.9
      },
      effects: {
        blush: 0,
        sweatDrop: true,
        sparkles: false,
        angryVein: false
      }
    });

    // Angry expression
    this.presets.set('angry', {
      eyes: {
        leftEye: { openness: 0.9, irisSize: 0.4, irisOffsetX: 0, irisOffsetY: 0 },
        rightEye: { openness: 0.9, irisSize: 0.4, irisOffsetX: 0, irisOffsetY: 0 },
        eyebrows: { leftAngle: -20, rightAngle: 20, leftHeight: -8, rightHeight: -8 }
      },
      mouth: {
        shape: 'frown',
        openness: 0.4,
        width: 0.8
      },
      effects: {
        blush: 0,
        sweatDrop: false,
        sparkles: false,
        angryVein: true
      }
    });

    // Surprised expression
    this.presets.set('surprised', {
      eyes: {
        leftEye: { openness: 1.3, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 },
        rightEye: { openness: 1.3, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0 },
        eyebrows: { leftAngle: -10, rightAngle: 10, leftHeight: 8, rightHeight: 8 }
      },
      mouth: {
        shape: 'surprised',
        openness: 0.8,
        width: 1
      },
      effects: {
        blush: 0,
        sweatDrop: false,
        sparkles: true,
        angryVein: false
      }
    });

    // Thinking expression
    this.presets.set('thinking', {
      eyes: {
        leftEye: { openness: 0.6, irisSize: 0.5, irisOffsetX: 0.2, irisOffsetY: -0.1 },
        rightEye: { openness: 0.9, irisSize: 0.5, irisOffsetX: 0.2, irisOffsetY: 0 },
        eyebrows: { leftAngle: 5, rightAngle: -10, leftHeight: 3, rightHeight: 0 }
      },
      mouth: {
        shape: 'neutral',
        openness: 0,
        width: 0.9
      },
      effects: {
        blush: 0,
        sweatDrop: false,
        sparkles: false,
        angryVein: false
      }
    });

    // Embarrassed expression
    this.presets.set('embarrassed', {
      eyes: {
        leftEye: { openness: 0.5, irisSize: 0.6, irisOffsetX: -0.1, irisOffsetY: 0.1 },
        rightEye: { openness: 0.5, irisSize: 0.6, irisOffsetX: 0.1, irisOffsetY: 0.1 },
        eyebrows: { leftAngle: 8, rightAngle: -8, leftHeight: 2, rightHeight: 2 }
      },
      mouth: {
        shape: 'smirk',
        openness: 0.2,
        width: 0.8
      },
      effects: {
        blush: 0.8,
        sweatDrop: true,
        sparkles: false,
        angryVein: false
      }
    });

    // Determined expression
    this.presets.set('determined', {
      eyes: {
        leftEye: { openness: 1.1, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: -0.05 },
        rightEye: { openness: 1.1, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: -0.05 },
        eyebrows: { leftAngle: -15, rightAngle: 15, leftHeight: -5, rightHeight: -5 }
      },
      mouth: {
        shape: 'neutral',
        openness: 0.3,
        width: 1
      },
      effects: {
        blush: 0,
        sweatDrop: false,
        sparkles: true,
        angryVein: false
      }
    });

    // Sleepy expression
    this.presets.set('sleepy', {
      eyes: {
        leftEye: { openness: 0.3, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0.2 },
        rightEye: { openness: 0.3, irisSize: 0.5, irisOffsetX: 0, irisOffsetY: 0.2 },
        eyebrows: { leftAngle: 5, rightAngle: -5, leftHeight: 0, rightHeight: 0 }
      },
      mouth: {
        shape: 'neutral',
        openness: 0.2,
        width: 0.8
      },
      effects: {
        blush: 0,
        sweatDrop: false,
        sparkles: false,
        angryVein: false
      }
    });

    // Excited expression
    this.presets.set('excited', {
      eyes: {
        leftEye: { openness: 1.2, irisSize: 0.7, irisOffsetX: 0, irisOffsetY: -0.1 },
        rightEye: { openness: 1.2, irisSize: 0.7, irisOffsetX: 0, irisOffsetY: -0.1 },
        eyebrows: { leftAngle: -8, rightAngle: 8, leftHeight: 5, rightHeight: 5 }
      },
      mouth: {
        shape: 'smile',
        openness: 0.6,
        width: 1.3
      },
      effects: {
        blush: 0.3,
        sweatDrop: false,
        sparkles: true,
        angryVein: false
      }
    });
  }
  
  getExpression(name: string): ExpressionConfig | null {
    return this.presets.get(name) || null;
  }
  
  registerExpression(name: string, config: ExpressionConfig): void {
    this.presets.set(name, config);
  }
  
  // Interpolate between two expressions for smooth transitions
  blendExpressions(from: ExpressionConfig, to: ExpressionConfig, t: number): ExpressionConfig {
    const lerp = (a: number, b: number): number => a + (b - a) * t;
    
    return {
      eyes: {
        leftEye: {
          openness: lerp(from.eyes.leftEye.openness, to.eyes.leftEye.openness),
          irisSize: lerp(from.eyes.leftEye.irisSize, to.eyes.leftEye.irisSize),
          irisOffsetX: lerp(from.eyes.leftEye.irisOffsetX, to.eyes.leftEye.irisOffsetX),
          irisOffsetY: lerp(from.eyes.leftEye.irisOffsetY, to.eyes.leftEye.irisOffsetY)
        },
        rightEye: {
          openness: lerp(from.eyes.rightEye.openness, to.eyes.rightEye.openness),
          irisSize: lerp(from.eyes.rightEye.irisSize, to.eyes.rightEye.irisSize),
          irisOffsetX: lerp(from.eyes.rightEye.irisOffsetX, to.eyes.rightEye.irisOffsetX),
          irisOffsetY: lerp(from.eyes.rightEye.irisOffsetY, to.eyes.rightEye.irisOffsetY)
        },
        eyebrows: {
          leftAngle: lerp(from.eyes.eyebrows.leftAngle, to.eyes.eyebrows.leftAngle),
          rightAngle: lerp(from.eyes.eyebrows.rightAngle, to.eyes.eyebrows.rightAngle),
          leftHeight: lerp(from.eyes.eyebrows.leftHeight, to.eyes.eyebrows.leftHeight),
          rightHeight: lerp(from.eyes.eyebrows.rightHeight, to.eyes.eyebrows.rightHeight)
        }
      },
      mouth: {
        shape: t < 0.5 ? from.mouth.shape : to.mouth.shape,
        openness: lerp(from.mouth.openness, to.mouth.openness),
        width: lerp(from.mouth.width, to.mouth.width)
      },
      effects: {
        blush: lerp(from.effects.blush, to.effects.blush),
        sweatDrop: t < 0.5 ? from.effects.sweatDrop : to.effects.sweatDrop,
        sparkles: t < 0.5 ? from.effects.sparkles : to.effects.sparkles,
        angryVein: t < 0.5 ? from.effects.angryVein : to.effects.angryVein
      }
    };
  }
  
  // Map MoodState to expression name for backward compatibility
  moodToExpression(mood: MoodState): string {
    const moodMap: Record<MoodState, string> = {
      'neutral': 'neutral',
      'analytical': 'thinking',
      'energetic': 'excited',
      'pensive': 'thinking',
      'erroneous': 'embarrassed'
    };
    
    return moodMap[mood];
  }
  
  getAllExpressionNames(): string[] {
    return Array.from(this.presets.keys());
  }
}
