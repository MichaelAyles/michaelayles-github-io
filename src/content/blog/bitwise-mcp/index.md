---
title: "bitwise-mcp: MCP Server for Embedded Documentation"
description: "MCP documentation server for embedded developers. Ingests PDF RMs, extracts register definitions, and provides fast semantic search with minimal token usage."
date: 2025-11-19
tags: ["Python", "MCP", "Embedded", "AI"]
project: "bitwise-mcp"
featured: true
draft: false
---
## Overview

As an embedded systems developer, I've spent countless hours searching through massive reference manuals—1000+ page PDFs containing register definitions, peripheral specifications, and technical details. Finding the right information quickly is critical when debugging or implementing new features, but traditional search methods fall short.

bitwise-mcp solves this problem by providing an intelligent MCP (Model Context Protocol) server that enables AI assistants like Claude to search and reference embedded systems documentation with precision and efficiency.

## The Problem

Embedded developers face unique challenges when working with documentation:

- **Document Size**: Reference manuals can exceed 2,000 pages
- **Token Costs**: Passing entire PDFs to LLMs is prohibitively expensive
- **Search Inefficiency**: PDF readers lack semantic understanding
- **Context Switching**: Manually browsing documentation breaks development flow

## The Solution

bitwise-mcp indexes large technical PDFs and provides two powerful search capabilities:

1. **Keyword Search**: SQLite FTS5 for precise term matching
2. **Semantic Search**: FAISS vector similarity for contextual queries

This hybrid approach means you can ask questions like "What's the baud rate configuration for UART2?" and get relevant register definitions instantly, without manually searching hundreds of pages.

## Technical Implementation

### Architecture

**PDF Processing Pipeline**:
- PyMuPDF and pdfplumber for document parsing
- Structure preservation during text extraction
- Automatic register definition detection
- JSON conversion of structured data

**Search Engine**:
- SQLite FTS5 for full-text indexing
- sentence-transformers for semantic embeddings
- FAISS for vector similarity search
- Token-optimized response formatting

### Performance

Tested on the S32K144 Reference Manual (2,179 pages):

- **Indexing Time**: ~3 minutes
- **Search Response**: <500ms
- **Memory Usage**: ~500MB
- **Accuracy**: High precision for both keyword and semantic queries

### MCP Integration

The server exposes five tools through the Model Context Protocol:

1. `search_docs` - Hybrid document search
2. `find_register` - Targeted register lookups
3. `list_docs` - View indexed documents
4. `ingest_docs` - Add new PDFs to index
5. `remove_docs` - Delete indexed content

## Real-World Impact

Instead of interrupting development to search through PDFs, I can now:

- Ask Claude directly about peripheral configurations
- Get register definitions with bit field descriptions
- Find code examples and specifications contextually
- Stay in my development environment

The token efficiency is remarkable: queries that would consume 25,000+ tokens now use a fraction of that, dramatically reducing API costs while improving response quality.

## Use Cases

- **Debugging**: Quickly verify register configurations
- **Implementation**: Find peripheral setup requirements
- **Code Review**: Reference specifications without context switching
- **Documentation**: Generate accurate technical descriptions

## Tech Stack

- Python 3.10+
- PyMuPDF & pdfplumber (PDF processing)
- sentence-transformers (embeddings)
- FAISS (vector search)
- SQLite FTS5 (full-text search)
- Model Context Protocol

## Future Development

- Support for more document formats
- Enhanced register definition parsing
- Cross-reference detection
- Code example extraction
- Multi-document correlation

## Conclusion

bitwise-mcp demonstrates how the Model Context Protocol can bridge the gap between traditional documentation and modern AI-assisted development. By making embedded systems documentation instantly accessible and intelligently searchable, it removes friction from the development process and lets engineers focus on building, not searching.

---

**Source Code**: [GitHub](https://github.com/MichaelAyles/bitwise-mcp)
