import type { 
  CharacterSchema, 
  GeometricElement, 
  CircleElement, 
  PolygonElement,
  AnyCharacterSchema,
  AnimeCharacterSchema,
  AnimeElement,
  PathElement,
  GradientDefinition,
  FilterDefinition
} from './types';
import { isAnimeCharacter as checkIsAnimeCharacter } from './types';

export class AvatarParser {
  private container: SVGSVGElement;
  private elementCache: Map<string, SVGElement>;
  private rootGroup: SVGGElement | null = null;
  private defsElement: SVGDefsElement | null = null;

  constructor(container: SVGSVGElement) {
    this.container = container;
    this.elementCache = new Map();
  }

  render(schema: AnyCharacterSchema): void {
    // Auto-detect schema version and dispatch to appropriate renderer
    if (checkIsAnimeCharacter(schema)) {
      this.renderAnimeCharacter(schema);
    } else {
      this.renderV1Character(schema);
    }
  }

  renderV1Character(schema: CharacterSchema): void {
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

  // === PHASE 5: Anime Character Rendering ===

  renderAnimeCharacter(schema: AnimeCharacterSchema): void {
    // Clear existing elements
    this.clear();

    // Create defs section for gradients and filters
    this.defsElement = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    this.container.appendChild(this.defsElement);

    // Add gradients
    if (schema.gradients) {
      schema.gradients.forEach(gradient => {
        const gradientElement = this.createGradient(gradient);
        if (gradientElement) {
          this.defsElement!.appendChild(gradientElement);
        }
      });
    }

    // Add filters
    if (schema.filters) {
      schema.filters.forEach(filter => {
        const filterElement = this.createFilter(filter);
        if (filterElement) {
          this.defsElement!.appendChild(filterElement);
        }
      });
    }

    // Create root group
    this.rootGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.rootGroup.setAttribute('id', 'avatar-root');

    // Render layers in order (back to front)
    const allElements: { element: AnimeElement; layerOrder: number }[] = [];
    
    // Back hair (layer 0)
    schema.layers.hair.back.forEach(el => allElements.push({ element: el, layerOrder: 0 }));
    
    // Base layer (layer 1)
    schema.layers.base.forEach(el => allElements.push({ element: el, layerOrder: 1 }));
    
    // Clothing layer (layer 2)
    schema.layers.clothing.forEach(el => allElements.push({ element: el, layerOrder: 2 }));
    
    // Face layer (layer 3)
    schema.layers.face.forEach(el => allElements.push({ element: el, layerOrder: 3 }));
    
    // Front hair (layer 4)
    schema.layers.hair.front.forEach(el => allElements.push({ element: el, layerOrder: 4 }));
    
    // Effects layer (layer 5)
    schema.layers.effects.forEach(el => allElements.push({ element: el, layerOrder: 5 }));

    // Sort by layer order, then by z-index within each layer
    allElements.sort((a, b) => {
      if (a.layerOrder !== b.layerOrder) {
        return a.layerOrder - b.layerOrder;
      }
      return a.element['z-index'] - b.element['z-index'];
    });

    // Create and append all elements
    allElements.forEach(({ element }) => {
      const svgElement = this.createAnimeElement(element);
      if (svgElement) {
        this.rootGroup!.appendChild(svgElement);
        this.elementCache.set(element.id, svgElement);
      }
    });

    // Add root group to container
    this.container.appendChild(this.rootGroup);
  }

  private createAnimeElement(element: AnimeElement): SVGElement | null {
    if (element.type === 'circle') {
      return this.createCircle(element as CircleElement);
    } else if (element.type === 'polygon') {
      return this.createPolygon(element as PolygonElement);
    } else if (element.type === 'path') {
      return this.createPath(element as PathElement);
    }
    return null;
  }

  private createPath(element: PathElement): SVGPathElement {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    path.setAttribute('id', element.id);
    path.setAttribute('d', element.coordinates.d);
    
    // Apply standard style
    path.setAttribute('fill', element.style.fill);
    path.setAttribute('stroke', element.style.stroke);
    path.setAttribute('opacity', element.style.opacity.toString());
    
    // Apply extended style properties
    if (element.style.strokeWidth !== undefined) {
      path.setAttribute('stroke-width', element.style.strokeWidth.toString());
    }
    if (element.style.strokeLinecap) {
      path.setAttribute('stroke-linecap', element.style.strokeLinecap);
    }
    if (element.style.strokeLinejoin) {
      path.setAttribute('stroke-linejoin', element.style.strokeLinejoin);
    }
    if (element.style.filter) {
      path.setAttribute('filter', element.style.filter);
    }
    if (element.style.clipPath) {
      path.setAttribute('clip-path', element.style.clipPath);
    }
    
    // Apply transform if present
    if (element.transform) {
      path.setAttribute('transform', element.transform);
    }
    
    return path;
  }

  private createGradient(gradient: GradientDefinition): SVGElement | null {
    let gradientElement: SVGLinearGradientElement | SVGRadialGradientElement;
    
    if (gradient.type === 'linear') {
      gradientElement = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradientElement.setAttribute('id', gradient.id);
      gradientElement.setAttribute('x1', gradient.x1 || '0%');
      gradientElement.setAttribute('y1', gradient.y1 || '0%');
      gradientElement.setAttribute('x2', gradient.x2 || '100%');
      gradientElement.setAttribute('y2', gradient.y2 || '0%');
    } else if (gradient.type === 'radial') {
      gradientElement = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
      gradientElement.setAttribute('id', gradient.id);
      gradientElement.setAttribute('cx', gradient.cx || '50%');
      gradientElement.setAttribute('cy', gradient.cy || '50%');
      gradientElement.setAttribute('r', gradient.r || '50%');
    } else {
      return null;
    }
    
    // Add gradient stops
    gradient.stops.forEach(stop => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopElement.setAttribute('offset', stop.offset);
      stopElement.setAttribute('stop-color', stop.color);
      if (stop.opacity !== undefined) {
        stopElement.setAttribute('stop-opacity', stop.opacity.toString());
      }
      gradientElement.appendChild(stopElement);
    });
    
    return gradientElement;
  }

