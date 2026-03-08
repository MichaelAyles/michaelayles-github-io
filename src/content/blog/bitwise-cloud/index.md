---
title: "Bitwise Cloud: Hosted Search for Embedded Documentation"
description: "Taking the bitwise-mcp local search tool and turning it into a hosted multi-tenant platform with a web app, REST API, and plugin marketplace."
date: 2026-03-03
tags: ["Python", "React", "MCP", "Embedded", "AI"]
project: "bitwise-cloud"
featured: false
draft: false
---

## From Local Tool to Platform

[bitwise-mcp](/blog/bitwise-mcp) solved a real problem for me: searching through 2,000-page reference manuals without losing my mind. Index the PDF locally, query it through Claude, get answers in milliseconds. It worked well enough that I started using it daily.

But it had a limitation that became obvious as soon as anyone else wanted to use it. You had to install Python, clone the repo, download embedding models, ingest your own PDFs, and configure your MCP client. That's fine for a developer tool. It's a non-starter for a team that wants shared documentation search across an organisation.

The question was straightforward: what if the search engine ran as a service? Upload your docs through a web interface, query them from anywhere, share indexes across a team. Same hybrid search core, but without the local setup overhead.

That's Bitwise Cloud.

## Architecture Decisions

The local tool is a single-process Python server. It reads files from disk, builds indexes in a local SQLite database, and serves results over stdio. Scaling that to multiple users required rethinking most of the stack while keeping the part that actually worked — the search engine.

The backend is FastAPI, which was a natural fit since bitwise-mcp was already Python. The search core (SQLite FTS5 for keyword matching, FAISS for semantic similarity) carries over almost unchanged. What's new is everything around it: user authentication, document management, tenant isolation, and the API layer.

The frontend is a React app. Upload documents, manage your library, run searches, view results with highlighted snippets. Nothing revolutionary in the UI, but it removes the need for an MCP client to get value from the search engine.

## Multi-Tenant Isolation

The hardest architectural problem was tenant isolation. In the local tool, there's one user and one set of indexes. In a hosted platform, every user's documents need to be completely separate — both for privacy and for search relevance.

Each tenant gets their own isolated search indexes. Document uploads, embeddings, and FTS5 indexes are all scoped to the authenticated user. There's no shared search space where your proprietary reference manual might leak into someone else's results.

API keys are scoped per tenant too. You can generate keys for programmatic access, and each key only sees that tenant's documents. This matters because the primary use case is still AI-assisted development — you want your MCP client or API integration to hit your indexes, not a shared pool.

## Hybrid Search (Brief Reprise)

The search engine itself is covered in detail in the [bitwise-mcp post](/blog/bitwise-mcp), so I won't repeat it here. The short version: queries run against both a keyword index (FTS5) and a semantic index (FAISS), results are merged and ranked, and the output is formatted for minimal token usage.

The cloud version adds one thing on top: search scoping by document. If you've uploaded ten reference manuals but only care about the STM32H7 right now, you can scope your query to just that document. Small feature, but it makes a meaningful difference when your library grows.

## The Two-Plugin Approach

Bitwise Cloud exposes two MCP plugins, and the split is deliberate.

The **search plugin** is read-only. It connects to your cloud indexes and lets your AI assistant query your documentation library. This is the high-frequency use case — you're debugging, you need a register definition, you ask Claude and it searches your hosted docs.

The **management plugin** handles document uploads, library organisation, and index administration. You use it less often, and it requires broader permissions.

Splitting these means you can give your MCP client search access without granting it the ability to delete your entire document library. Least privilege, applied to AI tool access.

## API Keys and Access

The REST API uses scoped API keys. Each key is tied to a tenant and can be restricted to specific operations. This lets you integrate Bitwise Cloud into CI pipelines, custom tools, or third-party applications without exposing your full account.

Key management is handled through the web app. Generate, revoke, and monitor usage. Nothing exotic, but it had to be right — API keys are the primary authentication mechanism for programmatic access, and getting scoping wrong in a multi-tenant system is how data leaks happen.

## Deployment Stack

The platform runs on a fairly standard modern deployment setup. FastAPI backend behind a reverse proxy, React frontend served as static assets, PostgreSQL for user and metadata storage, with the search indexes (SQLite and FAISS) managed per-tenant on the application server.

The interesting deployment challenge was the search indexes themselves. They're not database rows — they're file-based indexes that need to live close to the compute that queries them. This rules out some of the more distributed architectures you might reach for by default. For now, the approach is straightforward: indexes live on the same machine as the search service, with backups and the ability to rebuild from source documents.

## What's Next

The immediate focus is onboarding early users and expanding the document format support beyond PDFs. Datasheets, HTML documentation, and Markdown reference docs are all on the roadmap.

Longer term, I'm interested in cross-document search — querying across your entire library and getting results that correlate information from multiple reference manuals. "Show me every peripheral that uses DMA channel 3" across all your indexed docs, not just the one you're currently looking at.

---

**Live**: [bitwise.mikeayles.com](https://bitwise.mikeayles.com/)
**Source Code**: [GitHub](https://github.com/MichaelAyles/bitwise-cloud)
