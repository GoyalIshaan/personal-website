# J plan: one-request 1,000 tokens/s plus batch/context characterization

Written before J implementation. I results and failed hypotheses are frozen at
`5a45b20`; measured runtime source remains `fe96e200`. No J GPU has been requested.

The user explicitly requires 1,000 output tokens/s from ONE request on TWO GPUs.
Data-parallel aggregate output cannot satisfy that. Separately, the user requests
batch sweeps through256/512 and short, medium, long and extreme context tests.
Report decode and prefill+decode throughput separately; count generated output
only, count rank0's TP output once, and never add prompt tokens to output rate.
A single-request goal flag requires batch1 and two participating GPUs. No claim
of meeting the goal exists yet.

## Evidence-driven implementation

1. Add a machine-readable grid for batches1,2,4,8,16,32,64,128,256,512 and
   contexts128,512,2048,4096,8192,16384, plus the current configured maximum minus
   generation/scout reserve. Distinguish input length, allocated capacity and
   total model context. Do not enable YaRN or change RoPE silently.
2. Build independent batched projection/RoPE/GQA paths. The old linear path
   accepts at most eight query rows, and a query-width benchmark is not a batch
   benchmark. Give every sequence its own KV plane and positions. Preserve the
   eight-column arithmetic as a control; larger batch tiling is a separate,
   numerical-gated candidate. Keep original JIT source untouched.
3. Add real batched greedy decode with per-sequence EOS/output accounting and
   complete comparisons to independently run custom-AR references. Initial
   correctness prefill processes sequences individually using the preserved
   HF-compatible adapter; count that cost. Do not call it fast batched prefill.
4. Prototype TP2 for the dense target: shard Q/K/V by heads and interleaved
   gate/up by FFN features; split output/down by the original K blocks. Gather
   the original four FP32 partial groups in rank order, then run the unchanged
   merge/residual/RMS kernel. A normal all-reduce can change rounding order;
   ordered gather is a deliberate correctness-first performance experiment.
   Both ranks use one exclusive GPU and one communicator. Head initially stays
   replicated. Whole-model graph capture requires matching collective order
   across ranks, not a host collective on every layer of every request.
5. Add two-rank forward/greedy correctness gates and collective latency timing
   before speculative integration. TP on both GPUs competes with the draft;
   do not assume the old separate-draft overlap transfers unchanged. EP does
   not apply to this dense Qwen model. Replicated full weights retained for
   reference-prefill increase prototype memory and must be budgeted honestly.
6. The batch/context runner checks per-device peak estimates, records predicted
   non-fits, runtime OOMs, timeouts, unsupported cases and budget skips. All
   requested rows remain in the ledger. Layer microbenchmarks can fit where a
   full model does not; their timings remain explicitly kernel-only.

## Measurement contract

Each row records source/plan/config hashes, actual devices, interconnect, dtype,
method, batch (global and per replica), prompt lengths, capacity, output lengths,
TTFT/prefill time, total/decode duration, output tokens/s, per-request latency,
peak allocated/reserved memory, correctness and exclusion reason. Warm/cold
setup, profiling and unprofiled timing stay distinct. Aggregate throughput is a
separate metric; single-request target flags cannot use batch>1 rows.

Exact single-backend checks and independent HF checks both remain. I still
fails the independent audit, so new diagnostic rows cannot become validated
model-equivalent headline results by changing the tolerance. Context extension
and quantization would be separate experiments, not hidden speed optimizations.

## Execution and credit boundary

The I node is released. Live Billing displayed69.48USD monthly spend; the prior
conservative project reservation71.115227 leaves8.884773 under the80USD cap.
This plan does not authorize more money. Prepare and CPU-validate first. A
next paid batch needs bounded work/export and a release path that does not fail
on this Mac's idle lock; an execution timeout and provider pool watch are not
provider release. Never silently extend a lease to finish the full grid. The
large grid may require multiple future batches and additional authorized budget;
unrun rows are not results.

## Reading and adaptation

- R025: [Megatron-LM](https://arxiv.org/abs/1909.08053), intra-layer head/MLP
  partitioning. Adapt the layout, not the training claim; preserve the local
  four-split arithmetic with ordered exchange. No external kernel copied.
- R026: [NCCL CUDA graphs](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/cudagraph.html),
  uniform capture and replay across ranks; one communicator for the prototype.
  Graph support is not a proof of low communication latency or throughput.
- R027: [PyTorch distributed](https://docs.pytorch.org/docs/stable/distributed.html),
  basic `all_gather_into_tensor`, device exclusivity and output layout. Newer
  symmetric-memory optimizations are not assumed present in pinned2.13.
