---
title: "goformer: BERT Inference in Pure Go"
description: "Loading HuggingFace models without leaving Go. No CGO, no ONNX, no Python."
date: 2026-03-08
tags: ["Go", "Machine Learning", "Embeddings", "NLP"]
project: "goformer"
featured: true
draft: false
---

![goformer logo](./logo.png)

*Pure Go BERT-family transformer inference. No CGO. No ONNX. No native dependencies.*

---

I'm porting [Bitwise Cloud](https://bitwise.mikeayles.com), a hosted semantic search engine MCP Server & Claude Code plugin for embedded systems datasheets from Python to Go. The Python backend works fine, but Bitwise Cloud is fundamentally an infrastructure service: it ingests documents, chunks them, generates embeddings, indexes them, and serves queries. That's a server that happens to do some maths. Go is very good at being a server. Single binary, trivial cross-compilation, no runtime to manage.

The problem is the embedding model. Bitwise Cloud uses [BGE-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5) (384 dimensions, 6 transformer layers, 33M params). In Python that's one function call. In Go, every library I found requires ONNX. To get ONNX, you need a Python environment with `transformers`, `optimum`, `torch`, and `onnx`, a non-trivial dependency chain just to produce the artifact your Go binary needs. If the whole point of writing in Go is to ship a single static binary and avoid Python in production, requiring Python in your build pipeline undermines the argument.

I wanted to know: how hard is it to just load the weights directly and do the maths yourself?

## The Standard Approach (And Why It Bothered Me)

The typical workflow for running a transformer model in Go looks like this:

1. Install Python, pip, torch, transformers, optimum, onnx
2. Write a conversion script
3. Export to ONNX format
4. Load the ONNX file in Go via `onnxruntime_go` (which requires CGO and the ONNX Runtime C library)
5. Hope the export didn't silently change something

That's fine for production ML teams with Python infrastructure already in place. It's a non-starter if you want a Go library that someone can `go get` and use without a build dependency on Python.

