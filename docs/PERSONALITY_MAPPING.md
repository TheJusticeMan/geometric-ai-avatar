# Personality Mapping Documentation

This document provides a comprehensive guide to the personality mapping system in the geometric-ai-avatar project. The personality mapping system translates abstract mood states into concrete geometric and animation parameters.

## Table of Contents

- [Overview](#overview)
- [Mood States](#mood-states)
- [Geometric Modifiers](#geometric-modifiers)
- [Animation Behaviors](#animation-behaviors)
- [Animation Parameters](#animation-parameters)
- [Custom Mood Guide](#custom-mood-guide)

---

## Overview

The `PersonalityMapper` class serves as the central translation layer between emotional states and visual representation. It maps each mood state to:

1. **Geometric Modifiers**: Visual characteristics like eye size, color brightness, and shape asymmetry
2. **Animation Parameters**: Timing, easing, and behavior properties
3. **Animation Behaviors**: Specific movement patterns

---

## Mood States

The system supports five distinct mood states, each representing a different emotional or cognitive state:

### 1. Neutral

**Description**: The default, balanced state representing calm and stable emotions.

**Visual Characteristics**:
- Standard eye size (1.0x multiplier)
- Normal color brightness (1.0x)
- No asymmetry or jitter
- Balanced, centered appearance

**Use Cases**: Default state, idle conversation, neutral responses

**Animation Style**: Gentle floating and breathing animations that create a calm, living presence

---

### 2. Analytical

**Description**: Represents focused thinking, processing, or problem-solving states.

**Visual Characteristics**:
- Narrowed eyes (0.7x multiplier) - suggests concentration
- Normal color brightness (1.0x)
- No asymmetry or jitter
- Thoughtful, focused appearance

**Use Cases**: Processing complex queries, analyzing data, deep thinking

**Animation Style**: Slow, 360-degree rotation of the torso suggesting contemplation and examination from all angles

---

### 3. Energetic

**Description**: High-energy state representing excitement, enthusiasm, or active engagement.

**Visual Characteristics**:
- Wide eyes (1.3x multiplier) - suggests alertness and excitement
- Brighter colors (1.2x brightness) - vibrant and lively
- No asymmetry or jitter
- Dynamic, alert appearance

**Use Cases**: Exciting discoveries, positive interactions, high engagement moments

**Animation Style**: High-frequency pulse of secondary shapes creating a vibrant, energetic presence

---

### 4. Pensive

**Description**: Reflective, contemplative state with a hint of uncertainty or deep thought.

**Visual Characteristics**:
- Standard eye size (1.0x multiplier by default)
- Slight asymmetry in points (5px factor) - suggests thoughtful uncertainty
- Slightly dimmed colors (0.9x brightness) - subdued appearance
- Contemplative, asymmetric appearance

**Use Cases**: Considering complex topics, reflective responses, uncertain states

**Animation Style**: Slow easeInOutSine tilt of the head circle suggesting ponderous thought

---

### 5. Erroneous

**Description**: Error or problematic state indicating issues, confusion, or system errors.

**Visual Characteristics**:
- Standard eye size (1.0x multiplier by default)
- Position jitter (3px amount) - unstable appearance
- Desaturated colors (0.7x brightness) - muted, concerning
- Unstable, glitchy appearance

**Use Cases**: Error states, system failures, confusion, problematic responses

**Animation Style**: Rapid, non-easing position resets creating a jittery, unstable effect

---

## Geometric Modifiers

The following table shows the exact multiplier and factor values for each mood state:

| Mood State   | eyeRadiusMultiplier | colorBrightness | asymmetryFactor | jitterAmount |
|--------------|--------------------:|----------------:|----------------:|-------------:|
| neutral      | 1.0                 | 1.0             | -               | -            |
| analytical   | 0.7                 | 1.0             | -               | -            |
| energetic    | 1.3                 | 1.2             | -               | -            |
| pensive      | -                   | 0.9             | 5               | -            |
| erroneous    | -                   | 0.7             | -               | 3            |

**Notes**:
- `-` indicates the modifier is not used for that mood state
- `eyeRadiusMultiplier`: Controls the size of the eye circles (relative to base size)
- `colorBrightness`: Multiplier for color brightness/saturation
- `asymmetryFactor`: Amount of asymmetry in shape points (in pixels)
- `jitterAmount`: Amount of random position jitter (in pixels)

---

## Animation Behaviors

Each mood state has a distinct animation preset that defines its movement pattern:

### Neutral
**Preset**: `float + breathe`

Combined gentle floating and breathing animations create a calm, living presence. The avatar subtly moves and scales to simulate natural breathing.

---

### Analytical
**Preset**: `ponder`

Slow, deliberate 360-degree rotation of the torso. Suggests the avatar is examining something from all angles, deep in thought and analysis.

---

### Energetic
**Preset**: `pulse`

Rapid pulsing of secondary shapes creates a vibrant, dynamic presence. High-frequency oscillations convey excitement and high energy.

---

### Pensive
**Preset**: `tilt`

Slow, smooth tilting of the head circle. The back-and-forth motion suggests contemplation and careful consideration.

---

### Erroneous
**Preset**: `jitter`

Rapid, linear position resets create an unstable, glitchy appearance. The harsh, non-eased movements indicate something is wrong.

---

## Animation Parameters

Detailed animation parameters for each mood state:

### Neutral
- **Duration**: 2000ms (2 seconds)
- **Easing**: `easeInOutSine` - Smooth, natural acceleration/deceleration
- **Loop**: `true` - Continuous animation
- **Direction**: `alternate` - Reverses direction each cycle

**Character**: Slow, smooth, calming oscillations

---

### Analytical
- **Duration**: 8000ms (8 seconds)
- **Easing**: `linear` - Constant rotation speed
- **Loop**: `true` - Continuous animation
- **Direction**: `normal` - One-directional rotation

**Character**: Slow, steady rotation suggesting thorough examination

---

### Energetic
- **Duration**: 500ms (0.5 seconds)
- **Easing**: `easeInOutQuad` - Quick but smooth transitions
- **Loop**: `true` - Continuous animation
- **Direction**: `alternate` - Reverses direction each cycle

**Character**: Fast, vibrant pulsing with smooth acceleration

---

### Pensive
- **Duration**: 3000ms (3 seconds)
- **Easing**: `easeInOutSine` - Very smooth, contemplative motion
- **Loop**: `true` - Continuous animation
- **Direction**: `alternate` - Reverses direction each cycle

**Character**: Slow, thoughtful back-and-forth tilting

---

### Erroneous
- **Duration**: 200ms (0.2 seconds)
- **Easing**: `linear` - Harsh, mechanical movement
- **Loop**: `true` - Continuous animation
- **Direction**: `normal` - Repetitive jittering

**Character**: Rapid, jarring movements indicating malfunction

---

## Custom Mood Guide

Want to add a new mood state to the avatar system? Follow these steps:

### Step 1: Update the MoodState Type

Edit `src/types.ts` to add your new mood to the `MoodState` union type:

```typescript
export type MoodState = 
  | 'neutral' 
  | 'analytical' 
  | 'energetic' 
  | 'pensive' 
  | 'erroneous'
  | 'yourNewMood';  // Add your new mood here
```

---

### Step 2: Add to PersonalityMapper

Edit `src/PersonalityMapper.ts` and add cases for your new mood in all three methods:

#### A. Define Geometric Modifiers

In `getGeometricModifiers()`, add a new case:

```typescript
case 'yourNewMood':
  return {
    eyeRadiusMultiplier: 1.1,      // Optional: eye size
    colorBrightness: 1.0,           // Optional: brightness
    asymmetryFactor: 2,             // Optional: asymmetry
    jitterAmount: 1                 // Optional: jitter
  };
```

**Tips**:
- `eyeRadiusMultiplier`: 0.5-1.5 range works well
- `colorBrightness`: 0.5-1.5 for visible changes
- `asymmetryFactor`: 0-10 for subtle to noticeable asymmetry
- `jitterAmount`: 0-5 for subtle to chaotic movement

#### B. Define Animation Parameters

In `getAnimationParams()`, add timing and easing:

```typescript
case 'yourNewMood':
  return {
    duration: 1500,              // Time in milliseconds
    easing: 'easeInOutQuad',     // Easing function
    loop: true,                  // Continuous or one-shot
    direction: 'alternate'       // normal or alternate
  };
```

**Available Easing Functions**:
- `linear`: Constant speed
- `easeInOutSine`: Very smooth, natural
- `easeInOutQuad`: Moderately smooth
- `easeInOutCubic`: Strong acceleration/deceleration

#### C. Define Animation Behavior

In `getAnimationBehavior()`, describe the animation:

```typescript
case 'yourNewMood':
  return 'Your animation description here';
```

---

### Step 3: Create Animation Preset

Edit the animation system to implement the actual animation behavior for your new mood. This typically involves:

1. Defining which shapes animate
2. What transformations occur (rotate, scale, translate)
3. How the animation parameters are applied

---

### Step 4: Update UI

Add your new mood to any UI controls (buttons, dropdowns, etc.) that allow mood selection:

```typescript
const moods: MoodState[] = [
  'neutral',
  'analytical',
  'energetic',
  'pensive',
  'erroneous',
  'yourNewMood'  // Add to UI options
];
```

---

### Step 5: Document Your Mood

Add a section to this document describing:
- The emotional/cognitive state it represents
- Visual characteristics
- Appropriate use cases
- Animation style

---

## Best Practices

1. **Keep it Distinct**: Each mood should have a clearly different visual and animation signature
2. **Test Combinations**: Ensure geometric modifiers work well together
3. **Consider Context**: Think about when the mood would be triggered in actual use
4. **Smooth Transitions**: Test transitions between moods for jarring changes
5. **Performance**: Be mindful of animation duration and complexity

---

## Technical Notes

- All geometric modifiers are optional; only specify what you need to change from the base geometry
- Animation parameters use milliseconds for duration
- Easing functions affect the perceived "character" of the animation significantly
- The `alternate` direction creates smoother looping for most animations
- Color brightness multipliers are applied to HSL lightness values

---

*Last Updated: 2024*
*For implementation details, see `src/PersonalityMapper.ts`*