  private createFilter(filter: FilterDefinition): SVGFilterElement | null {
    const filterElement = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filterElement.setAttribute('id', filter.id);
    
    if (filter.type === 'blur') {
      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      blur.setAttribute('stdDeviation', filter.params.stdDeviation?.toString() || '2');
      filterElement.appendChild(blur);
    } else if (filter.type === 'shadow') {
      // Drop shadow filter
      const offset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
      offset.setAttribute('dx', filter.params.dx?.toString() || '2');
      offset.setAttribute('dy', filter.params.dy?.toString() || '2');
      filterElement.appendChild(offset);
      
      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      blur.setAttribute('stdDeviation', filter.params.stdDeviation?.toString() || '2');
      filterElement.appendChild(blur);
      
      const flood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
      flood.setAttribute('flood-color', filter.params.floodColor?.toString() || '#000000');
      flood.setAttribute('flood-opacity', filter.params.floodOpacity?.toString() || '0.5');
      filterElement.appendChild(flood);
      
      const composite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
      composite.setAttribute('in2', 'SourceAlpha');
      composite.setAttribute('operator', 'in');
      filterElement.appendChild(composite);
      
      const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
      const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      mergeNode2.setAttribute('in', 'SourceGraphic');
      merge.appendChild(mergeNode1);
      merge.appendChild(mergeNode2);
      filterElement.appendChild(merge);
    } else if (filter.type === 'glow') {
      const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      blur.setAttribute('stdDeviation', filter.params.stdDeviation?.toString() || '2');
      blur.setAttribute('result', 'coloredBlur');
      filterElement.appendChild(blur);
      
      const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
      const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      mergeNode1.setAttribute('in', 'coloredBlur');
      const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
      mergeNode2.setAttribute('in', 'SourceGraphic');
      merge.appendChild(mergeNode1);
      merge.appendChild(mergeNode2);
      filterElement.appendChild(merge);
    }
    
    return filterElement;
  }
}
