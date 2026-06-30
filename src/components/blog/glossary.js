// Curated glossary for the Kevin-on-Kria post, sourced from docs/GLOSSARY.md.
// Scoped to the acronyms a technical-but-not-FPGA reader will want defined on hover.
// Keyed by a short lowercase id used by <T id="..."> in the MDX.

const G = {
  fpga:
    "Field-Programmable Gate Array: a chip full of reconfigurable logic you wire into a custom digital circuit, instead of running software on a fixed CPU.",
  pl:
    "Programmable Logic: the FPGA (reconfigurable) half of the chip, where the custom circuits live. Used interchangeably with 'fabric'.",
  ps:
    "Processing System: the hard CPU side of the chip (the Arm A53 cores), as opposed to the PL fabric.",
  a53:
    "The quad-core Arm Cortex-A53 CPU on the KV260 (~1.33 GHz). The baseline the fabric is compared against, and the orchestrator when the CPU is in the loop.",
  fabric:
    "The FPGA's reconfigurable logic. Same thing as 'PL'. Where the whole model runs here.",
  kria:
    "Xilinx Kria KV260: the ~$250 dev board used here, built around a Zynq UltraScale+ MPSoC (CPU + FPGA fabric sharing one package and one DDR controller).",
  mpsoc:
    "Multi-Processor System-on-Chip: the Zynq UltraScale+ family, which puts the Arm CPUs (PS) and the FPGA fabric (PL) on one die sharing one DDR controller.",
  som:
    "System-on-Module: the plug-in compute module that the KV260 board is built around.",
  ddr:
    "The off-chip DRAM (the board's main memory), ~20 GB/s, shared by both the CPU and the fabric. This shared controller is 'the bandwidth wall'.",
  sram:
    "Static RAM: fast on-chip memory (BRAM and URAM here). Much higher bandwidth than off-chip DDR, but tiny by comparison (~3 MB total).",
  hbm:
    "High-Bandwidth Memory: the stacked DRAM bolted onto datacenter GPUs/accelerators. Fast (terabytes/s) but still off-chip, so weights must be streamed from it.",
  bram:
    "Block RAM: small, flexible on-chip SRAM blocks (~5 Mb total). Holds activations, scratch, and the KV cache here.",
  uram:
    "UltraRAM: the big, wide on-chip SRAM (~18 Mb, 64 blocks). Holds the resident INT4 weight image. Crucially, it is true dual-ported, which enables the two-cohort 'split-brain'.",
  dsp:
    "DSP48E2: the FPGA's dedicated hardware multiplier blocks (1248 on this chip). Each can pack two INT4-by-INT8 multiply-accumulates.",
  lut:
    "Look-Up Table: the FPGA's basic logic primitive. (Also used loosely for a precomputed math table, e.g. for GELU; context disambiguates.)",
  ff: "Flip-Flop: the FPGA's basic 1-bit storage primitive.",
  rtl:
    "Register-Transfer Level: the abstraction (and the SystemVerilog/Verilog code) used to describe the actual digital circuits.",
  axi:
    "The on-chip bus protocol family that connects the CPU to the fabric.",
  axilite:
    "AXI-Lite: the simple register interface the CPU pokes one transaction at a time. Fine for control, too slow to be in the per-token loop.",
  axidma:
    "AXI-DMA: the high-throughput streaming interface, used here to load the weights into URAM at boot.",
  mmio:
    "Memory-Mapped I/O: the CPU reads and writes the fabric's registers as if they were memory addresses, via the /dev/mem device on Linux.",
  devmem:
    "/dev/mem: the Linux device that lets a privileged process read/write physical memory directly, used here to poke the fabric's registers.",
  gemv:
    "General Matrix-Vector multiply. Generating one token at a time makes every linear layer a matrix-times-vector, which is the bulk of the work.",
  gemm: "General Matrix-Matrix multiply.",
  mac:
    "Multiply-ACcumulate: the one-multiply-one-add operation matrix multiplies are built from. The fundamental unit of compute here.",
  pe:
    "Processing Element (a 'lane'): one MAC unit. More lanes means more multiply-accumulates per clock cycle.",
  int4:
    "4-bit integers (16 levels). The weights are stored as INT4, which is what makes the model small enough to fit on-chip.",
  int8: "8-bit integers. The activations are INT8.",
  qat:
    "Quantisation-Aware Training: fine-tuning with the low-precision (INT4) maths simulated in the loop, so the model learns to tolerate it.",
  brevitas: "The PyTorch library used for the INT4 quantisation-aware training.",
  kv:
    "KV cache: the stored per-layer Keys and Values for every past token, so each new token only computes its own position instead of re-reading the whole context.",
  layernorm:
    "LayerNorm: normalises a vector to zero mean and unit variance, then applies a learned gain. A standard transformer building block.",
  gelu:
    "GELU: the smooth activation function inside the MLP. Implemented in fabric as a lookup table plus interpolation.",
  mlp:
    "The two-layer feed-forward network inside each transformer block (expand, activate, project back).",
  softmax:
    "Turns a row of scores into a probability distribution. The fiddliest non-linear to build in hardware, and the one that grows with context length.",
  argmax:
    "Picks the single highest-scoring option. Greedy decoding is just argmax over the output logits.",
  logits:
    "The model's raw output scores, one per possible next token, before they are turned into probabilities.",
  gumbel:
    "Gumbel-max trick: sampling from softmax(logit/T) is exactly argmax(logit + T*noise). It lets the existing argmax hardware do temperature sampling with no readback.",
  fsm:
    "Finite-State Machine: the hardware controller (the 'sequencer') that runs the entire per-token forward pass with zero CPU involvement.",
  sequencer:
    "The in-fabric state machine that drives the whole forward pass (embed, blocks, head, sample, append-KV, loop) autonomously. The thing that turns ~100 tok/s into ~10k.",
  lfsr:
    "Linear-Feedback Shift Register: a cheap hardware pseudo-random number generator, used here to seed in-fabric sampling.",
  toks:
    "Tokens per second. Tokens are characters here, so this is literally characters per second.",
  ttft:
    "Time To First Token: how long from hitting enter to the first character appearing. Dominated by prefill.",
  bitexact:
    "The hardware output matches the software reference to the last bit. The correctness bar before any speed number is trusted.",
  moe:
    "Mixture-of-Experts: a model that only activates a fraction of its parameters per token, doing less work rather than moving memory faster.",
  vivado: "Xilinx's FPGA design suite: synthesis, place, route, and bitstream generation.",
  iverilog:
    "Icarus Verilog: the open-source simulator used for the fast local correctness loop before the slow Vivado build.",
  sta:
    "Static Timing Analysis: the tool's conservative estimate of the fastest clock a design can run at. On this part it is pessimistic by 1.3x to 1.76x versus real silicon.",
  fmax: "The maximum clock frequency a design can actually run at.",
  wns:
    "Worst Negative Slack: the timing margin. Positive means the design meets timing at the target clock.",
  bitstream:
    "The compiled configuration file that programs the FPGA fabric, loaded onto the Kria at boot.",
  roofline:
    "The analytical plot of achievable throughput versus model size, showing where the on-chip advantage gives way to the DDR wall.",
  crossover:
    "The model size (~6.3M params, ~3 MB at INT4) where the weights stop fitting on-chip and spill to DDR, collapsing the fabric's advantage.",
  tailscale: "The mesh VPN used to reach the board, and the wired link from the serving box to the Kria.",
  tunnel:
    "Cloudflare Tunnel: exposes a service to the internet without a static IP or open ports, with TLS and a DDoS buffer in front.",
  worker:
    "Cloudflare Worker: code that runs at Cloudflare's edge. Used here for the stateless load dashboard, kept off the board on purpose.",
  systolic:
    "Systolic array: a grid of MAC units that stream data through in lockstep. The classic matrix-multiply-on-silicon structure.",
  operandpack:
    "Operand packing: fitting more than one multiply into a single DSP by placing two small operands side by side in its wide multiplier.",
};

export default G;
