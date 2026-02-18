import type { CharacterSchema, GeometricElement, CircleElement, PolygonElement } from './types';

export class AvatarParser {
  private container: SVGSVGElement;
  private elementCache: Map<string, SVGElement>;
  private rootGroup: SVGGElement | null = null;

  constructor(container: SVGSVGElement) {
    this.container = container;
    this.elementCache = new Map();
  }

  render(schema: CharacterSchema): void {
    // Clear existing elements
    this.clear();

    // Create a root group for animations
    this.rootGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.rootGroup.setAttribute('id', 'avatar-root');

    // Sort elements by z-index
    const sortedElements = [...schema.elements].sort((a, b) => a['z-index'] - b['z-index']);

    // Render each element
    sortedElements.forEach(element => {
      const svgElement = this.createElement(element);
      if (svgElement) {
        this.rootGroup!.appendChild(svgElement);
        this.elementCache.set(element.id, svgElement);
      }
    });

    // Add root group to container
    this.container.appendChild(this.rootGroup);
  }

  updateElement(elementId: string, element: GeometricElement): void {
    const existingElement = this.elementCache.get(elementId);
    
    if (existingElement && this.rootGroup) {
      // Remove old element from root group
      this.rootGroup.removeChild(existingElement);
    }

    // Create and add new element to root group
    const newElement = this.createElement(element);
    if (newElement && this.rootGroup) {
      this.rootGroup.appendChild(newElement);
      this.elementCache.set(elementId, newElement);
    }
  }

  getElement(elementId: string): SVGElement | undefined {
    return this.elementCache.get(elementId);
  }

  clear(): void {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.elementCache.clear();
    this.rootGroup = null;
  }

  private createElement(element: GeometricElement): SVGElement | null {
    if (element.type === 'circle') {
      return this.createCircle(element as CircleElement);
    } else if (element.type === 'polygon') {
      return this.createPolygon(element as PolygonElement);
    }
    return null;
  }

  private createCircle(element: CircleElement): SVGCircleElement {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    
    circle.setAttribute('id', element.id);
    circle.setAttribute('cx', element.coordinates.cx.toString());
    circle.setAttribute('cy', element.coordinates.cy.toString());
    circle.setAttribute('r', element.coordinates.r.toString());
    
    this.applyStyle(circle, element.style);
    
    return circle;
  }

  private createPolygon(element: PolygonElement): SVGPolygonElement {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    
    polygon.setAttribute('id', element.id);
    
    // Convert points array to SVG points string
    const pointsString = element.coordinates.points
      .map(([x, y]) => `${x},${y}`)
      .join(' ');
    polygon.setAttribute('points', pointsString);
    
    this.applyStyle(polygon, element.style);
    
    return polygon;
  }

  private applyStyle(element: SVGElement, style: { fill: string; stroke: string; opacity: number }): void {
    element.setAttribute('fill', style.fill);
    element.setAttribute('stroke', style.stroke);
    element.setAttribute('opacity', style.opacity.toString());
  }
}
