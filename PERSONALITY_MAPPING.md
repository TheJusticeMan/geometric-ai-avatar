# Personality to Geometry Mapping

This document provides the LLM with a heuristic for how to update its appearance based on the conversational context.

| Emotional State | Geometric Trigger                    | Animation Behavior                            |
| :-------------- | :----------------------------------- | :-------------------------------------------- |
| **Analytical**  | Narrow eye `r`, simplify polygons    | Slow, 360-degree rotation of the torso.       |
| **Energetic**   | Increase eye `r`, brighten `fill`    | High-frequency "pulse" of secondary shapes.   |
| **Pensive**     | Shift `points` to asymmetry          | Slow `easeInOutSine` tilt of the head circle. |
| **Erroneous**   | Jitter coordinates, desaturate color | Rapid, non-easing position resets.            |

## Generative Guidelines

- **Sharpness**: Use more vertices (hexagons/octagons) for "precise" or "hostile" modes.
- **Softness**: Use circles and low-vertex triangles for "supportive" or "learning" modes.
