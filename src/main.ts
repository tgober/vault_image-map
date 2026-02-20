/*
 * main.ts — Obsidian plugin entry.
 * Depends on the obsidian API.
 * Overlays SVGs on images.
 * Friendly vibes, PtiCalin style.
 */
import { Plugin } from 'obsidian';
import ImageContextMenu from './contextMenu';
import {
  parseCoordinates,
  overlayImage,
  ShapeCoords,
} from './imageMap';

export default class ImageMapPlugin extends Plugin {
  /**
   * Called when the plugin is loaded.
   * Registers a post processor that overlays SVGs on images with the
   * `data-overlay` attribute.
   *
   * @returns {Promise<void>} Resolves when the post processor is registered.
   */
  async onload() {
    this.registerMarkdownPostProcessor(async (el: HTMLElement, ctx: any) => {
      const images = el.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
      for (const img of Array.from(images)) {
        const overlay = img.getAttribute('data-overlay');
        let externalSvg = '';
        if (overlay) {
          const file = this.app.metadataCache.getFirstLinkpathDest(
            overlay,
            ctx.sourcePath,
          );
          if (file) {
            try {
              externalSvg = await this.app.vault.read(file);
            } catch (err) {
              console.error(
                `🚧 Couldn't load overlay "${overlay}". ` +
                  'Check that the path is correct and the SVG exists in your vault. ' +
                  'Try reloading Obsidian if the problem continues.',
                err,
              );
            }
          }
        }

        console.log('[ImageMapPlugin] Prüfe Bild:', img.src);
        const regionsOrCoords = parseCoordinates(
          img,
          ctx.frontmatter,
        );
        console.log('[ImageMapPlugin] parseCoordinates Ergebnis:', regionsOrCoords);

        if (!externalSvg && !regionsOrCoords) {
          console.log('[ImageMapPlugin] Kein Overlay und keine Koordinaten gefunden, überspringe Bild:', img.src);
          continue;
        }

        // Overlay erst erzeugen, wenn das Bild geladen ist
        const renderOverlay = () => {
          const wrapper = overlayImage(img, regionsOrCoords, externalSvg);
          console.log('[ImageMapPlugin] overlayImage Wrapper:', wrapper);
        };
        if (img.complete && img.naturalWidth && img.naturalHeight) {
          renderOverlay();
        } else {
          img.addEventListener('load', renderOverlay, { once: true });
        }
      }
    });

    // Initialize the image context menu
    new ImageContextMenu(this).init();
  }
}
