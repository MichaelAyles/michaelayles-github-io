# Phaestus: CI/CD for Physical Products

![Phaestus Logo](logo.png)

I've been thinking about why hardware development still feels like 1995 while software has moved on. We've got CI/CD pipelines, package managers, automated testing. Meanwhile hardware engineers are still manually routing traces, tweaking enclosure dimensions by hand, and hoping their BOM doesn't have obsolete parts.

The obvious answer is "hardware is harder." Physical constraints, manufacturing tolerances, real-world physics. But I don't think that's quite it. Software had similar problems before we built the right abstractions. Nobody writes assembly anymore because we figured out compilers. Nobody manually manages memory in most contexts because we figured out garbage collection.

So what's the equivalent abstraction for hardware?

## The Full Stack Problem

A physical product isn't just a PCB. It's schematics, board layout, enclosure, firmware, and the fiddly work of making sure they all fit together. Change a connector and your enclosure needs new mounting holes. Add a sensor and your firmware needs new drivers. It's a web of dependencies that's traditionally managed in someone's head or a messy spreadsheet.

Phaestus tries to handle all of this. You describe what you want to build in plain English, and it generates the whole stack. Schematics, PCB layout, parametric enclosure, firmware skeleton. Not as separate outputs but as a coherent system where the pieces actually fit.

The tagline I've been using is "CI/CD for Physical Products." Push a spec, get a manufacturable design. The same reliability we expect from software deployments, but for atoms instead of bits.

## The Standard AI Approach (And Why It Doesn't Work)

The current wave of AI hardware tools mostly tries the obvious thing: feed schematics into an LLM, hope it outputs valid designs. I've tried this. Lots of people have tried this. The results are about 70% correct, which sounds decent until you realise a single wrong connection means your board doesn't work.

You can throw more compute at the problem. Fine-tune on datasheets. Add verification layers. But you're fighting a losing battle. LLMs hallucinate. That's not a bug, it's how they work. The question isn't whether they'll make mistakes, it's whether your system can tolerate mistakes.

Software can tolerate mistakes because we have compilers and tests. Hardware doesn't have that luxury. A PCB either works or it doesn't, and you won't know until you've waited two weeks for manufacturing.

## Treating Hardware Blocks Like Software Dependencies

The insight that got Phaestus working was treating circuit blocks like npm packages.

Think about how software dependencies work. You don't write your own JSON parser. You pull in a validated library that thousands of people have used. The interface is well-defined. The implementation is hidden. If you use it correctly, it works.

What if hardware worked the same way? Instead of asking an LLM to design a power supply from scratch, you have a library of pre-validated power supply blocks. The LLM's job becomes selection and integration, not novel circuit design.

This changes the problem entirely. Selection is something LLMs are good at. "Given these requirements, which block from this list is appropriate?" That's essentially classification, and classification is reliable.

## The Grid (Our Moat)

But block selection alone isn't enough. You still need to connect everything, and that's where hardware design usually goes wrong.

Phaestus uses a fixed 12.7mm grid with standardised bus structures. Every block occupies integer grid positions. Every connection follows defined bus protocols. Power, ground, I2C, SPI, GPIO. All routed through predictable channels.

This sounds limiting, and it is. You can't build everything this way. But the things you can build, you can build reliably. The constraint isn't a weakness. It's the whole point.

When the grid is fixed and the buses are standard, "connecting blocks" becomes a solved problem. No autorouting failures. No clearance violations. No surprise antenna effects from badly routed high-frequency lines. The LLM picks blocks, specifies positions, and the output is manufacturable by construction.

This is the technical moat. The enclosure generation and firmware scaffolding are useful, but they're not where competitors will struggle. The grid system is what makes reliable AI-driven PCB design possible, and PCBs are the hardest part of physical product development to get right.

## Making the Library Self-Expanding

The block library currently has about 21 validated modules. ESP32-C6 MCU, various sensors, power supplies, outputs, displays, input controls. That's enough to build a surprising range of IoT devices.

But the interesting bit is how the library grows. New blocks can be LLM-generated, then validated through simulation and interface checking. If a block passes validation, it joins the library. The system gets more capable over time without manual intervention.

This is where constraints really pay off. Because every block follows the same grid and bus conventions, validation is tractable. You can check interface compatibility programmatically. You can verify power requirements sum correctly. The constraints that make LLM outputs reliable also make automated validation possible.

## Current Status

I need roughly 10 more blocks for what I'd consider a complete demo. More display options, some audio stuff, maybe LoRa for longer range wireless. Once those are in, I'm planning to order the first real prototype. An actual physical board designed entirely through natural language, manufactured, assembled, powered on.

That's the goal, anyway. Hardware has a way of humbling you.

## The Meta-Point

What I find most interesting about this project isn't the hardware stuff specifically. It's what it suggests about AI tools in general.

The common framing is that AI gets more useful as models get more capable. Train a bigger model, get better results. That's true to a point, but it misses something important.

The real bottleneck is usually the abstraction layer, not the model. GPT-4 can write code. It couldn't reliably write hardware designs. Not because hardware is harder for transformers to learn, but because we didn't have the right constraints to make its outputs usable.

The grid system, the block library, the standardised buses. None of that required better AI. It required better thinking about what AI needs to succeed.

I suspect a lot of AI applications are stuck at this stage. Waiting for better models when they actually need better abstractions. The capability is there. The scaffolding isn't.

## What's Next

Short term: finish the block library, order the first board, see what breaks.

Medium term: make the full pipeline smoother. Right now there's still manual work getting from generated designs to actual manufacturing files. That should be one click.

Long term: the same thing but for increasingly complex products. More block types, more enclosure options, more sophisticated firmware generation. The architecture scales, it's just a matter of filling in the pieces.

If you want to try it: [phaestus.app](https://phaestus.app). Public login available soon, gallery and/or video walkthrough sooner if you want to follow along. And if you want to talk hardware automation, AI abstractions, or why IoT devices are still so annoying to build, drop me a message at [contact@phaestus.app](contact@phaestus.app).
