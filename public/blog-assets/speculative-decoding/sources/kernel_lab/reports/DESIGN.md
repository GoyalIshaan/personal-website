# Before implementation: hypotheses and constraints

## Evidence we have

The root `analysis/REPORT.md` contains the completed v2 measurements. Fused 7B AR
was 126.23 end-to-end tokens/s, SD 156.82 on one GPU and SSD 228.77 on two GPUs;
fused 32B AR was 34.73, colocated SD 89.36 and SSD 101.70. These are observations
from that suite, not results from this kernel track. The corrected invariant 7B
backend had slower AR (108.69) despite stronger arithmetic consistency.

The v2 traces still contain thousands of residual/rotary pointwise operations.
Its custom GEMM uses BM=16, BN=64, BK=64 with no split-K; a projection producing
3584 columns has only 56 output tiles, regardless of how many SMs are available.
Attention repeats KV loads per query head, traverses allocated capacity, and uses
separate PyTorch RoPE operations and per-layer cache updates. The head writes
every vocabulary logit before reducing. AR waits for EOS on the CPU every token.
SSD copies a full packed prefix into each scout every round. Counts identify
candidates; they do not establish which one dominates wall time or DRAM traffic.

## Implemented candidates and falsifiable hypotheses

| ID | Change | What it might improve | What can make it lose |
| --- | --- | --- | --- |
| K01 | Fixed split-K small-M MMA; alternate per-query SIMT GEMV | More CTAs for narrow projections; useful memory parallelism | FP32 scratch/merge launch, duplicated X loads, register spills; SIMT duplicates weights across verification queries |
| K02 | Gate/up interleaved weight packing and SwiGLU epilogue | Avoid storing and rereading gate/up when split count is one | Split-K still needs FP32 partials; extra packing memory during setup |
| K03 | Residual add + RMSNorm | One launch and one BF16 residual rounding instead of separate pointwise launches | Large row reductions or launch latency may still dominate |
| K04 | Packed QKV RoPE + direct K/V writes | Eliminate rotate/concatenate/multiply/add/index-copy launch chain | Layout, position, BF16-rounding, and graph hazards require strong oracles |
| K05 | One time-query per CTA, grouped Q heads sharing KV, split KV | Reuse KV across GQA heads, skip future chunks, same schedule at width 1 and 8 | Many CTAs for very short contexts; partial/merge overhead; too many splits |
| K06 | Tiled LM head + local/global top-two | Avoid materializing full logits; deterministic token ties | Head is still weight-bound; reduction and padding overhead |
| K07 | Multi-token AR graph and whole-proposal draft graph | Amortize Python and CPU EOS synchronization | Extra AR work after EOS inside the last chunk; graph setup cost |
| K08 | GPU verifier/commit + compact pinned-host result | Replace multiple scalar reads and EOS token transfers with one packet | Host scheduling and P2P can remain the critical path |
| K09 | Incremental scout prefix mirrors + packed suffix adoption | Change repeated prefix-copy bytes from O(context) to O(new tokens) after initialization | Incorrect validity bookkeeping after rejection/reuse; short contexts may barely benefit |
| K10 | Vendor cuBLAS with a fixed physical M=16 plus custom pointwise/cache/attention/head | Retain tuned vendor matrix schedules while making shape constant | Padding/copy launches, extra rows, vendor behavior still needs width-invariance tests |
| K11 | Target-only top-one head, draft top-two | Skip unused target runner-up reductions and halve ranking scratch | Head weight streaming remains unchanged; actual benefit may be tiny |
| K12 | Submit target commit/result DMA before scout preparation | Remove an unnecessary CPU enqueue dependency from result availability | Scouts can still dominate wall time; earlier packet readiness alone does not prove throughput improvement |

The plan is deliberately explicit, not autotuned during graph capture. Any chosen
linear tile/split plan stays identical for AR and verifier queries. Offline plan
selection must be followed by all numerical/sequence tests and recorded with the
results. Use the same plan for head materialization and token-only selection.

K03 is also folded into projection epilogues: the attention-output split merge
performs post-attention residual/RMSNorm, and the MLP-down split merge performs the
next layer's input residual/RMSNorm (or final norm). Both retain the materialized
BF16 rounding boundaries. Wide gate/up uses split count one by default to enable
its nonlinear epilogue; narrow output/down projections use the split-K candidate.

## Why these kernels before Hopper TMA/WGMMA or quantization

At one to eight queries, weight-streaming arithmetic intensity is only roughly
one to eight FLOPs/byte in BF16, before reuse and traffic effects. A large-tile
persistent GEMM tutorial targets a different regime. Split-K and a bandwidth
oriented vector candidate are concrete first experiments; TMA/WGMMA is a follow-up
if counters show instruction/data movement rather than launch/DRAM limits. This
does not claim that the current MMA schedule reaches Hopper's optimum.

FP8/INT8/INT4 would change the model and numerical comparison. They can be a
separate accuracy-constrained track after a BF16 reference is validated.
Paged/shared-prefix KV would eliminate scout prefix duplication more completely,
but introduces a page table and cache ownership machinery. Incremental mirroring
is the first implementation and retains simple, independently owned graph caches.

## Scope and ownership

Qwen2 full attention, default static RoPE, SiLU MLP, batch one, BF16, inference,
greedy token selection. Dynamic RoPE, sliding windows, training, sampling, tensor
parallelism and concurrent replay of one runner are rejected. Packed weights are
immutable; every active runner owns KV and graph workspaces. Stale future slots
are legal only because attention uses the exact logical query position.

References: [Triton matrix multiplication](https://triton-lang.org/main/getting-started/tutorials/03-matrix-multiplication.html),
[online fused attention](https://triton-lang.org/main/getting-started/tutorials/06-fused-attention.html),
[persistent matmul and TMA](https://triton-lang.org/main/getting-started/tutorials/09-persistent-matmul.html),
[pinned HF Qwen2](https://github.com/huggingface/transformers/blob/v4.57.1/src/transformers/models/qwen2/modeling_qwen2.py).
These are prior art; this project does not claim to invent their algorithms.
