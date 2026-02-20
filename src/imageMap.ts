export interface ShapeCoords {
  polygons?: string[];
  rects?: [number, number, number, number][];
  ellipses?: [number, number, number, number][];
}

/**
 * Parse coordinates from either data attributes or frontmatter.
 * If the image contains a `data-coordinates` JSON string, it is used.
 * Otherwise, if a `data-map` key is present and matching data exists in
 * frontmatter under `imageMaps`, that data is returned.
 */
export function parseCoordinates(
  img: HTMLElement,
  frontmatter?: any,
): any {
  const json = img.getAttribute('data-coordinates');
  if (json) {
    try {
      console.log('[parseCoordinates] data-coordinates gefunden:', json);
      return JSON.parse(json);
    } catch (e) {
      console.error('[parseCoordinates] 📐 Invalid data-coordinates JSON. Check your syntax or frontmatter.', e);
    }
  }
  const key = img.getAttribute('data-map');
  console.log('[parseCoordinates] data-map:', key);
  if (key && frontmatter && frontmatter.imageMaps && frontmatter.imageMaps[key]) {
    const map = frontmatter.imageMaps[key];
    console.log('[parseCoordinates] imageMaps gefunden:', map);
    // Neues Format: regions
    if (Array.isArray(map.regions)) {
      console.log('[parseCoordinates] regions-Format erkannt:', map.regions);
      return map.regions;
    }
    // Altes Format: polygons, rects, ellipses
    console.log('[parseCoordinates] altes Format erkannt:', map);
    return map;
  }
  console.log('[parseCoordinates] Keine Koordinaten gefunden');
  return null;
}

const NS = 'http://www.w3.org/2000/svg';

/**
 * Create an SVG polygon element from a series of points.
 *
 * @param points - Space separated list of "x,y" coordinate pairs
 * @returns The polygon element
 */
export function createPolygon(points: string): SVGPolygonElement {
  const el = document.createElementNS(NS, 'polygon');
  el.setAttribute('points', points);
  return el;
}

/**
 * Create an SVG rectangle element.
 *
 * @param x - Top-left X coordinate
 * @param y - Top-left Y coordinate
 * @param width - Width of the rectangle
 * @param height - Height of the rectangle
 * @returns The rectangle element
 */
export function createRect(
  x: number,
  y: number,
  width: number,
  height: number,
): SVGRectElement {
  const el = document.createElementNS(NS, 'rect');
  el.setAttribute('x', String(x));
  el.setAttribute('y', String(y));
  el.setAttribute('width', String(width));
  el.setAttribute('height', String(height));
  return el;
}

/**
 * Create an SVG ellipse element.
 *
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param rx - Radius on the X axis
 * @param ry - Radius on the Y axis
 * @returns The ellipse element
 */
export function createEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): SVGEllipseElement {
  const el = document.createElementNS(NS, 'ellipse');
  el.setAttribute('cx', String(cx));
  el.setAttribute('cy', String(cy));
  el.setAttribute('rx', String(rx));
  el.setAttribute('ry', String(ry));
  return el;
}

/**
 * Build an SVG overlay from a set of shape coordinates.
 */
