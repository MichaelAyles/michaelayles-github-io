# KiCad Netlist Tool

*Making KiCad schematics LLM-friendly*

---

## The Problem

I wanted to use Claude to help document my circuits. Describe what each block does, generate a BOM, review the design. Simple stuff.

The problem: KiCad schematic files are massive. A modest circuit is 55KB and 25,000+ tokens. At Claude Opus rates, that's $0.50 per query just to read the schematic. Do that a few times during a design session and you've spent more on API calls than on the actual components.

Most of those tokens are noise — UUIDs, coordinates, symbol graphics, metadata. The actual electrical information is maybe 2% of the file.

---

## The Solution

The KiCad Netlist Tool extracts just the electrical information and outputs a compact summary:

```
Original: 26,000 tokens → Optimized: 453 tokens
Savings: 98.3%
```

That $0.50 query becomes $0.009. Now I can iterate.

The output includes everything an LLM needs to understand the circuit:
- Components with values and footprints
- Pin-to-net connectivity
- Net topology

It strips everything it doesn't need: graphics, positions, UUIDs, formatting.

---

## How It Works

The tool runs in the background and watches your schematic file. When you save in KiCad, it automatically regenerates the summary. No manual export steps, no context switching.

There's a system tray app for minimal footprint, or a GUI if you want to see the stats and changelog.

**Change tracking** was surprisingly useful. The tool diffs each version and logs what changed — added components, modified values, new connections. Turns out that's handy for design reviews and documentation even without the LLM angle.

---

## What I Actually Use It For

**Documentation**: Paste the netlist into Claude, ask for a functional description of each block. Works well for complex designs where I need to write up what I built.

**Design review**: "Are there any obvious issues with this circuit?" catches missing pull-ups, floating pins, that kind of thing.

**BOM generation**: The component list is already extracted, so generating a formatted BOM is trivial.

**Change summaries**: When updating a design, the changelog gives me a quick "what did I actually modify" without digging through KiCad's UI.

---

## Future: Migration to TOKN

The current output format works, but it's ad-hoc. I've since developed [TOKN](/blog/tokn/blog.md) — a proper token-optimised notation for KiCad schematics with a formal spec, round-trip conversion, and better structure for LLM consumption.

Migrating this tool to output TOKN format is high priority. Same functionality, better format, and compatibility with the broader TOKN ecosystem.

---

## Tech Stack

- **Language**: Python
- **GUI**: Qt (PyQt/PySide)
- **File Monitoring**: watchdog
- **Platforms**: Windows, macOS, Linux

---

**Source Code**: [GitHub](https://github.com/MichaelAyles/kicad-netlist-tool)
