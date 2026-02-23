---
title: "OpenSCAD-DOOM: Playing DOOM in a CAD Modeler"
project: "openscad-doom"
---
![OpenSCAD DOOM Demo](/media/openscad-doom/demo.gif)

*Running the classic 1993 shooter at 10-20 FPS in a parametric 3D modeling tool*

## Media Coverage

### Featured In:

**[The Register: "Knee-Deep in the CAD: Boffin gets Doom running inside a design modeler"](https://www.theregister.com/2026/01/26/openscad_doom/)**
> Coverage of the third entry in the engineering tool abuse trilogy, including the accidental smiley-face monster bug

---

## The Trilogy of Engineering Tool Abuse

This is the third project in an increasingly unhinged series asking "Can I run DOOM on engineering tools that were absolutely not designed for games?"

| Project | Tool Abused | FPS |
|---------|-------------|-----|
| [KiDoom](https://github.com/MichaelAyles/kidoom) | KiCad PCB Editor | 10-25 |
| [ScopeDoom](https://github.com/MichaelAyles/ScopeDoom) | Oscilloscope | 4-8 |
| **OpenSCAD-DOOM** | OpenSCAD | 10-20 |

## What Makes It Work

A custom Python engine reads DOOM's WAD files and exports geometry to OpenSCAD in real-time. OpenSCAD's Animation mode provides the render loop, and the Manifold backend (new in 2025) makes it actually playable rather than a slideshow.