export function shapesToSVG(def: any, img?: HTMLImageElement): SVGSVGElement {
  let width = 100, height = 100;
  if (img) {
    width = img.naturalWidth || img.width;
    height = img.naturalHeight || img.height;
    console.log('[shapesToSVG] Bildgröße:', width, height);
  }
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', `${width}`);
  svg.setAttribute('height', `${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  // Neues Format: regions
  if (Array.isArray(def)) {
    console.log('[shapesToSVG] regions-Array:', def);
    def.forEach((region: any, idx: number) => {
      let el: SVGElement | null = null;
      console.log(`[shapesToSVG] Region #${idx}:`, region);
      if (region.type === 'polygon' && region.points) {
        el = createPolygon(region.points);
      } else if (region.type === 'ellipse') {
        el = createEllipse(region.cx, region.cy, region.rx, region.ry);
      } else if (region.type === 'rectangle') {
        el = createRect(region.x, region.y, region.width, region.height);
      } else if (region.type === 'circle') {
        // circle als ellipse mit gleichen Radien
        el = createEllipse(region.cx, region.cy, region.r, region.r);
      }
      if (el) {
        el.classList.add('image-map-shape');
        // Style anwenden und Standard überschreiben
        if (region.style) {
          console.log(`[shapesToSVG] Style für Region #${idx}:`, region.style);
          // Standardwerte entfernen
          el.removeAttribute('stroke');
          el.removeAttribute('fill');
          let styleStr = '';
          if (region.style.strokeType) {
            styleStr += `stroke-dasharray: ${region.style.strokeType === 'dashed' ? '4,2' : region.style.strokeType === 'dotted' ? '1,2' : 'none'} !important;`;
            el.setAttribute('stroke-dasharray', region.style.strokeType === 'dashed' ? '4,2' : region.style.strokeType === 'dotted' ? '1,2' : '');
          }
          if (region.style.strokeWidth) {
            styleStr += `stroke-width: ${region.style.strokeWidth} !important;`;
            el.setAttribute('stroke-width', String(region.style.strokeWidth));
          }
          if (region.style.strokeColor) {
            styleStr += `stroke: ${region.style.strokeColor} !important;`;
            el.setAttribute('stroke', region.style.strokeColor);
          }
          if (region.style.fillColor) {
            styleStr += `fill: ${region.style.fillColor} !important;`;
            el.setAttribute('fill', region.style.fillColor);
          }
          if (region.style.opacity !== undefined) {
            styleStr += `opacity: ${region.style.opacity} !important;`;
            el.setAttribute('opacity', String(region.style.opacity));
          }
          if (styleStr) {
            el.setAttribute('style', styleStr);
          }
        } else {
          // Standardwerte explizit setzen, falls kein Style
          el.setAttribute('style', 'fill: rgba(0,0,255,0.2) !important; stroke: blue !important; stroke-width: 0.5 !important; opacity: 1 !important;');
          el.setAttribute('fill', 'rgba(0,0,255,0.2)');
          el.setAttribute('stroke', 'blue');
          el.setAttribute('stroke-width', '0.5');
          el.setAttribute('opacity', '1');
        }

        // Text-Option
        if (region.text) {
          const textEl = document.createElementNS(NS, 'text');
          textEl.textContent = region.text.content || '';
          let x = 0, y = 0;
          // Positionierung je nach Form
          if (region.type === 'polygon' && region.points) {
            // Mittelpunkt des Polygons berechnen
            const pts = region.points.split(' ').map(p => p.split(',').map(Number));
            const mx = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
            const my = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
            x = mx;
            y = my;
          } else if (region.type === 'ellipse') {
            x = region.cx;
            y = region.cy;
          } else if (region.type === 'rectangle') {
            x = region.x + region.width / 2;
            y = region.y + region.height / 2;
          } else if (region.type === 'circle') {
            x = region.cx;
            y = region.cy;
          }
          // Offset je nach gewünschter Position
          if (region.text.position === 'top') y -= 10;
          if (region.text.position === 'bottom') y += 20;
          if (region.text.position === 'left') x -= 20;
          if (region.text.position === 'right') x += 20;
          textEl.setAttribute('x', String(x));
          textEl.setAttribute('y', String(y));
          textEl.setAttribute('fill', region.text.color || '#000');
          textEl.setAttribute('font-size', region.text.size ? String(region.text.size) : '14');
          textEl.setAttribute('text-anchor', region.text.position === 'center' ? 'middle' : 'start');
          svg.appendChild(textEl);
        }
        // Link
        if (region.link) {
          console.log(`[shapesToSVG] Link für Region #${idx}:`, region.link);
          el.setAttribute('style', 'cursor:pointer;');
          el.addEventListener('click', (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            // Obsidian-API: Datei öffnen
            if (window.app && window.app.workspace) {
              window.app.workspace.openLinkText(region.link, '', true);
            } else {
              // Fallback: Link in neuem Tab
              window.open(region.link, '_blank');
            }
          });
          svg.appendChild(el);
        } else {
          svg.appendChild(el);
        }
      } else {
        console.log(`[shapesToSVG] Keine SVG-Form für Region #${idx}`);
      }
    });
    return svg;
  }

  // Altes Format
  def.polygons?.forEach((pts: string) => {
    const poly = createPolygon(pts);
    poly.classList.add('image-map-shape');
    svg.appendChild(poly);
  });
  def.rects?.forEach(([x, y, w, h]: [number, number, number, number]) => {
    const rect = createRect(x, y, w, h);
    rect.classList.add('image-map-shape');
    svg.appendChild(rect);
  });
  def.ellipses?.forEach(([cx, cy, rx, ry]: [number, number, number, number]) => {
    const ell = createEllipse(cx, cy, rx, ry);
    ell.classList.add('image-map-shape');
    svg.appendChild(ell);
  });
  return svg;
}

/**
 * Wrap the image in a container and append an SVG overlay.
 */
export function overlayImage(
  img: HTMLImageElement,
  coords?: any,
  externalSvg?: string,
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.classList.add('image-map-container');
  img.parentElement?.insertBefore(wrapper, img);
  wrapper.appendChild(img);

  const overlayEl = document.createElement('div');
  overlayEl.classList.add('image-map-overlay');
  if (externalSvg) overlayEl.innerHTML = externalSvg;
  if (coords) {
    overlayEl.appendChild(shapesToSVG(coords, img));
  }
  wrapper.appendChild(overlayEl);

  return wrapper;
}
