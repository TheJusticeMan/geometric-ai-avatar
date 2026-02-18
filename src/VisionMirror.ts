// Vision Mirror - Screenshot capture and multimodal LLM analysis
import type { CharacterSchema, AnyCharacterSchema, MoodState } from './types';
import { Mirror } from './Mirror';
import type { ProviderRegistry } from './llm/ProviderRegistry';
import type { LLMMessage } from './llm/LLMProviderAdapter';
import { SchemaValidator } from './SchemaValidator';

export interface VisionFeedback {
  description: string;
  suggestions: string[];
  qualityScore?: number; // 1-10
  rawResponse: string;
}

export interface RefinementOptions {
  maxIterations: number;
  targetQuality?: number; // stop when quality >= this
  refinementPrompt?: string;
  model?: string;
}

export interface RefinementResult {
  finalCharacter: AnyCharacterSchema;
  iterations: Array<{
    screenshot: string; // base64 data URL
    feedback: VisionFeedback;
    characterAfter: AnyCharacterSchema;
  }>;
  converged: boolean;
}

export class VisionMirror {
  private mirror: Mirror;
  private registry: ProviderRegistry;
  private validator: SchemaValidator;

  constructor(mirror: Mirror, registry: ProviderRegistry) {
    this.mirror = mirror;
    this.registry = registry;
    this.validator = new SchemaValidator();
  }

  /**
   * Capture SVG as PNG base64 data URL
   */
  async captureScreenshot(svgContainer: SVGSVGElement): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Serialize SVG to string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgContainer);

        // Create blob and object URL
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // Create image element
        const img = new Image();
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = svgContainer.viewBox?.baseVal?.width || 400;
          canvas.height = svgContainer.viewBox?.baseVal?.height || 400;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Draw image to canvas
          ctx.drawImage(img, 0, 0);

          // Convert to PNG data URL
          const dataUrl = canvas.toDataURL('image/png');

          // Clean up
          URL.revokeObjectURL(url);

          resolve(dataUrl);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG as image'));
        };

        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send screenshot to a vision-capable LLM and get feedback
   */
  async analyzeAvatar(
    svgContainer: SVGSVGElement,
    providerName: string,
    prompt?: string
  ): Promise<VisionFeedback> {
    // 1. Capture screenshot
    const screenshot = await this.captureScreenshot(svgContainer);

    // 2. Get provider from registry
    const provider = this.registry.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found in registry`);
    }

    // 3. Check supportsVision
    if (!provider.supportsVision) {
      throw new Error(`Provider ${providerName} does not support vision requests`);
    }

    // 4. Build messages with image content
    const userPrompt =
      prompt ||
      `Analyze this geometric avatar image. Describe what you see and suggest improvements to make it more visually appealing and expressive. Rate the quality from 1-10.`;

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content:
          'You are an expert in visual design and geometric art. Analyze avatar images and provide constructive feedback.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: screenshot, detail: 'high' } },
        ],
      },
    ];

    // 5. Send vision request
    const response = await provider.sendVisionRequest(messages, {
      model: provider.availableModels[0], // Use first available model
      temperature: 0.7,
    });

    // 6. Parse response into VisionFeedback
    return this.parseFeedback(response.content);
  }

  /**
   * Parse LLM response into structured feedback
   */
  private parseFeedback(content: string): VisionFeedback {
    const suggestions: string[] = [];

    // Try to extract suggestions from bulleted or numbered lists
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+\.\s/)) {
        suggestions.push(trimmed.replace(/^[-*•]\s/, '').replace(/^\d+\.\s/, ''));
      }
    }

    // Try to extract quality score
    let qualityScore: number | undefined;
    const scoreMatch = content.match(/(?:quality|score|rating).*?(\d+)(?:\/10)?/i);
    if (scoreMatch) {
      qualityScore = parseInt(scoreMatch[1], 10);
      if (qualityScore > 10) qualityScore = 10;
      if (qualityScore < 1) qualityScore = 1;
    }

    return {
      description: content,
      suggestions,
      qualityScore,
      rawResponse: content,
    };
  }

  /**
   * Run automated refinement loop
   */
  async runRefinementLoop(
    svgContainer: SVGSVGElement,
    character: AnyCharacterSchema,
    providerName: string,
    options: RefinementOptions
  ): Promise<RefinementResult> {
    const iterations: RefinementResult['iterations'] = [];
    let currentCharacter = character;
    let converged = false;

    const provider = this.registry.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found in registry`);
    }

    if (!provider.supportsVision) {
      throw new Error(`Provider ${providerName} does not support vision requests`);
    }

    for (let i = 0; i < options.maxIterations; i++) {
      // Capture current state
      const screenshot = await this.captureScreenshot(svgContainer);

      // Build refinement prompt
      const refinementPrompt =
        options.refinementPrompt ||
        `Analyze this geometric avatar and suggest a modified version that improves its visual appeal. Return ONLY a valid JSON character schema in a markdown code fence. Keep the same structure but enhance colors, proportions, or element positions.`;

      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: `You are an expert avatar designer. When asked to refine an avatar, return ONLY valid JSON in this format:
\`\`\`json
{
  "id": "avatar-id",
  "version": "1.0",
  "elements": [...]
}
\`\`\`

Current avatar JSON:
${JSON.stringify(currentCharacter, null, 2)}`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: refinementPrompt },
            { type: 'image_url', image_url: { url: screenshot, detail: 'high' } },
          ],
        },
      ];

      // Get LLM response
      const response = await provider.sendVisionRequest(messages, {
        model: options.model || provider.availableModels[0],
        temperature: 0.7,
      });

      // Parse feedback
      const feedback = this.parseFeedback(response.content);

      // Try to extract JSON from response
      const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsedJSON = JSON.parse(jsonMatch[1].trim());
          const validation = this.validator.validateCharacterSchema(parsedJSON);

          if (validation.valid) {
            currentCharacter = parsedJSON as CharacterSchema;
          }
        } catch {
          // Failed to parse or validate, keep current character
        }
      }

      iterations.push({
        screenshot,
        feedback,
        characterAfter: currentCharacter,
      });

      // Check convergence
      if (options.targetQuality && feedback.qualityScore && feedback.qualityScore >= options.targetQuality) {
        converged = true;
        break;
      }
    }

    return {
      finalCharacter: currentCharacter,
      iterations,
      converged,
    };
  }

  /**
   * Get text description + visual analysis combined
   */
  async getComprehensiveFeedback(
    character: AnyCharacterSchema,
    mood: MoodState,
    svgContainer: SVGSVGElement,
    providerName?: string
  ): Promise<string> {
    // Get text description from Mirror
    const textDescription = this.mirror.describeCurrentState(character, mood, svgContainer);

    // If provider specified, also get vision analysis
    if (providerName) {
      try {
        const visionFeedback = await this.analyzeAvatar(svgContainer, providerName);
        return `${textDescription}\n\n=== Vision Analysis ===\n${visionFeedback.description}`;
      } catch (error) {
        return `${textDescription}\n\n=== Vision Analysis Failed ===\n${error instanceof Error ? error.message : String(error)}`;
      }
    }

    return textDescription;
  }
}
