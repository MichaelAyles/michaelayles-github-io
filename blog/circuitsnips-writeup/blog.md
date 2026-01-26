# CircuitSnips.com: Building a Thingiverse for KiCad

## Overview

CircuitSnips.com is a community-driven platform for sharing and discovering KiCad subcircuits. Think of it as "Thingiverse, but for electronics" - a place where engineers can share their proven circuit designs and help others avoid reinventing the wheel.

The comparison to Thingiverse is deliberate: this is for side projects and quick prototypes, not production designs. If you want to throw an ESP on a board with an AMS1117 and an MCP2515 for a weekend project, these circuits are a reasonable starting point. You should always check everything yourself, but if you're repeatedly throwing boards together with the same jellybean parts, why not have a library to pull from?

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
- **Backend**: RESTful API for circuit management
- **Storage**: File-based storage for KiCad files with metadata indexing. Database, Buckets and Auth all using Supabase for convenience, with thumbnails on Cloudflare R2
- **Search**: Full-text search across circuit descriptions and component lists

### Key Features

1. **File Parsing**: Automatic extraction of component information from KiCad files
2. **Preview Generation**: Visual thumbnails of circuit schematics
3. **Version Control**: Track updates and improvements to shared circuits
4. **Community Ratings**: User feedback on circuit quality and reliability

## Challenges

### KiCad File Format

KiCad uses S-Expressions for both its file storage and clipboard data, which conveniently is one of the reasons this worked in the first place. However, the KiCanvas viewer wasn't set up to handle 'snips'. When snips are uploaded, they need to be wrapped in everything else that's required to make a valid kicad_sch file.

It was also necessary to block parts of the S-Expression, such as references to components on other sheets, to ensure compatibility.

### The KiCanvas Viewer

The KiCanvas viewer is an amazing bit of work, but wasn't quite set up for my needs. I added functionality to control themes from the page, which is required for the thumbnail generation flow.

I also added the functionality to do a box selection and directly copy subsections, whilst maintaining the 'copy' counter. This is particularly useful for bulk-uploaded circuits that contain full sheets - users can select just the subcircuit they actually want rather than copying everything.

### Initial Data: The Bootstrapping Problem

A platform like this is useless without content, but nobody will contribute to an empty site. To break this chicken-and-egg problem, the decision was made to scrape GitHub for kicad_sch files, classify them by version and license, and determine attribution.

The kicad_sch S-Expressions were flattened using a tokenizer built for another project, then fed into Gemini Flash 2.5 to extract and rank subcircuits from the files. This gave us 4,230+ schematic files with correct licenses and attribution, at an API cost of under £10.

**Addressing the obvious concerns:**

The bulk-uploaded circuits are a bootstrapping mechanism, not the end goal. I uploaded several hand-curated examples, but most of my own work is either niche automotive stuff or things I can't share publicly. Once the community starts contributing meaningfully useful snips, the bulk uploads can be downranked in search results. There's already a toggle to hide bulk uploads entirely from browse and search for users who prefer curated content only.

For what it's worth, the scraped collection includes circuits from automotive projects, medical devices, and hardware that's been to space. The classifier grades circuits on quality, which affects search ranking - though this may need tuning based on feedback.

As for the "100+ components for a 5V regulator" issue: bulk uploads are necessarily full sheets because extracting subcircuits automatically is a project in its own right. The KiCanvas box-selection feature exists specifically to let users grab just the portion they need.

If users don't wish for their schematics to be included, there's a one-click report that doesn't require login.

### Why Not Open Source the Database?

The code is fully open source, and the SQL migrations are public in the repo. A database is a necessary evil for this kind of platform - it simply can't work without one. There's no interest here in monetising other people's work. This is a solo project built to solve a problem I have.

If AI companies wanted schematic data for training, they can do exactly what I did: scrape GitHub for kicad_sch files, which are just S-Expression text. Putting it in a browsable format doesn't really change anything.

### The Hug of Death

The site exceeded Vercel's free tier rate limits after the Hackaday feature. I also had to migrate thumbnails from Supabase to Cloudflare R2 - 4,000+ circuits at two thumbnails each, roughly 120KB per image, resulted in 1.2GB of storage against a 1GB free tier limit. Things are stabilising now.

## Results

The platform is live and growing, with circuits ranging from simple LED drivers to complex motor controllers.

## Next Steps

- Integration with KiCad as a plugin
- Automated testing and validation of uploaded circuits
- Community-driven improvements and optimisations
- Support for other EDA tools
- Tuning the quality classifier based on user feedback

## Conclusion

CircuitSnips demonstrates how sharing knowledge and proven designs can accelerate the entire electronics engineering community. By making subcircuits easily discoverable and reusable, we can all spend less time on repetitive work and more time on innovation.

---

**Live Site**: [circuitsnips.com](https://circuitsnips.com)
**Source Code**: [GitHub](https://github.com/MichaelAyles/kicad-library)