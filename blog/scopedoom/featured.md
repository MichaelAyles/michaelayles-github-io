# ScopeDoom: DOOM on an Oscilloscope

![ScopeDoom Setup](assets/desk_setup.jpg)

*Playing DOOM on an oscilloscope by converting vector graphics to audio signals through a MacBook's headphone jack*

## The Concept

After KiDoom proved that DOOM's internal vectors could render on PCB traces, the natural question emerged: what other vector displays could work?

Oscilloscopes in XY mode are classic vector displays. Audio cards are just DACs. Put them together, and you can draw DOOM with sound.

## How It Works

The same vector extraction from KiDoom drives an oscilloscope in XY mode. Audio samples trace out walls and sprites at 4-8 Hz - the oscilloscope's electron beam literally drawing the game frame by frame.

No specialized hardware required: just DOOM, Python, and a standard 3.5mm headphone jack.

[Read Full Technical Writeup →](blog.md)
