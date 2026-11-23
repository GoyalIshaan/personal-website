# J: batches through 512 and one-request TP2 preparation

Historical scope. The user subsequently limited active execution to batch<=32
and short/medium inputs<=4096. [K preparation](SINGLE_REQUEST_FOCUS_K_PREPARATION.md)
supersedes the commands/defaults below. Use J's immutable source archive or
ccf686b5 to reproduce the original J plan; its existing grids remain unchanged.

J is implemented locally and has **no CUDA compilation or execution receipt**.
The CPU checks and syntax validation do not establish GPU correctness or speed.
The last measured result is still I, whose independent HF audit failed. The
original notebook, measured v2 files and all pre-J kernel bodies are preserved.

Local receipts:86CPU tests passed,12CUDA modules skipped;114Python files and
21shell scripts parse, with all10pre-J kernel files unchanged. See
[CPU JUnit](J_LOCAL_TESTS.xml) and [static/hash receipt](J_STATIC_VALIDATION.json).

The user requires 1,000 output tokens/s from **one request on two GPUs**.
Separately, the batch sweep is **1, 2, 4, 8, 16, 32, 64, 128, 256, 512**.
DP throughput, tiny-model timings and short smoke runs cannot qualify for the
pretrained single-request goal. The goal protocol uses the pinned Qwen2.5-7B
target, at least 128 output tokens per request, three timed repetitions, exact
custom-AR output checks and the unchanged independent HF numerical thresholds.
Decode and prefill+decode results have separate goal flags.

## Requested shapes and explicit exclusions

[Full-model grid](J_CONTEXT_BATCH_GRID.json): 280 planned combinations of ten
batches, seven input lengths and four two-GPU schemes. Input lengths are 128,
512, 2,048, 4,096, 8,192, 16,384 and 32,632. The last leaves 128 output positions
plus eight reserve positions within the models' configured 32,768 total context.
Allocated capacity rounds up separately; for example, input128 allocates512.
No RoPE/YaRN change or context extension is hidden in these numbers.

The initial dry run used an optimistic288GiB planning assumption and predicted
eight non-fits. Inspection of I's saved CUDA receipt found274113MiB exposed
(about267.7GiB), with275040MiB in `nvidia-smi`. The corrected conservative
planning default is267GiB, with an additional10%/8GiB reserve. It predicts
**14 non-fits**, not measured OOMs. Execution re-reads actual CUDA byte capacities.
[Initial ledger](J_SWEEP_DRYRUN/ledger.json) is retained as a superseded planning
snapshot; [corrected ledger](J_SWEEP_DRYRUN_CORRECTED/ledger.json) is current.
Kernel grids have no inferred full-model fit status.

[Kernel grid](J_KERNEL_GRID.json): 480 planned one-layer cases, covering the
target and draft, all ten batch sizes, query widths1/4, five projection roles
and the seven attention contexts. Projection rows are not redundantly repeated
for every context. A layer-only case can fit when the full model cannot; it
does not establish full-model capacity. Query width is recorded separately
from independent sequence batch size. The CUDA gates also exercise B512/T8,
which creates4096 projection rows.

The current J model worker implements batched AR, DP2 AR and TP2 AR. **TP2 SD
and batched SSD are pending.** Those requested grid rows remain visible and
selected unsupported rows receive an explicit exclusion. The existing B1 SSD
runtime remains available separately; a width-four kernel test is not proof
of a batched SD/SSD implementation.

## Implemented code and arithmetic

