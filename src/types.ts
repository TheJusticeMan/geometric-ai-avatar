// Core type definitions for the Geometric AI Avatar system

export interface CircleCoordinates {
  cx: number;
  cy: number;
  r: number;
}

export interface PolygonCoordinates {
  points: [number, number][];
}

export interface ElementStyle {
  fill: string;
  stroke: string;
  opacity: number;
}

export interface CircleElement {
  type: 'circle';
  id: string;
  'z-index': number;
  coordinates: CircleCoordinates;
  style: ElementStyle;
}

export interface PolygonElement {
  type: 'polygon';
  id: string;
  'z-index': number;
  coordinates: PolygonCoordinates;
  style: ElementStyle;
}

export type GeometricElement = CircleElement | PolygonElement;

export interface CharacterSchema {
  id: string;
  version: string;
  elements: GeometricElement[];
}

export interface TimelineKeyframe {
  offset: string;
  value: string | number;
}

export interface AnimationSchema {
  targetId: string;
  property: 'points' | 'radius' | 'transform' | 'color';
  timeline: TimelineKeyframe[];
  easing: string;
  loop: boolean;
}

export type MoodState = 'neutral' | 'analytical' | 'energetic' | 'pensive' | 'erroneous';

export interface AvatarState {
  activeCharacter: CharacterSchema | null;
  currentMood: MoodState;
}

export interface GeometricModifiers {
  eyeRadiusMultiplier?: number;
  colorBrightness?: number;
  asymmetryFactor?: number;
  jitterAmount?: number;
}

export interface AnimationParams {
  duration: number;
  easing: string;
  loop: boolean;
  direction?: 'normal' | 'reverse' | 'alternate';
}

export type AnimationTrigger = 'onLoad' | 'onMessageReceived' | 'isProcessing' | 'onMoodChange';

export interface StateChangeListener {
  (state: AvatarState): void;
}

export interface SessionData {
  character: CharacterSchema;
  mood: MoodState;
  timestamp: number;
}

// === PHASE 5: Anime Character Types ===

export interface PathCoordinates {
  d: string; // SVG path data string
}

export interface PathElement {
  type: 'path';
  id: string;
  'z-index': number;
  coordinates: PathCoordinates;
  style: ElementStyle & {
    strokeWidth?: number;
    strokeLinecap?: 'butt' | 'round' | 'square';
    strokeLinejoin?: 'miter' | 'round' | 'bevel';
    filter?: string; // reference to SVG filter ID
    clipPath?: string; // reference to SVG clipPath ID
  };
  transform?: string; // SVG transform string
}

export interface GradientStop {
  offset: string; // "0%", "50%", "100%"
  color: string;
  opacity?: number;
}

export interface GradientDefinition {
  id: string;
  type: 'linear' | 'radial';
  stops: GradientStop[];
  // Linear gradient specifics
  x1?: string; y1?: string; x2?: string; y2?: string;
  // Radial gradient specifics
  cx?: string; cy?: string; r?: string;
}

export interface FilterDefinition {
  id: string;
  type: 'blur' | 'shadow' | 'glow';
  params: Record<string, string | number>;
}

export interface ClipPathDefinition {
  id: string;
  shape: GeometricElement | PathElement;
}

// Extended element type for anime characters
export type AnimeElement = GeometricElement | PathElement;

// Facial expression configuration
export interface ExpressionConfig {
  eyes: {
    leftEye: { openness: number; irisSize: number; irisOffsetX: number; irisOffsetY: number; };
    rightEye: { openness: number; irisSize: number; irisOffsetX: number; irisOffsetY: number; };
    eyebrows: { leftAngle: number; rightAngle: number; leftHeight: number; rightHeight: number; };
  };
  mouth: {
    shape: 'neutral' | 'smile' | 'frown' | 'open' | 'smirk' | 'pout' | 'surprised';
    openness: number; // 0-1
    width: number; // multiplier
  };
  effects: {
    blush: number; // 0-1 intensity
    sweatDrop: boolean;
    sparkles: boolean;
    angryVein: boolean;
  };
}

export interface ExpressionPreset {
  name: string;
  config: ExpressionConfig;
}

// Layered anime character schema (v2.0)
export interface AnimeCharacterSchema {
  id: string;
  version: '2.0';
  style: AnimeStyle;
  layers: {
    base: AnimeElement[];
    face: AnimeElement[];
    hair: {
      front: AnimeElement[];
      back: AnimeElement[];
    };
    clothing: AnimeElement[];
    effects: AnimeElement[];
  };
  expressions: {
    current: string;
    presets: Record<string, ExpressionConfig>;
  };
  gradients?: GradientDefinition[];
  filters?: FilterDefinition[];
  clipPaths?: ClipPathDefinition[];
}

export type AnimeStyle = 'chibi' | 'standard' | 'shounen' | 'shoujo' | 'pixel';

// Union type: system supports BOTH schema versions
export type AnyCharacterSchema = CharacterSchema | AnimeCharacterSchema;

// Type guard
export function isAnimeCharacter(schema: AnyCharacterSchema): schema is AnimeCharacterSchema {
  return schema.version === '2.0';
}
