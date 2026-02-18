import { animate } from 'animejs';

export class PhysicsEngine {
  private svgContainer: SVGSVGElement;
  private isDragging: boolean = false;
  private dragTarget: SVGGraphicsElement | null = null;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };
  private originalTransform: string = '';
  private _isEnabled: boolean = false;
  
  private boundPointerDown: (event: MouseEvent | TouchEvent) => void;
  private boundPointerMove: (event: MouseEvent | TouchEvent) => void;
  private boundPointerUp: () => void;

  constructor(svgContainer: SVGSVGElement) {
    this.svgContainer = svgContainer;
    
    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  enable(): void {
    if (this._isEnabled) return;
    
    const avatarRoot = this.svgContainer.querySelector('#avatar-root');
    if (!avatarRoot) {
      console.warn('PhysicsEngine: #avatar-root not found');
      return;
    }

    const children = avatarRoot.children;
    for (let i = 0; i < children.length; i++) {
      const element = children[i] as SVGElement;
      element.style.cursor = 'grab';
      element.addEventListener('mousedown', this.boundPointerDown);
      element.addEventListener('touchstart', this.boundPointerDown);
    }

    document.addEventListener('mousemove', this.boundPointerMove);
    document.addEventListener('touchmove', this.boundPointerMove);
    document.addEventListener('mouseup', this.boundPointerUp);
    document.addEventListener('touchend', this.boundPointerUp);
    
    this._isEnabled = true;
  }

  disable(): void {
    if (!this._isEnabled) return;
    
    const avatarRoot = this.svgContainer.querySelector('#avatar-root');
    if (avatarRoot) {
      const children = avatarRoot.children;
      for (let i = 0; i < children.length; i++) {
        const element = children[i] as SVGElement;
        element.style.cursor = '';
        element.removeEventListener('mousedown', this.boundPointerDown);
        element.removeEventListener('touchstart', this.boundPointerDown);
      }
    }

    document.removeEventListener('mousemove', this.boundPointerMove);
    document.removeEventListener('touchmove', this.boundPointerMove);
    document.removeEventListener('mouseup', this.boundPointerUp);
    document.removeEventListener('touchend', this.boundPointerUp);
    
    this._isEnabled = false;
    
    if (this.isDragging) {
      this.onPointerUp();
    }
  }

  private getSVGPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const pt = this.svgContainer.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;

    const ctm = this.svgContainer.getScreenCTM();
    if (!ctm) {
      return { x: clientX, y: clientY };
    }

    const svgPoint = pt.matrixTransform(ctm.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  }

  private onPointerDown(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    
    const target = event.currentTarget as SVGGraphicsElement;
    if (!target) return;

    this.isDragging = true;
    this.dragTarget = target;
    this.originalTransform = target.getAttribute('transform') || '';
    
    const svgPoint = this.getSVGPoint(event);
    
    const bbox = target.getBBox();
    const currentX = bbox.x + bbox.width / 2;
    const currentY = bbox.y + bbox.height / 2;
    
    this.dragOffset = {
      x: svgPoint.x - currentX,
      y: svgPoint.y - currentY
    };
    
    target.style.cursor = 'grabbing';
  }

  private onPointerMove(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !this.dragTarget) return;
    
    event.preventDefault();
    
    const svgPoint = this.getSVGPoint(event);
    
    const bbox = this.dragTarget.getBBox();
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    
    const dx = svgPoint.x - this.dragOffset.x - centerX;
    const dy = svgPoint.y - this.dragOffset.y - centerY;
    
    const baseTransform = this.originalTransform.replace(/translate\([^)]*\)/g, '').trim();
    const newTransform = `translate(${dx}, ${dy}) ${baseTransform}`.trim();
    
    this.dragTarget.setAttribute('transform', newTransform);
  }

  private onPointerUp(): void {
    if (!this.isDragging || !this.dragTarget) return;
    
    const element = this.dragTarget;
    element.style.cursor = 'grab';
    
    this.snapBack(element);
    
    this.isDragging = false;
    this.dragTarget = null;
    this.dragOffset = { x: 0, y: 0 };
  }

  private snapBack(element: SVGGraphicsElement): void {
    const currentTransform = element.getAttribute('transform') || '';
    const translateMatch = currentTransform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
    
    if (!translateMatch) {
      element.setAttribute('transform', this.originalTransform);
      return;
    }
    
    const startX = parseFloat(translateMatch[1]);
    const startY = parseFloat(translateMatch[2]);
    
    const animationTarget = { x: startX, y: startY };
    
    animate(animationTarget, {
      x: 0,
      y: 0,
      duration: 800,
      easing: 'easeOutElastic(1, .6)',
      update: () => {
        const baseTransform = this.originalTransform.replace(/translate\([^)]*\)/g, '').trim();
        const newTransform = `translate(${animationTarget.x}, ${animationTarget.y}) ${baseTransform}`.trim();
        element.setAttribute('transform', newTransform);
      },
      complete: () => {
        element.setAttribute('transform', this.originalTransform);
      }
    });
  }
}
