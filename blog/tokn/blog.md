# TOKN: Token-Optimised KiCad Notation

*A compact format for teaching LLMs to generate electronic circuits*

---

## The Problem: LLMs Can't Read Schematics Efficiently

KiCad schematic files are verbose. A typical `.kicad_sch` file runs 50-100KB, consuming 25,000-40,000 tokens. That's expensive for training data and impractical for generation tasks. Worse, most of those tokens are formatting noise—coordinates, UUIDs, metadata—not electrical information.

If you want an LLM to *generate* circuits, you need a format that's:
- Token-efficient (for practical training and inference)
- Learnable (consistent structure an LLM can pattern-match)
- Complete (preserves electrical connectivity)
- Reversible (can reconstruct valid KiCad files)

TOKN is that format.

---

## The Solution: 92% Token Reduction

TOKN (Token-Optimised KiCad Notation) compresses KiCad schematics while preserving everything that matters electrically.

**MAX9926 Benchmark**:
| Metric | Original | TOKN | Reduction |
|--------|----------|------|-----------|
| File size | 83,834 bytes | 5,077 bytes | -93.9% |
| Lines | 4,535 | 143 | -96.8% |
| Tokens | 38,678 | 3,027 | **-92.2%** |

The compression comes from stripping formatting while keeping semantics. A KiCad symbol definition might be 200 lines of S-expressions. TOKN captures the same information in a few structured lines.

<p align="center">
  <img src="assets/comparison.png" alt="Round-trip comparison: Original KiCad schematic vs TOKN-reconstructed" width="800">
  <br>
  <em>Round-trip conversion: Original schematic (left) vs reconstructed from TOKN (right) — no loss of electrical information</em>
</p>

---

## Format Structure

TOKN v1.2 organizes circuit data into four sections:

### 1. Components

```
@C R1 res 10k R_0603 (25.4,50.8) s2.54 r0
@C U1 MAX9926 MAX9926UAEE SOIC-16 (76.2,63.5) s2.54 r0
```

Each component line captures:
- Reference designator (R1, U1)
- Normalized type (res, MAX9926)
- Value (10k, MAX9926UAEE)
- Footprint (R_0603, SOIC-16)
- Center position in mm
- Pin spread
- Rotation

### 2. IC Pin Definitions

```
@P U1 1:IN+ 2:IN- 3:VDD 4:OUT 5:GND...
```

ICs get explicit pin mappings using datasheet nomenclature. This is critical—LLMs need to know that pin 1 of a MAX9926 is IN+, not just "pin 1".

### 3. Nets

```
@N VCC: U1.3 C1.1 R1.2
@N GND: U1.5 C1.2 C2.2
@N INPUT: U1.1 R2.1
```

Net definitions capture electrical connectivity. Every pin connection is explicit. No ambiguity about what connects to what.

### 4. Wires

```
@W (25.4,50.8)-(25.4,63.5)-(50.8,63.5)
```

Wire geometry preserves schematic layout. Not strictly necessary for electrical function, but essential for round-trip conversion.

---

## The Benchmark Suite

TOKN includes a comprehensive benchmark for evaluating LLM circuit generation capabilities across three difficulty tiers:

### Easy (100 prompts)
Single IC circuits with basic supporting components. Linear regulators, LED drivers, simple amplifiers.

### Medium (100 prompts)
Multi-IC subsystems with 2-3 ICs and 10+ components. Motor drivers, sensor interfaces, power management.

### Hard (50 prompts)
Complex system-level designs with 4+ ICs. Autopilots, battery management systems, audio processors.

### Scoring

Each generated circuit receives two scores:

**Static Validation** checks:
- Syntax compliance (valid TOKN format)
- Semantic validity (components exist, pins are real)
- Requirement matching (requested ICs present)
- Completeness (power, ground, decoupling)

**AI Semantic Scoring** uses Gemini 2.5 Flash to assess:
- Would this circuit actually work? (35%)
- Are all necessary components included? (25%)
- Are connections electrically correct? (25%)
- Does it follow best practices? (15%)

---

## Model Comparison (December 2024)

Testing across 7 models revealed substantial capability gaps:

| Model | AI Score | Syntax Valid | Notes |
|-------|----------|--------------|-------|
| Claude Opus 4.5 | 58.9/100 | 100% | Best overall, maintains quality on hard prompts |
| Qwen 3 235B | 49.6/100 | 100% | Best open-source, 20x faster |
| ZAI GLM 4.6 | 49.4/100 | 96.7% | Competitive with Qwen |
| GPT-OSS 120B | 41.8/100 | 93.3% | Decent mid-range |
| Llama 3.3 70B | 35.8/100 | 86.7% | Struggles with complexity |
| Qwen 3 32B | 14.5/100 | 73.3% | Format issues |
| Llama 3.1 8B | 12.6/100 | 80.0% | Knows format, not electronics |

