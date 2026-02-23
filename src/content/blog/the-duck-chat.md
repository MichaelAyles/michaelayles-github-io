---
title: "TheDuck.chat"
description: "AI-powered chat application. Developed for the T3 Cloneathon. DB currently inactive, demos available in repo."
date: 2025-11-19
tags: ["AI", "Chat", "Web"]
project: "theduck-chat-deprecated"
featured: true
draft: false
---
<p align="center">
  <img src="/media/the-duck-chat/theduckchatfull.jpg" alt="TheDuck.chat Logo" width="500">
</p>

*Built for the T3 Chat Cloneathon — a hackathon to clone chat interfaces*

---

## The Idea

I built TheDuck.chat during the T3 Chat Cloneathon. The brief was simple: clone a chat interface. But I wanted to explore some ideas that felt missing from existing AI chat tools at the time.

The main one was **memory**. Why couldn't a chat app remember context across sessions? Every conversation started fresh, even when you were clearly continuing a thread from yesterday. It seemed like an obvious gap.

So I built "Flow Mode" — a feature that summarizes previous conversations and feeds that context into new ones. The AI would actually remember what you'd talked about before.

Turns out I was onto something. Claude.ai now has memory features that work similarly. I'm not claiming credit — it's just satisfying to see an idea validated.

---

## What It Does

### Flow Mode (Cross-Session Memory)

The headline feature. When enabled, TheDuck summarizes your conversation history and includes relevant context in new chats. No more re-explaining your project every time.

This was genuinely useful during development — the duck remembered my codebase structure, my preferences, the bugs I'd mentioned before. It felt like talking to an assistant that actually paid attention.

### DuckPond (Interactive Artifacts)

Ask the AI to create something interactive — a React component, a chart, an SVG — and it renders live in a sandboxed iframe. You can resize the window, the code persists, and you can iterate on it without leaving the chat.

Inspired by Claude's artifacts feature — I wanted that capability with any model, not just Claude.

### Multi-Model Support

Through OpenRouter, you get access to 100+ models. GPT-4, Claude, Gemini, Llama, whatever. Switch mid-conversation if you want. Different models for different tasks.

### The Usual Stuff

- Real-time streaming responses
- File uploads (images, PDFs, documents)
- OAuth login (Google, GitHub)
- Persistent conversation history
- Image analysis for vision-capable models

---

## The Tech

Standard modern stack:

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui
- **Backend**: Supabase (Postgres + Auth + Storage), Upstash Redis
- **AI**: OpenRouter API for model access
- **Hosting**: Vercel

The architecture is server-centric — all the sensitive stuff happens on the backend. Row-level security in Supabase means users can only see their own data. Redis handles rate limiting and caching.

93 unit tests, because hackathon code doesn't have to be throwaway code.

---

## Current Status

**The database and API are currently offline.** I turned them off after the hackathon ended to save on hosting costs. The site is still up at [theduck.chat](https://theduck.chat) but you won't be able to log in or chat.

If anyone actually wants to play with it, let me know and I can spin the backend back up. The code's all there and working.

---

## What I Learned

Building this in a compressed timeframe forced some good habits:

1. **Ship the core feature first.** Flow Mode was the differentiator, so that got built before the nice-to-haves.

2. **Server-side everything.** No complex client state to manage, no security footguns from exposing database access.

3. **Sandboxed execution is tricky.** Getting DuckPond to run arbitrary user code safely required careful iframe isolation and CSP headers.

4. **Token management matters.** Summarization for Flow Mode had to balance context quality against API costs. Too aggressive and you lose important details. Too conservative and you blow through your token budget.

---

## The Name

Rubber duck debugging is a real thing. You explain your problem to a rubber duck (or any inanimate object) and often figure out the solution while talking through it.

TheDuck.chat is a rubber duck that talks back.

---

**Source Code**: [GitHub](https://github.com/MichaelAyles/the-duck)

**Live Site**: [theduck.chat](https://theduck.chat) *(backend currently offline — contact me to re-enable)*
