---
title: "KiCad Netlist Tool"
description: "Tool for reducing LLM token count from Kicad SCH files, to allow for automated documentation"
date: 2025-11-19
tags: ["Python", "KiCad", "AI"]
project: "kicad-netlist-tool"
featured: false
draft: false
---
*Compact netlist extraction for LLM workflows*

---

## The Problem

KiCad schematic files are mostly noise for LLM purposes. A modest circuit is 55KB and 25,000+ tokens. Most of that is UUIDs, coordinates, symbol graphics, and metadata. The actual electrical information is maybe 2% of the file.

---

## The Tool

Extracts just the electrical information and outputs it in [TOKN format](https://mikeayles.com/#tokn):

```
Original: 1,509,037 tokens → TOKN: 51,443 tokens
Reduction: 96.6%
```

![KiCad Netlist Tool](/media/kicad-netlist-tool/assets/screenshot.png)

Features:
- **Hierarchical sheet selection** — pick which sheets to include
- **Copy to clipboard** — paste directly into your LLM
- **File monitoring** — auto-regenerate when you save in KiCad
- **Real-time stats** — token count before and after

---

## TOKN Format

The output is [TOKN v1.2](https://mikeayles.com/#tokn) — a compact format that preserves the electrical information:

```
# TOKN v1
title: Audio Preamp

components[3]{ref,type,value,fp,x,y,w,h,a}:
  U1,ECC83,ECC83-1,Valve,127.00,85.09,25.40,20.32,0
  R1,R,1.5k,0805,149.86,85.09,7.62,0.00,90
  C1,C,10uF,RadialD10,123.19,64.77,0.00,7.62,0

nets[2]{name,pins}:
  VIN,U1.2,C1.1
  VOUT,U1.7,R1.2
```

Components, values, footprints, positions, and net connectivity.

---

## Use Cases

**Documentation**: Generate functional descriptions of circuit blocks.

**Design review**: Catch missing pull-ups, floating pins, etc.

**BOM generation**: Component list is already extracted.

**Selective extraction**: Include only the sheets you need.

---

## Tech Stack

- **Language**: Python
- **GUI**: CustomTkinter
- **Format**: TOKN v1.2
- **Platforms**: Windows, macOS, Linux

---

**Source Code**: [GitHub](https://github.com/MichaelAyles/kicad-netlist-tool)
