import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsEngine } from '../src/PhysicsEngine';

describe('PhysicsEngine', () => {
  let svgContainer: SVGSVGElement;
  let physicsEngine: PhysicsEngine;

  beforeEach(() => {
    svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgContainer.setAttribute('id', 'avatar-svg');
    svgContainer.setAttribute('viewBox', '0 0 400 400');
    
    const avatarRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    avatarRoot.setAttribute('id', 'avatar-root');
    svgContainer.appendChild(avatarRoot);
    
    document.body.appendChild(svgContainer);
  });

  it('should instantiate without errors', () => {
    expect(() => {
      physicsEngine = new PhysicsEngine(svgContainer);
    }).not.toThrow();
  });

  it('should enable drag listeners on avatar-root children', () => {
    physicsEngine = new PhysicsEngine(svgContainer);
    
    const avatarRoot = svgContainer.querySelector('#avatar-root') as SVGGElement;
    const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle1.setAttribute('id', 'test-circle-1');
    circle1.setAttribute('cx', '100');
    circle1.setAttribute('cy', '100');
    circle1.setAttribute('r', '20');
    avatarRoot.appendChild(circle1);
    
    const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle2.setAttribute('id', 'test-circle-2');
    circle2.setAttribute('cx', '200');
    circle2.setAttribute('cy', '200');
    circle2.setAttribute('r', '30');
    avatarRoot.appendChild(circle2);
    
    expect(() => {
      physicsEngine.enable();
    }).not.toThrow();
    
    expect(circle1.style.cursor).toBe('grab');
    expect(circle2.style.cursor).toBe('grab');
  });

  it('should disable drag listeners without errors', () => {
    physicsEngine = new PhysicsEngine(svgContainer);
    
    const avatarRoot = svgContainer.querySelector('#avatar-root') as SVGGElement;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('id', 'test-circle');
    circle.setAttribute('cx', '100');
    circle.setAttribute('cy', '100');
    circle.setAttribute('r', '20');
    avatarRoot.appendChild(circle);
    
    physicsEngine.enable();
    
    expect(() => {
      physicsEngine.disable();
    }).not.toThrow();
    
    expect(circle.style.cursor).toBe('');
  });

  it('should convert screen coordinates to SVG coordinates', () => {
    physicsEngine = new PhysicsEngine(svgContainer);
    
    const mockCTM = {
      a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
      inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
    } as unknown as DOMMatrix;
    
    const mockPoint = {
      x: 0,
      y: 0,
      matrixTransform: (_matrix: DOMMatrix) => ({ x: 100, y: 150 })
    } as unknown as DOMPoint;
    
    Object.defineProperty(svgContainer, 'getScreenCTM', {
      value: () => mockCTM,
      configurable: true
    });
    
    Object.defineProperty(svgContainer, 'createSVGPoint', {
      value: () => mockPoint,
      configurable: true
    });
    
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: 100,
      clientY: 150
    });
    
    const result = physicsEngine['getSVGPoint'](mouseEvent);
    
    expect(result).toEqual({ x: 100, y: 150 });
  });

  it('should handle enable when already enabled', () => {
    physicsEngine = new PhysicsEngine(svgContainer);
    
    const avatarRoot = svgContainer.querySelector('#avatar-root') as SVGGElement;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('id', 'test-circle');
    avatarRoot.appendChild(circle);
    
    physicsEngine.enable();
    
    expect(() => {
      physicsEngine.enable();
    }).not.toThrow();
  });

  it('should handle disable when already disabled', () => {
    physicsEngine = new PhysicsEngine(svgContainer);
    
    expect(() => {
      physicsEngine.disable();
    }).not.toThrow();
  });

  it('should handle missing avatar-root gracefully', () => {
    const emptySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    physicsEngine = new PhysicsEngine(emptySvg);
    
    expect(() => {
      physicsEngine.enable();
    }).not.toThrow();
  });
});
