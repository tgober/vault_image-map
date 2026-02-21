
# Obsidian Image Map Plugin – Nutzung

## Funktionen
Das Plugin ermöglicht das Überlagern von Bildern mit SVG-Overlays und das Definieren von Formen (Polygone, Rechtecke, Ellipsen) als Image Map.

### SVG-Overlay
Füge ein Bild mit dem Attribut `data-overlay` ein, das auf eine SVG-Datei verweist:
```markdown
<img src="bild.png" data-overlay="overlay.svg" />
```
Das Overlay wird über das Bild gelegt. Im SVG kannst du `<a xlink:href="Zielnote.md">...</a>` verwenden, um einen klickbaren Bereich zu erzeugen.


### Image Map mit Regions
Du kannst im YAML-Frontmatter eine Liste von Regionen definieren, die jeweils Typ, Koordinaten, optionalen Style und Link enthalten:
```yaml
---
imageMaps:
  mein-bild:
    regions:
      - type: polygon
        points: "10,10 90,10 50,90"
        style:
          strokeType: dashed
          strokeWidth: 2
          strokeColor: "#ff0000"
          fillColor: "#ffeeee"
          opacity: 0.7
        link: Zielnote.md
        text:
          content: "Neverwinter"
          position: top
          color: "#ff0000"
          size: 16
      - type: ellipse
        cx: 50
        cy: 50
        rx: 20
        ry: 10
        style:
          strokeType: solid
          strokeWidth: 1
          strokeColor: "#0000ff"
          opacity: 0.5
        text:
          content: "Stadtzentrum"
          position: center
          color: "#0000ff"
          size: 14
        # kein link, nur Style
      - type: rectangle
        x: 20
        y: 20
        width: 40
        height: 30
        style:
          opacity: 0.3
        text:
          content: "Marktplatz"
          position: right
          color: "#00aa00"
          size: 12
        # keine Style- oder Link-Angaben
---
```
```markdown
<img src="bild.png" data-map="mein-bild" />
```

**Hinweis:** Die Koordinaten beziehen sich auf die tatsächliche Größe des Bildes. Das SVG-Overlay wird automatisch passend zur Bildbreite und -höhe erzeugt, sodass die Regionen exakt über dem Bild liegen.

Jede Region kann folgende Felder enthalten:
- **type**: polygon, ellipse, rectangle, circle
- **Koordinaten**: je nach Typ (z.B. points für polygon, cx/cy/rx/ry für ellipse)
- **style** (optional):
  - strokeType: solid/dashed/dotted
  - strokeWidth: Zahl (Pixel)
  - strokeColor: Hexfarbe
  - fillColor: Hexfarbe
  - opacity: Zahl (0–1, Transparenz)
- **text** (optional):
  - content: Textinhalt
  - position: top, bottom, left, right, center
  - color: Hexfarbe
  - size: Schriftgröße (px)
- **link** (optional): Ziel-Datei oder URL

Das Plugin rendert die Regionen als SVG-Formen direkt über dem Bild. Links und Styles werden automatisch angewendet.

### Image Map Editor
- Rechtsklick auf ein Bild in der Vorschau und "Edit Image Map" wählen.
- Mit dem Editor Formen zeichnen und speichern.
- Die Koordinaten werden als `.map.json` neben dem Bild gespeichert.
- Nach dem Speichern die Notiz neu laden, um das Overlay zu sehen.

## Einschränkungen
- Es ist nicht möglich, mehreren Polygonen im Frontmatter jeweils einen eigenen Link zuzuordnen.
- Links zu anderen Dateien funktionieren nur über externe SVG-Dateien mit `<a xlink:href="...">`.

## Konfiguration
- `data-overlay`: Pfad zu einer externen SVG-Datei.
- `data-coordinates`: JSON mit Koordinaten.
- `data-map`: Schlüssel für Koordinaten im Frontmatter.

---

Viel Spaß beim Erstellen interaktiver Bilder in Obsidian!
