# ScopeDoom: DOOM on an Oscilloscope

<img src="assets/desk_setup.jpg" alt="ScopeDoom Setup" width="800">

*Playing DOOM on an oscilloscope by converting vector graphics to audio signals through a MacBook's headphone jack*

## The Continuation

ScopeDoom emerged as the natural next step after KiDoom's success. Once DOOM's internal vectors were proven to work on PCB traces, the question became: what other vector displays could I target?

Oscilloscopes in XY mode are classic vector displays. Audio cards are just DACs. Put them together, and you can draw DOOM with sound.

## Media Coverage

ScopeDoom was featured alongside KiDoom as part of the broader vector-rendering DOOM project story:

### Featured In:

**[Hackaday: "KiDoom Brings Classic Shooter to KiCad"](https://hackaday.com/2025/11/26/kidoom-brings-classic-shooter-to-kicad/)**
> Covers both KiDoom and ScopeDoom as demonstrations of vector-based DOOM rendering

**[The Register: "DOOM on KiCad"](https://www.theregister.com/2025/11/26/doom_kicad/)**
> Discusses the oscilloscope extension as a spin-off of the PCB trace renderer

**[Adafruit Blog: "KiDoom: Running DOOM on KiCad PCB Traces"](https://blog.adafruit.com/2025/11/26/kidoom-running-doom-on-kicad-pcb-traces/)**
> Mentions ScopeDoom as part of the vector rendering exploration

**[Hackster: "I Always Thought Trace Routing Was Evil"](https://www.hackster.io/news/i-always-thought-trace-routing-was-evil-c4cfc1142f63)**
> Nick Bild's coverage of the vector-based DOOM rendering projects

**[Tom's Hardware: "Doom Gets Ported to Board Design App"](https://www.tomshardware.com/video-games/retro-gaming/doom-gets-ported-to-board-design-app-transforming-walls-into-pcb-traces-iconic-demons-into-64-pin-packages-and-ammo-into-3-pin-parts-fully-playable-kicad-editor-port-runs-at-up-to-25-fps-on-modern-systems)**
> Coverage of the fully playable KiCad editor port running at up to 25 FPS

**[XDA Developers: "Someone Ported Doom Into a Circuit Board Editor"](https://www.xda-developers.com/someone-ported-doom-into-a-circuit-board-editor-and-its-incredible/)**
> In-depth look at how walls became PCB traces and demons became component packages

**[Daily.dev: "Doom Hits KiCad as PCB Traces Become Demons and Doors"](https://app.daily.dev/posts/doom-hits-kicad-as-pcb-traces-become-demons-and-doors-ieiqagdsv)**
> Community coverage of the creative technical achievement

**[Hacker News Discussion](https://news.ycombinator.com/item?id=46051449)**
> #1 on Hacker News for nearly a full day

### Videos:

**[UFD Tech YouTube Short](https://www.youtube.com/shorts/7IJEBFnCkok)** | **[UFD Tech Instagram](https://www.instagram.com/p/DR1zzqQlNc5/)**

---

## How It Works

The same vector extraction from KiDoom drives an oscilloscope in XY mode. Audio samples trace out walls and sprites at 4-8 Hz - the oscilloscope's electron beam literally drawing the game frame by frame.

No specialized hardware required: just DOOM, Python, and a standard 3.5mm headphone jack.

[Read Full Technical Writeup →](#scopedoom)