There are better options than the raw ONNX path. [Hugot](https://github.com/knights-analytics/hugot) from Knights Analytics is a serious project, a full HuggingFace pipeline framework for Go that now includes a pure Go backend alongside its ONNX Runtime and XLA backends. Credit where it's due. But it still requires models in ONNX format, and their own docs describe the pure Go backend as designed for "simpler workloads" with the recommendation to use a C backend for performance. [gonnx](https://github.com/AdvancedClimateSystems/gonnx) is a pure Go ONNX model runner that implements ops generically, benchmarked at roughly 8x slower than ONNX Runtime. [GoMLX](https://github.com/gomlx/gomlx) has a pure Go backend called SimpleGo, but it's a full ML framework where inference is a small part of a much bigger story.

All of these are legitimate projects solving real problems. None of them let me point at a HuggingFace model directory and get embeddings without an ONNX export step.

BAAI publishes BGE-small-en-v1.5 as safetensors. That's the canonical format, the source of truth. The ONNX versions on HuggingFace are community exports with no guarantee they track the official release. The export bakes in a specific opset version, graph optimisations, and pooling configuration. If any of those differ from what you expect, your embeddings won't match the Python reference, and debugging it means pulling up the ONNX graph in Python.

The models themselves aren't that complicated. BERT is an encoder stack: embeddings, some matrix multiplications, softmax, layer normalisation, repeat. The weights are just arrays of float32. HuggingFace publishes them in a format called safetensors, which is a dead-simple binary layout with a JSON header and raw float data at byte offsets.

So I wrote the inference from scratch.

## What goformer Does

Point it at a HuggingFace model directory and call `Embed()`:

```go
model, err := goformer.Load("./bge-small-en-v1.5")
if err != nil {
    log.Fatal(err)
}

embedding, err := model.Embed("DMA channel configuration")
// embedding is a []float32 of length 384
```

That's the entire API. Five exported symbols: `Load`, `Embed`, `EmbedBatch`, `Dims`, `MaxSeqLen`. Everything else is unexported.

Under the hood it does exactly what PyTorch does: parse the tokeniser config, run WordPiece tokenisation, look up embeddings, push through N transformer layers (self-attention, feed-forward network, layer normalisation, residual connections), mean-pool over non-padding tokens, L2-normalise. All in pure Go float32 arithmetic.

The architecture isn't hardcoded to BGE-small. It reads dimensions, layer count, head count, and intermediate size from `config.json`. BGE-small is the reference model I test against, but any BERT-family encoder in safetensors format should work. Models change. The infrastructure shouldn't care which one you use. I haven't tested it with other models, so any feedback on other models would be great!

## Correctness

The question I kept asking was: does it actually produce the same numbers?

Yes. Validated against HuggingFace Python `transformers` on six test cases including unicode, punctuation, and long sequences:

| Test case | Cosine similarity | Max element-wise diff |
|---|---|---|
| `DMA channel configuration` | 1.000000 | 0.000292 |
| `The quick brown fox jumps over the lazy dog` | 0.999999 | 0.000389 |
| `Hello` | 0.999999 | 0.000213 |
| Long paragraph (40 tokens) | 0.999999 | 0.000241 |
| `café résumé naïve` (unicode) | 0.999999 | 0.000211 |
| `Hello, world! How's it going?` | 1.000000 | 0.000199 |

Token IDs match exactly. Embeddings match to cosine similarity > 0.9999. The residual differences are floating-point accumulation order, the maths is the same, the reduction order isn't.

## The Performance Story

It's slower. Meaningfully slower.

| Input | goformer | PyTorch (CPU) | ONNX Runtime (CPU) |
|---|---|---|---|
| Short (~5 tokens) | 154ms | 12.9ms | 3.0ms |
| Medium (~11 tokens) | 287ms | 13.4ms | 4.2ms |
| Long (~40 tokens) | 1.1s | 13.8ms | 8.8ms |
| Batch of 8 | 2.4s | 22.5ms | 17.6ms |

Roughly 10-50x slower than optimised native runtimes. PyTorch and ONNX Runtime use hand-tuned BLAS libraries, SIMD intrinsics, and cache-optimised kernels. goformer uses tiled loops in pure Go, and probably will for the forseeable future, if you're chasing perf, this isn't the package for you.

The bottleneck is matrix multiplication. A single BERT layer does four large matmuls (Q, K, V projections plus the output projection), another two in the feed-forward network, and that repeats six times. Profiling confirms matmul accounts for over 90% of inference time.

There's headroom here. We could do better tiling, SIMD via Go assembly, pre-transposed weights, but it'll never match a native BLAS. That's the trade-off, and it's a deliberate one.

## When This Makes Sense

goformer is not for real-time serving of millions of requests. It's for:

- **Offline indexing** — embedding a corpus of documents where total throughput matters more than per-request latency
- **RAG pipelines** — embedding a query takes 150ms, which is noise compared to the LLM call that follows
- **Edge deployment** — single binary, no runtime dependencies, cross-compile to anything Go targets
- **Build simplicity** — `go get` and you're done, no Python, no Docker, no conversion scripts

For [Bitwise Cloud](https://bitwise.mikeayles.com), the workload is: ingest a few thousand document chunks at startup, then serve search queries at tens per second. At query time you're embedding one short string, which takes 154ms. That's acceptable for an API that's also doing vector search and returning results. For batch ingest, the total time is minutes rather than seconds, but ingest happens once at deploy time and can be parallelised across goroutines.

If your embedding call is not on the critical path, 150ms vs 3ms is irrelevant. If it is, use ONNX Runtime.

## The Interesting Bits

A few things I found worth noting while building this:

**Safetensors is a great format.** Eight bytes of header length, a JSON blob mapping tensor names to dtype/shape/byte-offsets, then raw data. Parsing it took about 80 lines of Go. No protobuf, no schema evolution, no versioning headaches. More formats should be this simple.

**BERT's weight naming convention is consistent but verbose.** Every weight is named something like `encoder.layer.3.attention.self.query.weight`. Once you map those names to your structs, the rest is mechanical. The entire weight-loading function is a sequence of `wm.get("encoder.layer.N.thing.weight")` calls.

**Accent stripping without `x/text`.** BERT's tokeniser strips diacritical marks (é → e). The standard approach uses `golang.org/x/text/unicode/norm` for NFD decomposition, but that's an external dependency. I wrote a manual decomposition table covering Latin Extended-A. It's ugly but it works and keeps the dependency count at zero.

## What's Next

- **Optimisation** — the matmul is naive. Tiling improvements and Go assembly SIMD kernels for amd64/arm64 could close the gap significantly
- **Memory reuse** — pre-allocate workspace tensors and reuse buffers across layers instead of allocating per inference
- **Sharded safetensors** — support models split across multiple weight files
- **[goformersearch](/blog/goformersearch)**, a companion pure Go vector store with brute-force and HNSW search, completing the zero-dependency semantic search stack for the Bitwise Cloud port

---

**Source Code**: [GitHub](https://github.com/MichaelAyles/goformer)
**Package Docs**: [pkg.go.dev](https://pkg.go.dev/github.com/MichaelAyles/goformer)
**Reference Model**: [BGE-small-en-v1.5](https://huggingface.co/BAAI/bge-small-en-v1.5) on HuggingFace