| Path | Purpose and limitation |
| --- | --- |
| `optimized/kernels/batched.py` | General-row projections, fused interleaved gate/up, head top-k, independent-sequence RoPE/KV writes and GQA. Fixed eight-column transposed MMA control; no claimed large-batch optimal tiling. |
| `throughput/model.py` | Independent `[layer,batch,head,capacity,dim]` KV ownership. TP2 shards Q/K/V heads and FFN features. Full base weights retained for reference prefill. |
| `throughput/tp_layout.py` | Pure alignment/range rules. Interleaved gate/up rows are handled as interleaved pairs. Original output/down K-block groups remain intact. |
| `throughput/runner.py` | Graph-unrolled batched AR, per-sequence lengths/EOS, request reuse and explicit scheduled-work accounting. A TP EOS completion vote prevents one rank replaying more collectives after its peer stops. |
| `throughput/collectives.py` | Exact ordered FP32 payload preflight and isolated graph-replayed all-gather timing on one communicator. No extrapolated communication or inference speed claim. |
| `throughput/probe.py` | Tiny/pretrained gates, one-GPU batched control, two-rank TP2/DP2 workers, full tokens/hashes and timing receipts. |
| `throughput/micro.py` | Exact-output CUDA-graph A/B for one projection or RoPE/GQA chain, paired samples and memory. A512MiB sweep-buffer write precedes each sample outside timing; HBM traffic is not counter-verified. |
| `throughput/sweep.py` | Fresh bounded child processes, identity-checked descendant cleanup including detached rank sessions, fit checks and exhaustive unrun/exclusion ledger. Does not release a provider lease. |
| `throughput/audit.py` | Reconstruct results from raw rank outputs and references; reject missing/duplicate/skipped/corrupt receipts, incomplete pairs and tiny-as-pretrained comparisons. |

TP row projections exchange the original four FP32 partial groups: rank0 owns
S0/S1 and rank1 owns S2/S3. Ordered all-gather transports these groups, followed
by the unchanged merge/residual/RMS kernel. This is intended to preserve the
control's rounding order; a mathematical partition argument is not a GPU
equivalence receipt. Ordinary all-reduce and newer symmetric-memory paths are
deferred until their numerical/performance tradeoff can be measured.

TP uses one exclusive GPU per process and one NCCL communicator, matching
collective order during warmup, capture and replay. The initial head stays
replicated. The 7B decoder has56 ordered gathers per token; their launch and
communication costs may erase the benefit of sharding. The preflight measures
the exchange in isolation before full-model graph capture. TP is an experiment,
not a promise of reaching1,000tokens/s.

Prefill currently runs each sequence independently through the preserved HF
adapter and copies its written prefix into that sequence's owned cache. It
uses one reusable full-size temporary KV and includes all prefill time in E2E
latency. It is **not fast batched prefill**. Full base weights and shard buffers
increase prototype memory. Source loading, compile, reference checks and graph
capture are separate setup costs. Better prefill batching, one-time contiguous
gate/up preparation, larger GEMM tiles and reducing TP exchange are next
candidates after the new path passes its gates.

## Numerical and measurement gates

The 23 prepared CUDA tests cover projections up to4096 rows, MMA/vector plans,
interleaved SiLU/BF16 boundaries, stable top-two ties, B256/B512 cache identity,
independent K/V strides, varied positions/query widths, full tiny-model AR,
EOS and request reuse. They are unexecuted locally. TP has an additional
two-rank tiny-model probe with full logits/tokens, ordered exchange, EOS and
reuse checks; the pretrained worker repeats exact logits and full output gates.

Independent HF checkpoints are collected before the adapter consumes the
source model, using the official final-token-only head to avoid an O(context
times vocabulary) long-context logit tensor. Three cached checkpoints at up to
two prefixes use the same maxTV.02, relativeL2.05 and top1 requirements. This
small synthetic audit is not a quality evaluation. Failure stops timing unless
the explicit diagnostic flag is supplied; diagnostic rows remain excluded
from validated model-equivalent claims. No threshold is relaxed.

For pretrained runs, the worker also reruns the **original full-head calibration
HF audit** before accepting qualification. A new synthetic prompt or changed
head shape cannot erase I's known calibration failure. Both the original audit
and the per-context audit must pass. Tiny smoke timings cannot qualify for the
pretrained goal regardless of their measured rate.

Every timed run retains complete output tokens, assignments to deterministic
synthetic prompt patterns, custom-AR references, SHA256 hashes, rank/device
metadata, source hashes, dtype, actual lengths, prefill/decode/total time,
setup/serialization cost and peak allocated/reserved memory. TP replicas are
counted once. DP uses unique request ownership and the maximum rank duration
after a common start barrier. Per-request batch completion latency remains
separate from aggregate output rate.

Exact TTFT is **not instrumented** in the graph-unrolled worker. It records
`first_chunk_available_s`, an upper bound for first-token readiness, and leaves
`ttft_s` null. Instrumented/profiler timings do not enter unprofiled comparisons.
Kernel-only rows never become full-model output-throughput results. Three
repetitions are a starting measurement protocol, not a statistical claim of
a universal optimum.

