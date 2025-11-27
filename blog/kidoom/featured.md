# KiDoom: DOOM on PCB Traces

![KiDoom Demo](kidoom-demo-new.gif)

Running the classic 1993 shooter using real copper traces and component footprints in KiCad's PCB editor.

## Key Features

- **Real DOOM Engine** - Authentic gameplay using doomgeneric at 10-25 FPS
- **Vector Rendering** - Wireframe walls as PCB traces, entities as real footprints
- **Smart Entity System** - Demons are 64-pin QFP packages, health packs are 3-pin SOT-23s
- **Triple-Mode Display** - SDL window for gameplay, Python wireframe for debug, KiCad PCB for the show

## Technical Innovation

Instead of rendering 64,000 pixels per frame (which would give 0.15 FPS), KiDoom extracts DOOM's internal vector geometry directly from `drawsegs[]` and `vissprites[]` arrays. This means only 200-300 line segments per frame, achieving playable framerates.

The entity type system patches DOOM's source to capture `MT_*` entity types, mapping 150+ game objects to appropriate footprint packages based on gameplay significance.

## Media Coverage

KiDoom reached **#1 on Hacker News** and stayed there for almost a full day, generating widespread discussion in the tech community.

**Featured In:**
- [Hackaday: "KiDoom Brings Classic Shooter to KiCad"](https://hackaday.com/2025/11/26/kidoom-brings-classic-shooter-to-kicad/)
- [The Register: "DOOM on KiCad"](https://www.theregister.com/2025/11/26/doom_kicad/)
- [Adafruit Blog: "KiDoom: Running DOOM on KiCad PCB Traces"](https://blog.adafruit.com/2025/11/26/kidoom-running-doom-on-kicad-pcb-traces/)
- [Hacker News Discussion](https://news.ycombinator.com/item?id=46051449) - #1 trending for nearly 24 hours

## Why It Exists

Because DOOM runs on everything. Because PCB editors have Python scripting. Because the intersection of those two facts demanded to be explored.

[Read Full Technical Writeup](blog.md)
