# ScopeDoom: DOOM on an Oscilloscope

![ScopeDoom Setup](assets/desk_setup.jpg)

Playing DOOM on an oscilloscope by converting vector graphics to audio signals through a MacBook's headphone jack.

## Key Features

- **Oscilloscope XY Mode** - Left/right audio channels control X/Y beam position
- **Vector Graphics** - Line-based rendering perfect for oscilloscope displays
- **Audio DAC Output** - Standard 3.5mm headphone jack drives the scope
- **Shared Vector Pipeline** - Reuses KiDoom's DOOM geometry extraction code

## How It Works

The same vector extraction approach from KiDoom is repurposed to drive an oscilloscope in XY mode. Audio samples are generated to trace out walls and sprites, with the oscilloscope's electron beam drawing the game frame by frame at 4-8 Hz.

No specialized hardware needed - just DOOM, Python, and a dual-channel audio output.

## A Natural Extension

After proving that DOOM's internal vectors could render on PCB traces, the next question was obvious: what other vector displays could work? Oscilloscopes in XY mode are classic vector displays, and audio cards are just DACs.

[Read Full Technical Writeup](blog.md)