## Commands and bounded execution

Run from the repository root in a fresh result directory. Planning does not
allocate a GPU or start a CUDA test:

```sh
python -m kernel_lab.throughput.sweep --output kernel_lab/results/j-plan
```

Two already allocated, exclusive CUDA GPUs are required for the bounded run:

```sh
python -m kernel_lab.throughput.sweep --execute \
  --output kernel_lab/results/j-bounded --seconds 300 \
  --cache /cache --diagnostic-allow-hf-audit-failure
```

Default selection prioritizes B1 TP2 and short-context B512/B256 DP2, plus longer
B1 contexts. It also requests B512 short-context and B1 maximum-context GQA
micro cases. The full280/480 grids remain in the ledger; the bounded run is
expected to leave many cases unrun. Modify `--select`/`--micro-select` for later
batches, never silently drop requested large shapes.

`cloud/workspace_throughput.sh` wraps the pinned container, setup/baseline
gates, J tests, model-cache verification/download, sweep and evidence export.
The outer setup/work cap is600s and stop/export adds up to90s. A process timeout
does **not** stop National Compute billing. Explicit release, stopped meter,
no active node and no pending request still need an observable provider receipt.
No J resource has been requested. The existing80USD cap has8.884773USD left
under the conservative reservation; billing settlement remains pending.
Do not fund or change account/security settings for this batch.

I's Mac-lock incident made UI-only release unreliable. A next allocation needs
an available National Compute control surface and a dependable release fallback.
The prepared code and data are reviewable before that operational handoff.

## Reading and next decisions

R025–R027 (Megatron-LM, NCCL capture rules, PyTorch distributed) motivated the
partition/layout and communicator design. R028 (FlashInfer attention API)
reinforces fixed split grouping, stable graph metadata and explicit backend
labels; no FlashInfer dependency or kernel copy was added. R029 (NVIDIA HGX
specifications) prompted checking marketed memory units against the actual
CUDA receipt and avoiding a paper-peak/SOL claim. Links, reading scope and
applied/deferred ideas are in [READING_LOG.md](READING_LOG.md).

First obtain CUDA gates and collective timing, then a same-hardware B1 TP2
measurement and real B256/B512 batch measurements. If exchange dominates,
reduce/fuse communication before extending TP to speculation. If matrix
execution dominates, test a separately gated larger tile/persistent schedule.
Fix the independent HF drift before promoting a pretrained speedup. Optimize
batched prefill before interpreting large-batch E2E performance as serving
capacity. Resume SD/SSD only after their underlying batched/TP AR path is sound.


## Final preflight: provider admission blocks NVIDIA testing

The user confirmed that the Mac could remain unlocked and that they could
release the node directly if control dropped. Native control then reached Grid.
It showed no allocated node or waiting session,30.03USD credits, NVIDIA B300
at8x4USD/hour and AMD MI355X at8x3USD/hour. [Provider admission rules](https://docs.nationalcompute.com/public-research/#asking-marshall)
require the first whole-node hour in available credits, so B300 requires32USD.
The displayed shortfall is1.97USD; this is an admission threshold, not the
planned cost of the bounded run. No GPU request or top-up was attempted.
The CUDA/NCCL source and pinned NVIDIA container need a separate ROCm port for
AMD. Current UI proof is saved in `evidence/throughputJ-preflight/`.

The timeout runner now tracks actual descendants because Torch elastic may
start ranks in separate process groups. It verifies termination before another
case runs; the CPU detached-worker regression passes. psutil7.2.2 is pinned to
the version already present in I's recorded container.

## CPU source staging completed

The immutable source package from ccf686b56cdc695775b0d33b920d1787ee0e76e9 was
uploaded through the National Compute terminal. Its CPU verifier passed all208
manifest file hashes and the ZIP SHA256 at2026-10-22T02:16:34.182019UTC. The
directory is `/data/workspace/ssd-kernel-ccf686b5`. [Staging receipt](J_CPU_STAGING_RECEIPT.md)
links the raw UI observation, screenshot and structured transcription. No
GPU wrapper was invoked, no request was made and no new timing was obtained.
The admission blocker above remains unresolved. The upload is not GPU validation.
