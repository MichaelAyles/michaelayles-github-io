# KiDoom: DOOM on PCB Traces

![KiDoom Demo](kidoom-demo-new.gif)

*Running the classic 1993 shooter using real copper traces and component footprints in KiCad's PCB editor*

## Media Coverage

KiDoom reached **#1 on Hacker News** and stayed there for almost a full day, generating widespread discussion across the tech community.

### Featured In:

**[Hackaday: "KiDoom Brings Classic Shooter to KiCad"](https://hackaday.com/2025/11/26/kidoom-brings-classic-shooter-to-kicad/)**
> Coverage of the vector rendering approach and how PCB traces become game graphics

**[The Register: "DOOM on KiCad"](https://www.theregister.com/2025/11/26/doom_kicad/)**
> Analysis of the technical achievement and community reception

**[Adafruit Blog: "KiDoom: Running DOOM on KiCad PCB Traces"](https://blog.adafruit.com/2025/11/26/kidoom-running-doom-on-kicad-pcb-traces/)**
> Maker community perspective on the project

**[Hackster: "I Always Thought Trace Routing Was Evil"](https://www.hackster.io/news/i-always-thought-trace-routing-was-evil-c4cfc1142f63)**
> Nick Bild's coverage of the vector rendering approach and PCB component representation

**[Tom's Hardware: "Doom Gets Ported to Board Design App"](https://www.tomshardware.com/video-games/retro-gaming/doom-gets-ported-to-board-design-app-transforming-walls-into-pcb-traces-iconic-demons-into-64-pin-packages-and-ammo-into-3-pin-parts-fully-playable-kicad-editor-port-runs-at-up-to-25-fps-on-modern-systems)**
> Coverage of the fully playable KiCad editor port running at up to 25 FPS

**[XDA Developers: "Someone Ported Doom Into a Circuit Board Editor"](https://www.xda-developers.com/someone-ported-doom-into-a-circuit-board-editor-and-its-incredible/)**
> In-depth look at how walls became PCB traces and demons became component packages

**[Daily.dev: "Doom Hits KiCad as PCB Traces Become Demons and Doors"](https://app.daily.dev/posts/doom-hits-kicad-as-pcb-traces-become-demons-and-doors-ieiqagdsv)**
> Community coverage of the creative technical achievement

**[Hacker News Discussion](https://news.ycombinator.com/item?id=46051449)**
> #1 trending for nearly 24 hours with 500+ comments discussing the implementation

---

## What Makes It Work

Instead of rendering 64,000 pixels per frame (0.15 FPS), KiDoom extracts DOOM's internal vector geometry directly from the engine - just 200-300 line segments per frame, achieving 10-25 FPS on PCB traces.

Enemies are rendered as real footprints: demons are intimidating 64-pin QFP packages, health packs are humble 3-pin SOT-23s.

[Read Full Technical Writeup →](blog.md)