### The Key Insight

**Syntax validity doesn't mean electrical correctness.**

Llama 3.1 8B achieved 80% syntax validity but only 6/100 on correctness. It learned *how to write TOKN* but doesn't know *what a TL072 is*. The model produces structurally valid output with nonsense pin connections.

Larger models succeed because they absorbed electronics knowledge during pre-training. Claude scores 50.3/100 on correctness—the first model to break 50%—because it actually knows that op-amps need feedback resistors and that VCC goes to the power pin.

---

## Why Not Fine-Tune?

With 10,000+ KiCad schematics in the training dataset, fine-tuning seems obvious. It's not.

### The Knowledge Gap

Fine-tuning teaches format, not facts. A fine-tuned Llama 8B would produce perfect TOKN syntax with the same garbage pin assignments. The knowledge ceiling is set by pre-training.

Realistically, a fine-tuned 8B model might reach 28/100 correctness. Qwen 235B hits 49.6/100 out of the box. The math doesn't work.

### Better Alternatives

Instead of fine-tuning, the project explores:
- **RAG-based pinout lookup**: Feed the model IC datasheets at inference time
- **Hybrid verification**: Generate then validate with domain-specific tools
- **Few-shot prompting**: Examples in context work better than fine-tuning for format

The fundamental insight: domain knowledge gaps require architectural solutions, not more training iterations.

---

## Training Data Pipeline

The project includes a comprehensive dataset:

- **287 GitHub repositories** scraped for KiCad schematics
- **4,586 schematic files** collected
- **3,123 successfully encoded** to TOKN format
- **10,088 subcircuits** identified and catalogued

Notable sources include Corne keyboards (6,865 stars), OpenMower (6,299 stars), and hundreds of smaller projects.

Quality scores average 5.9/10, with 523 files achieving 8+ ratings suitable for high-quality training examples.

---

## The Tools

### Encoder
```bash
python tokn_encoder.py input.kicad_sch -o output.tokn
```
Converts KiCad schematics to TOKN format. Handles symbol libraries, hierarchical sheets, and complex nets.

### Decoder (Experimental)
```bash
python tokn_decoder.py input.tokn -o output.kicad_sch
```
Reconstructs KiCad files from TOKN. Currently experimental—round-trip conversion is the hardest part.

### Renderer
```bash
python render.py original.kicad_sch converted.kicad_sch -o comparison.png
```
Generates visual comparisons for validation.

### Benchmark Runner
```bash
python run_benchmark.py --model qwen-3-235b --prompts easy
```
Evaluates models against the prompt suite with automated scoring.

---

## The Scoring Paradox

An interesting methodological challenge: we use Gemini 2.5 Flash (June 2025) to score circuits from Claude Opus 4.5 (December 2025). The evaluator is less capable than the evaluated.

### Why It Works

1. **Objective checks don't need genius**: Syntax validity, component presence, and connection topology are verifiable without cutting-edge reasoning.

2. **Relative rankings hold**: Even if absolute scores are imprecise, the gap between models is consistent. Claude outperforms on every category, especially on complex circuits.

3. **Economics**: Gemini costs ~750x less than Claude per evaluation. At scale, this matters.

The framework prioritizes pragmatism. Absolute scores might be off by 10-15 points. Relative rankings between models remain meaningful.

---

## Results Summary

TOKN demonstrates that:

1. **Token compression works**: 92% reduction without losing electrical information
2. **Format is learnable**: 100% syntax validity from top models
3. **Knowledge is the bottleneck**: Pre-training determines correctness ceiling
4. **Larger models win**: Claude's electronics knowledge translates to 20+ point leads
5. **Fine-tuning isn't the answer**: For domain-specific generation, architecture beats training

The path forward is hybrid systems: large models for reasoning, RAG for datasheets, verification tools for validation. TOKN provides the efficient format that makes this pipeline practical.

---

## Tech Stack

- **Language**: Python
- **LLM Integration**: OpenRouter, Cerebras, Anthropic APIs
- **Scoring**: Gemini 2.5 Flash
- **Storage**: SQLite for training data
- **Format**: Custom TOKN specification (v1.2)

---

**Source Code**: [GitHub](https://github.com/MichaelAyles/tokn)
