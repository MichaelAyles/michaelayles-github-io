# ScopeDoom: DOOM on an Oscilloscope

<img src="assets/desk_setup.jpg" alt="ScopeDoom Setup" width="800">

*Playing DOOM on an oscilloscope by converting vector graphics to audio signals through a MacBook's headphone jack*

## The Continuation

ScopeDoom emerged as the natural next step after KiDoom's success. Once DOOM's internal vectors were proven to work on PCB traces, the question became: what other vector displays could we target?

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

**[Hacker News Discussion](https://news.ycombinator.com/item?id=46051449)**
> Community discussion covering both the PCB and oscilloscope implementations

---

## How It Works

The same vector extraction from KiDoom drives an oscilloscope in XY mode. Audio samples trace out walls and sprites at 4-8 Hz - the oscilloscope's electron beam literally drawing the game frame by frame.

No specialized hardware required: just DOOM, Python, and a standard 3.5mm headphone jack.

[Read Full Technical Writeup →](blog.md)
