import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisionMirror } from '../src/VisionMirror';
import { Mirror } from '../src/Mirror';
import { ProviderRegistry } from '../src/llm/ProviderRegistry';
import { OpenAIAdapter } from '../src/llm/OpenAIAdapter';
import type { CharacterSchema } from '../src/types';

describe('VisionMirror', () => {
  let visionMirror: VisionMirror;
  let mirror: Mirror;
  let registry: ProviderRegistry;
  let mockSvgContainer: SVGSVGElement;

  beforeEach(() => {
    mirror = new Mirror();
    registry = new ProviderRegistry();
    visionMirror = new VisionMirror(mirror, registry);

    // Create mock SVG container
    mockSvgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mockSvgContainer.setAttribute('viewBox', '0 0 400 400');
    mockSvgContainer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Add a simple circle element
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '200');
    circle.setAttribute('cy', '200');
    circle.setAttribute('r', '50');
    circle.setAttribute('fill', '#FF0000');
    mockSvgContainer.appendChild(circle);

    vi.clearAllMocks();
  });

  describe('captureScreenshot', () => {
    it('should use default dimensions when viewBox is not available', async () => {
      // Mock URL.createObjectURL which is not available in jsdom
      const mockBlobUrl = 'blob:mock-url';
      global.URL.createObjectURL = vi.fn().mockReturnValue(mockBlobUrl);
      global.URL.revokeObjectURL = vi.fn();

      // Mock Image
      const mockImage = {
        onload: null as ((this: HTMLImageElement, ev: Event) => unknown) | null,
        onerror: null as ((this: HTMLImageElement, ev: ErrorEvent) => unknown) | null,
        src: '',
      };

      // Mock canvas and context
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue({
          drawImage: vi.fn(),
        }),
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockdata'),
      };

      vi.spyOn(global, 'Image').mockImplementation(() => mockImage as unknown as HTMLImageElement);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return document.createElement(tagName);
      });

      // Call captureScreenshot and immediately trigger onload
      const screenshotPromise = visionMirror.captureScreenshot(mockSvgContainer);
      
      // Simulate successful image load
      if (mockImage.onload) {
        mockImage.onload.call(mockImage as unknown as HTMLImageElement, new Event('load'));
      }

      const screenshot = await screenshotPromise;

      expect(screenshot).toContain('data:image/png;base64');
      expect(mockCanvas.width).toBe(400); // Should use default
      expect(mockCanvas.height).toBe(400); // Should use default
    });
  });

  describe('analyzeAvatar', () => {
    beforeEach(() => {
      // Mock captureScreenshot to avoid URL.createObjectURL issues in tests
      visionMirror.captureScreenshot = vi
        .fn()
        .mockResolvedValue('data:image/png;base64,mockdata');
    });

    it('should throw error if provider not found', async () => {
      await expect(
        visionMirror.analyzeAvatar(mockSvgContainer, 'nonexistent')
      ).rejects.toThrow('Provider nonexistent not found');
    });

    it('should throw error if provider does not support vision', async () => {
      const mockAdapter = {
        name: 'test',
        supportsVision: false,
        supportsStreaming: false,
        availableModels: ['test-model'],
        sendMessage: vi.fn(),
        sendMessageStream: vi.fn(),
        sendVisionRequest: vi.fn(),
        estimateCost: vi.fn(),
        validateApiKey: vi.fn(),
      };

      registry.register('test', mockAdapter);

      await expect(visionMirror.analyzeAvatar(mockSvgContainer, 'test')).rejects.toThrow(
        'does not support vision'
      );
    });

    it('should send vision request and parse feedback', async () => {
      const mockResponse = {
        content: 'This is a red circle. Quality: 8/10\n- Suggestion 1\n- Suggestion 2',
        model: 'gpt-4o',
      };

      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendVisionRequest = vi.fn().mockResolvedValue(mockResponse);

      // Mock captureScreenshot
      visionMirror.captureScreenshot = vi
        .fn()
        .mockResolvedValue('data:image/png;base64,mockdata');

      registry.register('openai', mockAdapter);

      const feedback = await visionMirror.analyzeAvatar(mockSvgContainer, 'openai');

      expect(feedback.description).toContain('red circle');
      expect(feedback.qualityScore).toBe(8);
      expect(feedback.suggestions.length).toBeGreaterThan(0);
      expect(visionMirror.captureScreenshot).toHaveBeenCalledWith(mockSvgContainer);
    });

    it('should use custom prompt if provided', async () => {
      const mockResponse = {
        content: 'Custom analysis response',
        model: 'gpt-4o',
      };

      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendVisionRequest = vi.fn().mockResolvedValue(mockResponse);
      visionMirror.captureScreenshot = vi
        .fn()
        .mockResolvedValue('data:image/png;base64,mockdata');

      registry.register('openai', mockAdapter);

      await visionMirror.analyzeAvatar(
        mockSvgContainer,
        'openai',
        'Custom analysis prompt'
      );

      expect(mockAdapter.sendVisionRequest).toHaveBeenCalled();
    });
  });

  describe('parseFeedback', () => {
    it('should extract suggestions from bulleted list', async () => {
      const mockResponse = {
        content: 'Analysis:\n- Improve color contrast\n- Add more elements\n* Better proportions',
        model: 'gpt-4o',
      };

      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendVisionRequest = vi.fn().mockResolvedValue(mockResponse);
      visionMirror.captureScreenshot = vi
        .fn()
        .mockResolvedValue('data:image/png;base64,mockdata');

      registry.register('openai', mockAdapter);

      const feedback = await visionMirror.analyzeAvatar(mockSvgContainer, 'openai');

      expect(feedback.suggestions).toContain('Improve color contrast');
      expect(feedback.suggestions).toContain('Add more elements');
      expect(feedback.suggestions).toContain('Better proportions');
    });

    it('should extract quality score from response', async () => {
      const mockResponse = {
        content: 'Quality score: 7/10',
        model: 'gpt-4o',
      };

      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendVisionRequest = vi.fn().mockResolvedValue(mockResponse);
      visionMirror.captureScreenshot = vi
        .fn()
        .mockResolvedValue('data:image/png;base64,mockdata');

      registry.register('openai', mockAdapter);

      const feedback = await visionMirror.analyzeAvatar(mockSvgContainer, 'openai');

      expect(feedback.qualityScore).toBe(7);
    });
  });

  describe('getComprehensiveFeedback', () => {
    it('should return text description when no provider specified', async () => {
      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: [],
      };

      const feedback = await visionMirror.getComprehensiveFeedback(
        character,
        'neutral',
        mockSvgContainer
      );

      expect(feedback).toContain('Avatar State Report');
      expect(feedback).not.toContain('Vision Analysis');
    });

    it('should include vision analysis when provider specified', async () => {
      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: [],
      };

      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendVisionRequest = vi.fn().mockResolvedValue({
        content: 'Vision analysis result',
        model: 'gpt-4o',
      });
      visionMirror.captureScreenshot = vi
        .fn()
        .mockResolvedValue('data:image/png;base64,mockdata');

      registry.register('openai', mockAdapter);

      const feedback = await visionMirror.getComprehensiveFeedback(
        character,
        'neutral',
        mockSvgContainer,
        'openai'
      );

      expect(feedback).toContain('Avatar State Report');
      expect(feedback).toContain('Vision Analysis');
      expect(feedback).toContain('Vision analysis result');
    });

    it('should handle vision analysis errors gracefully', async () => {
      const character: CharacterSchema = {
        id: 'test-avatar',
        version: '1.0',
        elements: [],
      };

      const mockAdapter = new OpenAIAdapter('test-key');
      mockAdapter.sendVisionRequest = vi.fn().mockRejectedValue(new Error('API error'));
      visionMirror.captureScreenshot = vi
        .fn()
        .mockResolvedValue('data:image/png;base64,mockdata');

      registry.register('openai', mockAdapter);

      const feedback = await visionMirror.getComprehensiveFeedback(
        character,
        'neutral',
        mockSvgContainer,
        'openai'
      );

      expect(feedback).toContain('Avatar State Report');
      expect(feedback).toContain('Vision Analysis Failed');
      expect(feedback).toContain('API error');
    });
  });
});
