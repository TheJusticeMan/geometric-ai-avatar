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
