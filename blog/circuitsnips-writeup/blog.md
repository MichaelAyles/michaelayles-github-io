# CircuitSnips.com: Building a Thingiverse for KiCad

## Overview

CircuitSnips.com is a community-driven platform for sharing and discovering KiCad subcircuits. Think of it as "Thingiverse, but for electronics" - a place where engineers can share their proven circuit designs and help others avoid reinventing the wheel.

## The Problem

As an electronics engineer, I found myself repeatedly designing the same common circuits - voltage regulators, protection circuits, signal conditioning stages, etc. While these patterns exist across thousands of projects, there wasn't a standardized way to share and reuse them within KiCad.

## Solution

CircuitSnips allows users to:

- **Upload** KiCad subcircuit files with proper documentation
- **Browse** community-contributed circuits by category
- **Search** for specific functionality or components
- **Download** ready-to-use subcircuits that can be dropped into any KiCad project

## Technical Implementation

### Stack

- **Frontend**: Modern web framework with responsive design. Hosted on Vercel
- **Backend**: RESTful API for circuit management.
- **Storage**: File-based storage for KiCad files with metadata indexing. Database, Buckets and Auth all using Supabase for convenience.
- **Search**: Full-text search across circuit descriptions and component lists

### Key Features

1. **File Parsing**: Automatic extraction of component information from KiCad files
2. **Preview Generation**: Visual thumbnails of circuit schematics
3. **Version Control**: Track updates and improvements to shared circuits
4. **Community Ratings**: User feedback on circuit quality and reliability

## Challenges

### KiCad File Format

Kicad uses S-Expressions for both its file storage and also it's clipboard data, which conveniently is one of the reasons this worked in the first place, however the KiCanvas viewer wasn't set up to handle 'snips'. When Snips are uploaded, they need to be wrapped in everything else that's required to make a kicad_sch file.

It was also necessary to block parts of the s-expression, such as references to components on other sheets to ensure compatability. 

### The KiCanvas viewer

The KiCanvas viewer is an amazing bit of work, but wasn't quite set up for our needs. We have added the functionality to control themes from the page, which is required for the thumbnail generation flow. 

We also added the functionality to do a box selection and directly copy subsections, whilst maintaining the 'copy' counter.

### Initial Data

This project would be useless with no example circuits to build momentum. Rightly or wrongly, the decision was made to scrape github for kicad_sch files, then classify them by their version, their license, determine attribution. 

The kicad_sch s-expressions were then flattened using a tokenizer built for another project, and then the schematic file was fed into a fairly dumb, cheap LLM (Gemini Flash 2.5) to extract and rank subcircuits from the files.

We are starting with 4230+ schematic files, with correct licenses and attribution, at a API cost of <£10.

If the users do not wish for their schematics to be used, there is a one-click report, which doesn't require logon.

## Results

The platform has become a valuable resource for the electronics community, with circuits ranging from simple LED drivers to complex motor controllers.

## Next Steps

- Integration with KiCad as a plugin
- Automated testing and validation of uploaded circuits
- Community-driven improvements and optimizations
- Support for other EDA tools

## Conclusion

CircuitSnips demonstrates how sharing knowledge and proven designs can accelerate the entire electronics engineering community. By making subcircuits easily discoverable and reusable, we can all spend less time on repetitive work and more time on innovation.

---

**Live Site**: [circuitsnips.com](https://circuitsnips.com)
**Source Code**: [GitHub](https://github.com/MichaelAyles/kicad-library)
