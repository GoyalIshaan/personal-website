> Latest: [H result](EXACT_H_RESULTS.md), [HF boundary](INFERENCE_DEPENDENCIES.md), [F timeline findings](WARP_F_RESULTS.md), and [rejected G](ROLE_G_RESULTS.md). Earlier entries are chronological history.

# Kernel optimization work log

Latest evidence: batch H passed84 tests and matched original-HF prefill exactly
on both pretrained models, including every captured layer, KV entry and output
logit. Cached decode still fails the unchanged2% TV gate. Causal-mask-only and
prompt-partition changes did not repair that remaining drift. All eight leases
are released. The next run is explicitly provisional runtime profiling, with
failed independent audits retained and excluded from validated speedups; width
and native-AR exactness remain mandatory. 17 CPU tests pass. See BATCH_H.md.

## Preserved starting point

The complete prior history is in `../../history/PROJECT_HISTORY.md` (E001–E025)
and its append-only events, with raw runs and failures retained. The root
`analysis/REPORT.md` describes the completed measured release. Tag
`v2-measured-baseline` preserves commit `e801091`; this track is `kernel-sol`.
`../reference_v2/manifest.json` records byte-identical snapshots of the measured
kernel, graph runtime and benchmark sources. The user's original notebook and
the first optimization remain separate under `original/` and `baseline-v1/`.

Prior problems included: slow full-FP32 decoding; acceptance that did not repay
draft/verification overhead; weak GPU overlap; a Python-thread scout attempt that
lost time; batch-shape numerical differences; an insufficient FP32-head repair;
a wrong-current-device custom-kernel launch; and the independent K/V stride bug
that self-consistency tests missed. The corrected BF16 graph release measured
speedups, but did not establish proximity to hardware limits. The optional32B
invariant run remained incomplete after Modal disabled the workspace. Previous
compute was stopped and the temporary weights volume deleted.

## New implementations

This table records the initial prepared checkpoint (`332d24d0`); later execution
and repairs are appended below so the original hypotheses remain visible.

| Component | Code | Current evidence |
| --- | --- | --- |
| Frozen tile/split/role plans | `optimized/config.py` | Static review; tests prepared |
| Split-K MMA, SIMT alternative, fixed-M16 cuBLAS candidate | `optimized/kernels/linear.py` | No new GPU execution yet |
| Fused interleaved gate/up + SwiGLU, token-only top-two head | same | Same-plan materialized-head/tie oracles prepared |
| Split merge + residual/RMSNorm, including across decoder layers | same | Fused-vs-separate exactness tests prepared |
| Residual/RMSNorm and RoPE + direct KV writes | `optimized/kernels/pointwise.py` | Independent BF16-rounding/stride tests prepared |
| Per-time-query grouped-Q attention, future-chunk skipping | `optimized/kernels/attention.py` | Independent SDPA and poisoned-KV tests prepared |
| GPU verification, EOS/cap commit, AR/draft transitions | `optimized/kernels/control.py` | Contiguous-prefix/EOS/output-sentinel tests prepared |
| Packed KV interval copy | `optimized/kernels/cache.py` | Range/sentinel tests prepared |
| Consuming Qwen2 adapter, bounded packing memory | `optimized/runtime/model.py` | Independent HF audit built into run protocol |
| Token-only graphs, AR chunk graphs, early seed packets | `optimized/runtime/runner.py` | Graph/eager, scratch-lifetime, EOS/reuse tests prepared |
| SD/SSD, exact branch seed checks and incremental prefix mirrors | `optimized/runtime/speculative.py` | Prefix-dependent synthetic model and real-Qwen tests prepared |
| Correctness-first micro/end-to-end runners and analytical model | `benchmarks/` | No generated GPU results at this checkpoint |

## Static review decisions and attempts

1. Rejected a single split count for every projection. Wide gate/up has many
   output tiles already; default S1 enables its fused epilogue, while narrow
   projections retain S4 as an unmeasured candidate. Draft S8 is another candidate.
2. Added the vendor M16 alternative so custom Triton is compared with optimized
   vendor schedules, while keeping a constant physical query shape. This remains
   a hypothesis, not an invariance or speed guarantee.
3. Fused projection merges into the following norms after checking the exact
   BF16 boundaries; retained those casts rather than silently changing arithmetic.
4. Replaced full-prefix scout copies with conservative mirror validity. Clamp
   every slot to the actually committed prefix after each outcome; copy only the
   newly shared interval on the next forecast. Keep active proposal tokens separate
   from graph scratch and materialize the last input on full acceptance.
5. Reduced target scalar synchronization to one verifier packet; stage scout
   seed packets before forecast replay on a separate event-fenced transfer stream.
   Fence source reuse on the GPU rather than waiting for the scout's whole graph.
6. Found the padded-vocabulary-size mismatch during source review and added a
   recorded draft input-domain extension; output-head probabilities stay intact.
7. Use generation-config EOS IDs as well as tokenizer EOS, rather than assuming
   one config scalar describes every stop token. Profile paths warm their exact
   output limit before capture to avoid first-time JIT work inside the trace.
8. Deferred TMA/WGMMA-specific pipelines, paged shared-prefix KV, and quantization
   until counters and these correctness gates identify the next bottleneck.
   Deferred is distinct from an attempted GPU experiment or a measured failure.

Python AST parsing found no syntax errors in the initial24 source files and the
three reference snapshots matched their root sources. AST parsing does not import
the modules, compile Triton, or validate CUDA graphs. Later source revisions need
another parse receipt. No new speed number or SOL percentage exists yet.

## Execution authorization changed

The later user message authorizes National Compute testing within $40 and asks
for compute to stop after every test batch. Live inspection found whole8×B300
nodes at $32/hour and no H100 offer. Staging happens before allocation; each
bounded batch exports results and explicitly releases its node. The available
account balance does not raise the user's cap. Old H100 and new B300 results must
not be reported as a code-only speedup. See `GPU_RUN_PLAN.md` and append new events
and actual receipts for every attempt, including compiler failures and release.

## Batch A, B300: first GPU checks and an oracle API failure

Source commit `332d24d0` ran on B300 SXM6 AC, driver580.167.08, Python3.12.3,
torch2.13.0a0+8145d630e8.nv26.06, Triton3.7.0, CUDA13.3, HF4.57.1. This is a
different hardware/software stack from the historical H100 runs.

The fail-fast suite stopped at32passed/1failed in18.89seconds. The32 include7CPU
configuration cases and25GPU primitive cases. The failing head test had already
passed its all-zero-logit tie assertions, then its independent PyTorch oracle
raised `TypeError` at `argsort(-1, descending=True, stable=True)`. This establishes
a harness failure, not a head numerical failure. Later tests did not run.

The repair uses an explicit `dim=-1` in a shared independent oracle, fixes both
the unit test and microbenchmark, and adds CPU tie/stride tests. A CPU test also
checks that extending draft input embeddings preserves a tied output head. These
checks cannot substitute for the remaining GPU tests.

All raw logs, environment, packages, JUnit and completion receipt were copied
off node scratch before release. The exact archive SHA256 is
`00eaae5c0f0ae4fe44951f373e9940b664bef581e6ca9239ba13cd8e20ac5057`, preserved under
`evidence/unitA-332d24d0/`. Provider release was confirmed at03:52:29UTC on
2026-10-21, with ended/released and no active node. The final GPU ledger charge
still needs reconciliation; an early-grant conservative estimate is at most$4.525.

The container pull and UI-controlled grant/export/release added several minutes
around the19-second test. The next batch will expose a foreground completion/export
marker to shorten cleanup latency and bind Triton's cache into the evidence tree
so generated kernel artifacts survive container removal. The microbenchmark's
rotation target increases to512MB for the new hardware family; this is a working
set control, not a claim about measured cache capacity or bandwidth.

## Batch B, B300: numerical checks pass; device-alias guard fails

Commit `b97186dd` reached54passed/1failed in28.33seconds. The shared ranking
oracle repair worked. All primitive tests, the independent tiny Hugging Face
numerical audit, native-vs-chunked AR and tiny-model SD exactness passed. The
remaining symbolic EOS/reuse and SSD mirror tests did not complete.

The first symbolic AR call failed in `Packet.stage`: its tensor reports
`cuda:0`, while the packet retained `torch.device('cuda')`, an unindexed alias.
Those Python device objects compare unequal even when allocation resolves to the
same GPU. This is a runtime validation bug, not evidence of divergent logits.
The repair resolves a packet's CUDA index at construction and takes a runner's
device from its owned KV tensor. A regression case creates a packet with the
unindexed alias on GPU1, switches the current GPU to0, and stages GPU1 data.
That repair is still awaiting GPU validation at this checkpoint.

The workspace wrapper exported all logs and generated Triton artifacts before
release. Archive SHA256:
`ee54e90600358086445d6472f56bbe616f608a119cc9f4df5e7790296e7f2529`.
Release was confirmed at04:12:43UTC on2026-10-21, with no active node. The export
marker appeared at04:12:21UTC: cleanup latency fell to22seconds after export.
The image pull took119seconds. The node has an existing14TB `/mnt/nvme` mount,
so later32B weight storage need not use its much smaller root filesystem.
No disk formatting or machine configuration change was needed.

Prepared next: an11-minute hard subprocess wrapper runs correctness first,
then a large-working-set streaming calibration and a180-second plan sweep only
if the full suite passes. Selection requires every requested role and query
width to pass, keeps one arithmetic plan across widths, and records failed and
incomplete candidates. The new selection exclusion check passed locally;
11CPU checks passed in4.62seconds. These are preparation results, not new GPU
throughput measurements.

## Local follow-up while the GPU is released

Source `87d75ad4` contains the alias repair, streaming calibration and bounded
plan sweep. Its source-only archive was built, but its GPU rerun has not begun.
Dia was being used concurrently; the computer-use tool repeatedly rejected
actions with “The user changed Dia.” No node was requested while reliable cleanup
control was unavailable. The user was asked to leave the compute tab available;
local implementation and review continued without an active node.

The downloaded compiler cache contains224variants targetingSM103, including93
`_mma` variants. Their PTX contains legacy `mma.sync.aligned` operations and no
TMA tensor loads, WGMMA or `tcgen05.mma`. See
`unitB-compiled-artifacts.json`. These are static test-shape artifact facts, not
executed instruction counts, achieved occupancy or evidence of the dominant
real-model bottleneck. Register allocation/spill data is absent from these JSON
files. Counters and streaming timings remain necessary before a TMA rewrite.

Two additional changes are now prepared, still untested on CUDA:

- Target-only top-one head epilogue/merge. AR and verification use only the first
  token; draft scouts retain top-two alternatives. This halves ranking scratch
  and avoids second-max work, while retaining the same matrix arithmetic and
  BF16/lower-ID tie policy. It does not reduce the head's matrix weight traffic.
  New tests compare both head modes to materialized logits, test widths1/3/8,
  and exercise verifier EOS/caps with prediction strides1and2.
- Queue target commit and its compact result DMA immediately after target
  verification, before submitting scouts. The result has no scout dependency;
  this removes a host submission ordering dependency. It does not establish how
  many microseconds, if any, it saves on the actual GPU critical path.

Benchmark configuration now records the actual v2 AR chunk size1; only the new
kernel backend honors `--ar-chunk`. This fixes labeling before any comparison.
The local follow-up passed11CPU checks in4.43seconds and source/shell parsing;
these checks do not compile or execute the changed CUDA kernels.

Billing addendum: the later live ledger showed$4.03 compute for batchA; the
batchB ledger still needs settlement. The conservative remaining authorization
record keeps grant-time uncertainty and a model-usage allowance. No credits
were purchased and billing settings were unchanged.

## Batch C, B300: full suite and component sweep pass

See `BATCH_C.md` for component timings and their limits. Commit `cfef55f8` passed
74tests in33.37seconds and164microbenchmark cases in42.88seconds, with no failures.
This validates the alias repair and the top-one/scheduling changes on the tested
toy models and state transitions. It does not validate every pretrained context.
The selected target plan uses BK128/split4 for shared narrow projections and
BK128 for the head; draft projections select the SIMT candidate. Selected plans
have additional numerical/sequence gates prepared for the next batch.

All evidence was exported with SHA256
`f1045ccfead65d743ea34e171656c41e4b043107a33b6a8e25e520f6ad01a438`.
Release was confirmed05:46:19UTC with no active node. The95-second export-to-release
gap was longer than batchB because browser window changes and stale controls
interfered with monitoring. An unintended checkpoint deletion prompt was canceled;
no checkpoint was deleted. The next controls are located from a fresh named pane.

CPU-workspace prefetch completed separately in154.25seconds. It saved and hashed
the public model assets at revisions recorded in `evidence/model-cache/receipt.json`.
The next job stages and verifies this cache, overlaps image pull with file transfer,
and reuses the compiled B300 cache. A720-second whole-job timeout now includes
staging and execution, followed by bounded export and explicit lease release.
It keeps measured methods sequential and records losing/failed configurations.
The planned9method configurations use the same192-token calibration cases,
three repeats and fixed K2/B1, with an optional separate48-token profile.


## Batch D infrastructure failure and next staging repair

Batch D at source `6be0027d` was aborted before CUDA tests: the 16 GB workspace SSH upload was too slow (674 MiB at a probe after roughly two minutes). The lease ended/released at 06:07:27 UTC; all seven abandoned CPU wrapper/transfer/tail processes were subsequently stopped with scoped SIGTERM. Exact logs and SHA receipt are preserved. [Batch D](BATCH_D.md) explains the direct immutable-Hub download repair and the new 660-second whole-job cap. No pretrained throughput or accuracy result is inferred from this attempt.


## Batch E: direct download succeeds, RoPE device context fails

[Batch E](BATCH_E.md) preserves the exact traceback, source diagnosis and context-only repair. E downloaded and SHA256-verified both models in 28.46 seconds, passed two selected-plan numerical/width/chunk tests, then stopped during GPU 1 RoPE setup. Export and release completed; no new generation timing exists. The next full-suite run tests both the adapter guard and the same original-HF RoPE wrapper used by both benchmark backends. No numerical threshold, kernel plan or measured-root file is changed. The prepared calibration runner remains unexecuted.


## Batch F and the controlled numerical study

[Batch F](BATCH_F.md) records 79 passing CUDA/CPU checks followed by the single pretrained TV failure, with no accepted timing rows. The prepared next study retains the strict thresholds, compares vendor reduction modes at identical prefixes, captures independent HF operator inputs, ranks only strictly passing and width-invariant plans by device-forward calibration, and permits separate numerical-gated generation comparisons afterward. Original baselines remain unchanged; the new benchmark precision policy is explicit.


## Nsight investigation prepared

The user requested real critical-path and kernel-counter profiling. [The focused protocol](NSIGHT_PLAN.md) records each measurement, precision gate, replay/cache policy, explicit diagnostic status, raw export and budget bound. New capture/analysis tests raise the local CPU suite to21 passing, with3 CUDA modules skipped. This work instruments the engine; it does not itself establish a kernel or generation speedup. No new GPU lease has been requested.


## Nsight A: staged, capacity blocked, canceled before grant

[The attempt report](NSIGHT_ATTEMPT_A.md) records verified source staging and the seventh-place2h25min queue. Cancellation was confirmed19:49:33UTC before any grant; no GPU charge or profile resulted. A stale position4 event was followed by a fresh provider check confirming no pending request, no active GPU and background watch disarmed. This attempt adds preparation and infrastructure evidence, not a kernel performance result.


## Nsight B and research C preparation

[B results](NSIGHT_BATCH_B.md) preserve89 passing checks, provisional native-AR-exact timing rows, absent Systems reports and the denied Compute counters. The lease was released and evidence downloaded with verified SHA256. [Reading lineage](READING_LOG.md) records10 sources and adopted/deferred ideas. [Research C](RESEARCH_C_PLAN.md) separates an opt-in transposed8-query kernel from the unchanged baseline JIT and prepares real capture preflights, marked experimental gates, paired microbenchmarks/PTX and unprofiled generation comparisons. Local24 CPU tests pass,3 CUDA modules skipped; candidate GPU execution remains pending.

## Research C executed; trace-driven fusion D prepared

[C results](RESEARCH_BATCH_C.md) record92 baseline and16 experimental GPU checks,
40 successful micro rows and all6 unprofiled generation jobs. Native token
sequences agree; independent HF audits still fail. The transposed candidate
observes1.5%/1.6%/1.9% higher AR/SD/SSD throughput on the short calibration
scope, with draft projection losses and changed draft acceptance retained.
This is a modest provisional change, not a validated peak-performance result.

The Torch fallback supplies real CUDA kernel activities and stage annotations.
The report identifies target MMA and draft SIMT/merge work as large costs and
records the small KV-copy contribution. Systems now produces tiny reports,
whose diagnostic table identifies denied hardware HES tracing. A documented
software-tracing repair is prepared; no host permissions were changed.
The node was released21:12:17UTC,26seconds after export, and all evidence was
downloaded and hash-verified. Final C billing remains pending after browser
control disconnected; conservative budget reserves remain in force.

[Fusion D](FUSION_D_PLAN.md) is a separate opt-in kernel, explicit hybrid plans,
adversarial cache/graph/width/runtime gates, and paired attention microbenchmarks.
It combines RoPE, append and attention without reading concurrently written
current-block cache slots. A one-split path avoids partial scratch and merge.
The draft hybrid retains the prior SIMT projection after C's measured losses.
The13-source [reading log](READING_LOG.md) links each idea and deferred choice.
Local29 CPU checks pass;4 CUDA modules skip. New fusion kernels, software
profiling and hybrid plans have not run on a GPU and are not promoted defaults.

## Fusion D executed; broad fusion rejected; narrower E prepared

Source4f14981a passed99 baseline and9 fusion checks, then all16 paired complete
attention cases. Every output/cache comparison is exact.14 timings lose: all8
target7B cases are24.22–48.33% slower;6/8 draft cases also lose. No runtime
default is promoted and no pretrained D generation/engine gain is claimed.
All losing cases,5-sample timings and32 emitted PTX/IR/CUBIN variants are kept.

The230s conservative whole-job cap interrupted the later software Systems probe;
no repaired trace is claimed. The provider's minute-only assignment timestamp
caused a shorter cap to preserve a450s lease/$4 ceiling. Source/image/setup took
158s before gates. A container EXIT0 after the outer124 timeout was false-green;
new source adds explicit TERM/INT exits and isolated preflight mode. This repair
is prepared, not re-executed. Raw failure receipts remain immutable.

Export succeeded; CPU checksum/exits verified by21:57:52. Release21:58:15: no
active node/request, stopped meter and disarmed watch. The Mac locked afterward;
the download eventually completed and its hash verified locally. Browser numeric
IDs rotated after resets; matching the same Helium extension identity recovered
read-only billing access. No stale or released host was reconnected.

D's current-tile rotation adds dataflow/temporary/layout work.7B variants reserve
69,632B shared memory, but this is not an occupancy/spill diagnosis. R014–R016
record vendor binary-resource inspection, Triton resource collection and warp-
scheduling/buffer-lifetime research. A bounded CPU CUBIN inspector is prepared.

E keeps the materialized RoPE/cache writer and isolates direct normalization for
one physical KV split; larger capacities call baseline. It is explicit and
mutually exclusive with broad fusion. It has9 new GPU gates, a paired benchmark
mode and a dedicated wrapper. It has NOT compiled or run on CUDA. Local checks:
32 passed,5 CUDA modules skipped,66 Python ASTs and all shell scripts parse.
The original notebook, measured roots, frozen plans and prior JITs are unchanged.

The remaining independent-HF decode drift and fair end-to-end comparisons stay
open. This is progress in measured rejection/correctness and experiment control,
not a claim of peak performance. No extra credits are authorized by account
balance. Another paid run needs an adequate verified budget.

## Direct E executed and F prepared

See reports/DIRECT_E_RESULTS.md for all16 paired timings and the verified22-row
software probe, and reports/WARP_F_PLAN.md for the next hypotheses and bounded
execution protocol. E100+9 GPU checks passed; single-split attention improves,
default2048 fallback does not. Released22:39:29UTC before analysis. User raised
total cap to60USD. F local36pass/6CUDA modules skipped; CUDA execution pending.
No defaults or original/frozen kernel bodies changed. Events K064–K069 and
research R017–R020 preserve authorization, lifecycle, rejected alternatives,
actual reading and unexecuted work.

## Warp F measured; role G prepared

F104+29 GPU checks and60 matrix rows passed;3 real model timelines collected.
See WARP_F_RESULTS.md for numerical attribution, all timing/resource outcomes,
3 optional stats failures and release23:01:33UTC. Original/JIT/frozen sources
preserved. Role G adds explicit optional role schedules and complete-bundle
selection, not query-dependent autotuning. Local38pass/7CUDA modules skipped;
15 G GPU gates prepared, execution pending. See ROLE_G_PLAN.md and K073–K076.

## F and G outcomes; H prepared

F source1f2b5d41:104baseline+29experimental pass,60 matrix rows,126 loaded
resource observations, all3 actual software model traces and9 generation jobs.
Blanket2warp BN64 loses. Explicit E/direct256 yields314.86/423.26/528.90tok/s
versus309.02/411.25/515.73 frozen2048, identical native outputs but failed
independentHF gates. Teacher-cache and operator attribution show current-step
arithmetic drift; vendor-all matches independentHF exactly. No tolerance changes.

G source05a53cfc:106baseline+15experimental pass,36 matrix cases and8jobs.
Selected splits/tiles change target sequences and increaseHF error. Reject full
selected plan;325.5/439.0/552.1 observations are diagnostic, not accepted gains.
G released23:18:57.719UTC; all artifacts downloaded/hash-verified after release.

H is prepared with BK128/S4/stages3 fixed. Synthetic exact-bit gates per role,
same packed pretrained weights and independentHF audit, then cross-control full
sequences. Keep draft fixed; separately test K3/K4, freeze calibration choice
before any reserved pair.40CPU pass/8CUDA modules skipped;77AST/17shells parse.
No GPU execution of H yet. The60USD total cap fits one <=7.466667USD H lease
using settledF and a tighter endedG bound. Prior observations remain in events.

## H executed; HF boundary inspection

H source17e7b468 passes108 baseline+2higherK GPU checks,18 exact-bit role
checks,8 same-weight forced-logit checkpoints, width invariance and complete
cross-control/native sequence checks.12 matrix rows,11 jobs/52 timing rows,
60 resources/30 CUBINs. Same-K SSD is flat; calibration K3 is better and K4
slower. Freeze K3 before reserved534.84→562.62tok/s,5.19% on four prompts x2.
HF audit remains failed/unrelaxed; no default promotion or HF-equivalent claim.
Release23:37:51UTC; outer0/export0; archive hash verified. Final billing read
was blocked by browser transport timeouts after release, so settlement pending.

User asked whether HF dependencies cause slowness. Code inspection confirms
HF model.forward/generate are absent from custom decode. Setup/HF reference
is outside warm timing; dense prefill's adapter uses PyTorch vendor operations
and HF RoPE helper. It rebuilds contiguous gate/up weights each request: prepare
once at packing as a future candidate while preserving GEMM layout and exact
prefill. H selected reserved prefill share10.67% includes all prefill work,
not just those copies. Finding documented, not implemented or GPU tested.

## I implemented locally; user deferred GPU testing

User authorized performance priorities1–3 and up to20USD additional compute,
raising the total National Compute cap to80USD. Before implementation, I wrote
`PACKED_ADAPTIVE_NATIVE_I_PLAN.md`. Three separate opt-ins are now implemented:
tile/K-block-major packed projections plus a separate lookahead kernel;
setup-cost/conditional-acceptance-aware K2/3/4 and scout decisions; and an
original C++/CUDA preparation/submission extension using a live PyTorch-owned
graph executable. Existing floating-point JIT bodies and measured root files
were not edited. Prior H/E/G/F source and result checkpoints remain separate.

CPU review corrected policy acceptance accounting, preserved every K's scout
cache ownership across rollback, consumed counted scout reuse before changing
K, and matched packed QKV's merge launch to control. Review also added hard
executed-test receipt checks and complete timed-output/repetition-grid checks.
Malformed or skipped evidence cannot become a passed GPU gate. Fresh prompts
were frozen before new GPU observations and connected to the CLI. No plan is
automatically promoted from a microbenchmark.

A new read-only analysis of the existing F SSD timeline found median17.083μs
from ready packet DMA to CPU return,24.559μs from CPU return to next submission,
and633.190μs to next target-forward span. The last interval includes dependent
draft work; the roughly3ms packet wait includes unfinished GPU work. These
are instrumented F/K2 observations, not an I benchmark or a claim that all
GPU gaps can be removed by C++. H/K3's profile refresh remains first in survey.

Computer-control inventory/documentation requests kept hitting a300-second
transport timeout even after reconnection. No I GPU request was submitted.
User explicitly chose “Finish preparation; GPU testing can wait.” CPU suite:
67 passed,11 CUDA modules skipped. C++ compilation, new Triton compilation,
numeric/scout gates, resource measurements and all I performance remain pending.

New `systems_batch.sh`/`workspace_systems.sh` provide pinned setup, independent
candidate gates, bounded survey/verification phases and evidence export. They
do not release a provider lease: the observed provider release remains a
separate required step, and output explicitly says `LEASE_STILL_BILLING`.
No hardware-counter retries, topups or host/billing/security changes. Detailed
files, limitations and resumption instructions are in
`PACKED_ADAPTIVE_NATIVE_I_PREPARATION.md`; readingsR021–R023 are recorded with
exact scope/inspiration and pending status. No new throughput or SOL claim.

## I executed; kernel micro gains did not yield a large E2E gain

Sourcefe96e200 completed135baseline+20candidate pytest checks,18exact matrix rows, eight exact same-weight logit checkpoints and six complete SSD jobs/24timed rows. Raw archive38,363,285bytes SHA36527e08494e460ee5975528118bf0ed120b7a27c7501e236a496ae630667efc was downloaded and verified. Independent HF audit still fails. Packed layout E2E547.348→549.663(+0.423%), native548.137(+0.144%), adaptive511.231(-6.599%). Tiny positive deltas need broader verification; no default promotion. Lookahead lost13–29% latency, with106–107registers versus32–54, zero raw spills. Adaptive moved54%more KV bytes, used more rounds, and accepted only two extra proposals across four requests.

Nsight H/K3 refresh succeeded; gate/up and draft projections remain main kernel groups, not all gaps are host overhead. The Mac locked during execution; source job/export finished12:49/13:03UTC but release was delayed to01:20:34UTC,3m34after deadline. Actual lease17m01.633s implies9.081182USD versus planned7.466667max. Provider stopped/no requests; no further allocation relying only on UI release. All failures retained in K103–K105 and SYSTEMS_I_LIVE_INCIDENT.md.

User next sets1,000tokens/s from one request on two GPUs, plus batch/context sweeps through512and the native context limit. DP aggregate cannot count toward the single-request target. Preparation/measurement contract follows separately; no1,000tokens/s, long-context or large-batch achievement is claimed. See PACKED_ADAPTIVE_NATIVE_I_RESULTS.md and systemsI-analysis.json for complete evidence and reproduction.


## J implemented: independent batches, exact-order TP2 and exhaustive ledgers

The user clarified that 1,000tokens/s means one request on two GPUs, then added
batch/context characterization through batches256/512. K107 recorded the plan
before code. The implementation now gives sequences separate KV planes and
positions, preserves fixed projection/attention arithmetic, and adds batched
AR with per-sequence EOS and graph work accounting. TP2 shards dense attention
heads and FFN features, transporting original FP32 split groups in rank order
before the unchanged merge. DP2 serves disjoint requests; its aggregate output
cannot satisfy the single-request target. Both remain GPU-uncompiled.

The full-model matrix contains 280 planned rows and a separate layer matrix480.
The first 288GiB capacity assumption predicted8non-fits. Review found I's actual
CUDA receipt exposes274113MiB, so the corrected267GiB default predicts14. Both
planning snapshots are retained. Predicted non-fits, unsupported methods,
runtime OOMs/timeouts, failed gates and wall-budget skips have distinct states.
TP2 SD and batched SSD integration remain pending; no width-four micro test is
presented as their implementation. One-layer capacity is not full-model fit.

New workers retain full tokens/references/hashes, per-rank memory/timings,
source/plan/device receipts, setup cost and complete sample/repetition grids.
TP replicas count once and use the slowest rank duration. Exact TTFT is left
null; first-chunk readiness is an explicitly bounded proxy. The independent
legacy HF calibration audit remains required in addition to per-context sparse
head checks. Tiny/short/diagnostic/aggregate rows cannot validate the goal.
Static review also fixed possible rank-dependent EOS termination and verified
interleaved gate/up shard boundaries with a floating-point cancellation case.

Current prefill is deliberately a serial preserved-adapter control with one
reusable temporary cache; its time and full retained base weights are counted.
It is not fast batched prefill. Ordered gathers and the replicated head may
limit TP speed. These are measured-next hypotheses, not wins. Prepared CUDA
gates, collective-only timing, paired graph microbenchmarks, tiny TP tests and
pretrained checks must pass before performance interpretation. Cloud wrappers
bound work/export but never claim to stop provider billing.

R025-R029 record sources and applied/deferred ideas. No J GPU or new compute
charge was requested. The prior release-control failure remains an operational
blocker for an unattended paid lease. CPU/static receipts and source packages
are separate from GPU execution evidence. See BATCH_CONTEXT_TP2_J_PREPARATION.md.


J timeout review found that local Torch elastic starts rank workers in separate
sessions. Killing only the launcher process group could leak GPU workers.
The runner now tracks process identities/descendants with the same psutil7.2.2
observed in I, terminates/kills detached descendants, verifies cleanup and stops
later cases if cleanup is incomplete. A CPU regression reproduced the detached
worker and confirmed its termination. This is cleanup evidence, not CUDA proof.

After the user confirmed an available manual-release fallback, native Helium
control reached National Compute. Live Grid showed no active nodes or waiting
sessions, B3008x4USD/hour, AMD MI355X8x3USD/hour and30.03USD balance. The provider
requires a balance covering the first whole-node hour: B300 admission needs32USD.
No GPU request was attempted, no credits were bought and no account setting was
changed. The available AMD pool requires a separate port of this CUDA stack;
it is not treated as an interchangeable runtime. J preparation continues locally.

J source package ccf686b56cdc695775b0d33b920d1787ee0e76e9 was then staged in the
CPU workspace. The remote script verified all208 manifest file hashes and the
complete ZIP hash, printing its receipt at2026-10-22T02:16:34.182019UTC. Raw UI
text, screenshot and the reconstructed JSON receipt are retained separately
from performance data. Helium changed to another window while saving the
receipt; control rejected that action, and the existing Window menu was used
to return to National Compute before continuing. No GPU existed during this
interruption. No request, compute execution, top-up or settings change followed.
The immutable source ZIP and Git bundle remain unchanged; staging evidence is
a later documentation commit. See J_CPU_STAGING_RECEIPT.md and K113.


## K: user narrows scope to batch32 and one-request speed

K114 records the user's scope change and plan before implementation. Active
inputs are128/512/2048/4096 and batches1/2/4/8/16/32. The old J grids and
packages remain historical. The runner now prioritizes B1 full-model cases
before all micro and batch work; a one-GPU AR control is added. Stale batch512
and long-context overrides fail before execution. The prepared gate set also
replaces large-batch cases with <=32-sequence, <=256-query-row cases.

The opt-in packed gate/up candidate targets the largest I target-kernel
category. Both old and new paths already fuse SwiGLU; this is a storage-layout
hypothesis, with original accumulation and BF16 boundaries retained. Packing
is explicit after TP sharding; setup time and retained bytes are counted.
AR1/TP2 probes require full same-backend logits/tokens, unchanged independent
HF audits and matching variant/storage receipts. No kernel is promoted.

Focused checks passed24cases. The full local suite passed92CPU tests and
skipped13CUDA modules. There are36prepared CUDA cases, not executed passes.
All10pre-J kernels and original/v1/v2 sources preserve their hashes. A recursive
AST scan initially counted4576saved evidence source copies along with117current
files; K116 records the corrected current-source count. No CPU tests failed.

A live read-only Grid refresh still showed30.03USD, no node and no waiting
session. The first B300 hour requires32USD. No GPU request, new GPU charge,
top-up or settings change occurred. The under-one-hour request is met for
implementation/local verification/packaging; measured speed still needs GPU
admission and1,000tokens/sec remains unachieved. R032 records reviewed official
Triton/NVIDIA material. See SINGLE_REQUEST_FOCUS_K_PREPARATION.md and K receipts.


K117: source64129e5 and its218-file package verified locally; source/history
archives retain hashes and are immutable. CPU upload was attempted but no K
success marker appeared. A coordinate retry was rejected, and the browser
subsequently showed a different window. The old J receipt was not counted as
K upload evidence. K staging remains unverified; GPU request/execution is zero.
Code, checks and package are complete within one hour; no new speed is claimed.


K118: the user reported added credits and authorized the bounded single-request
run with immediate provider release. The local64129e5 ZIP and all218manifest
entries were reverified. Native control initially returned another Helium
window, then Window-menu selection, read-only app inventory and native app
selection timed out at30/30/45seconds. Reconnect was requested before any GPU
allocation. Live balance and remote K staging remain unverified. No new GPU
compute cost or performance result exists. The prepared pass prioritizes B1
TP2/control/packed at128 and2048tokens, preserves all numerical gates, caps
work at600seconds and export at90seconds, with a grant-relative14minute
provider release deadline. The latest quote and admission must be rechecked.


K119: after the user's reconnect, native reading resumed and Billing confirmed
35.03USD available,5USD deposited by the user,69.97USD month-to-date spend and
B300 rate4USD/GPU-hour. The credit blocker is resolved. Marshall navigation
updated the URL but retained Billing content; reload attempts did not restore
the workspace. Both browser-extension inventories timed out. Native reading
recovered again, but window selection was rejected because Helium changed.
The user was asked to hard-refresh NC and open the existing CPU terminal
manually. No GPU was requested or executed, remote K staging is still
unverified, and no GPU cost/timing result was produced. Raw billing AX proof
and a structured control receipt are retained under singleK-run-preflight.


K120: manual terminal recovery exposed a real workspace pane and/data/workspace
prompt. The Window menu ignored keyboard Escape but its documented AX Cancel
action succeeded; terminal2maximized successfully. The pwd input attempt was
then rejected with The user changed Helium. A fresh observation showed the
lecture PDF with audio playing. The user was asked to keep NC active and
Helium unused during a bounded15minute control window, or report automatic
switching. No GPU was requested, no remote K source hashes were verified,
and no new GPU cost or performance data was produced.


K121: funded-run source64129e5 remains ready and unchanged. Three additional
Window-menu input attempts were rejected with The user changed Helium, despite
fresh native readings and an explicit AX Raise action. No new terminal command
output, K staging receipt or resource-state confirmation was obtained. Public
provider documentation was rechecked: request/release still go through Marshall;
job completion does not release the lease. The pending follow-up asks for a
stable NC window without Helium interaction, or clarification if it switches
without user input. No GPU was requested/executed, and no new GPU cost or
performance result exists. See K_FUNDED_RUN_CONTROL_CHECKPOINT.md.


K122: after the user left Helium on NC, a new CPU shell executed pwd and
printed/data/workspace. The full K paste produced no observed stage marker.
Further small paste/key tests stalled; a replacement shell was created, but
reliable command execution did not return. AX/pixel state briefly differed;
a coordinate action failed with windowNotFoundAtPosition, and rebinding the
controller did not restore typing. A direct AX value set showed pwd in the
textarea without confirmed shell output. Grid navigation changed the URL;
reload then left the page body blank. The cause remains unresolved. A manual
page/terminal check was requested; no GPU was requested/executed.

A CPU-only transport workaround now reuses348959bytes from the hash-verified
J ZIP to reconstruct the exact unchanged516117byte K archive. Compressed
transport is159327bytes, with217821bytes in the generated paste script.
The applier ran locally twice (including idempotent reapplication), reconstructing
the exact ZIP and verifying all218manifest files each time. This improves
staging preparation only; no remote staging or GPU improvement is claimed.
Generator: cloud/prepare_stage_delta.py. Receipt: K_DELTA_TRANSPORT_LOCAL_VERIFICATION.json.


K123: user confirmed manual page/terminal operation works. Native input still
stalled and followed another window. A direct binding to the existing NC tab
1970686594 through registered browser2 succeeded; no new browser/profile/login
was created. Tab-scoped input returned K_CONTROL_OK/data/workspace. The smaller
delta then staged immutable source64129e5 at/data/workspace/ssd-kernel-64129e54.
Remote receipt at03:41:17.486UTC verified the exact ZIP and all218manifest hashes.
The previous browser inventory timeouts did not imply direct URL binding would
fail; using the existing tab avoided native window-focus dependency. Read-only
Marshall quote/resource preflight is pending. No K GPU request/execution yet.


K124: live provider preflight confirmed no active/pending/held node, stopped
meter, disarmed watch, available35.031599USD, B3008GPUs at32USD/hour and32USD
admission. Original Marshall session counter rose4.1836to5.2696USD, so retain
the1.086USD display delta conservatively in project reservation (now72.201227
under80USD). A new control session reduces future context cost; Full Access
was not enabled or changed. Before any allocation, narrow the planned lease
to720seconds/6.4USD with540second work/setup,90second export and90second
launch/release margin, plus1USD future control reserve. Launch the same
immutable K source via workspace_e2e.sh with SSD_INNER_BATCH=throughput_batch.sh
and SSD_JOB_SECONDS=540; do not use the600second convenience wrapper. All six
B1 cases and numerical gates stay selected; budget-unrun cases remain explicit.
No GPU request/execution yet. Provider preflight raw/structured receipts saved.


K125: exactly one B300 request was explicitly confirmed. Node160.211.49.7
was assigned at03:45UTC (minute precision). Fresh-session CPU verification
again passed all218hashes and confirmed the retained compiler-cache seed.
The exact six-B1 selection launched at03:46:31UTC using the540second wrapper
override. Billing is active at32USD/hour for8node GPUs; only2application
GPUs are exposed. CUDA execution and timings are not yet verified. Conservative
release deadline03:57UTC (10:57PM Chicago Oct21), work-abort checkpoint03:55UTC
to leave export/release time. New-session counter0.4202USD fits the1USD control
reserve. Combined planned reservation79.601227USD stays below80USD. Explicit
provider release remains mandatory; no held/replacement/follow-up request.


K126: K finished03:52:48UTC, exported03:52:53UTC with both exit codes0,
and was explicitly released03:54:11.239507UTC (10:54:11PM Chicago Oct21),
168.76seconds before the conservative deadline. Provider verified ended/released,
no active/pending/held node, stopped meter and disarmed watch. Export-to-release
latency78.239507seconds is retained as operational overhead. No node was read
after release. Exact9316667byte archive SHA256c0a892f53200572f9a6e33c4e5d3047a8926ff48b3664a88d2083cff817b4b5b
was published organization-only, downloaded and safely extracted locally
(10outer/1397inner members). Source receipts agree on64129e5/218entries.
Fresh-session final counter0.6809USD. Node cost estimated4.366573to4.899907USD
from minute-precision assignment, not a settled charge. Baseline160passes,
new gate batch36passes; TP2tiny wrote exact-output receipts but timed out at80s,
so all4pretrained TP2cases were excluded. Two AR1cases and3micros produced
results; full local duration/token/numerical audit follows before claims.


K127: local audit rebuilt six AR1 timing rows and 42 micro samples from the
hash-verified K archive. AR1 E2E 313.753/295.397 tokens/s at128/2048 inputs;
independent HF qualification fails (2048 maxTV0.245209, two top1 mismatches).
TP tiny compute passes do not override exit124; four pretrained TP2 cases were
blocked. K projection cat and B1 attention stack add control-only copies;
packing also changes the backend relative to the frozen control. Micro ratios
are recorded as confounded graph-chain observations, not pure packing gains.
No new SD/SSD row, default promotion, 1000tokens/s or SOL claim. Full report:
SINGLE_K_RESULTS.md. Original/raw source and all failed attempts preserved.


K128: before L implementation, recorded the graph ownership/reset plan and
matched micro controls in L_LIFECYCLE_AND_MATCHED_CONTROLS.md. R033/R034
reading lineage appended. No new allocation, arithmetic or gate relaxation.
CPU lifecycle/receipt tests and pending CUDA gates will remain distinct.


K129: L implements explicit graph ownership/reset before group destruction,
partial-capture ownership, temporary-gather cleanup, no retained graph-mode body
closure, and rank-specific untimed lifecycle/watchdog diagnostics. Success is
published after teardown and new sweeps require complete lifecycle receipts plus
normal process exit; the 80s tiny gate remains. Packed gate/up now uses actual
unpacked linear_batched as control, with versioned backend/copy contracts. B1
single-part concat/stack copies are removed from the legacy adapters. Wider
assembly costs remain labelled. Eight default B1 AR1/TP2 control/packed cases
at128/2048 replace the optional DP defaults; batch<=32 remains available.
Local outcome113CPU passes,13CUDA modules skipped;123Python and21shell parses.
All12K kernels,10pre-J kernels and original/v1/v2 hashes preserved. Historical
K six model/42micro sample audit replayed successfully. No L GPU execution,
new speed or numerical fix is claimed. F's existing arithmetic attribution is
relevant to investigating K's medium-context drift but does not prove its cause.


K130: committed L source4d15ec2 and packaged565452bytes/234manifest files.
Exact ZIP SHA78dd7f89bfd0386a680895ee74723f4ed0cef757df38b2fa50296f640771b855.
Transport delta first/idempotent applications and git bundle verify passed.
No L upload or GPU request. Fresh Billing navigation read28.64USD available,
76.36monthly spend and76.26selected-window spend; per-K settlement is not
isolated. A daily-row expand action timed out before dispatch; no new Marshall
prompt/control charge or account mutation was sent. Saved Billing AX/screenshot.
Account is3.36USD below32USD B300 admission; conservative current project cap80
leaves2.217966USD. Prepared concrete L artifacts before requesting an additional
10USD authorization (proposed90total); authorization is pending, not inferred.
No top-up or security/billing setting change by the agent. K remains released.


K131: answering the user's run-interpretation question, re-inspected saved
per-step HF audits rather than running another GPU test. At both128/2048inputs,
prefill final-head distribution TV=0. Cached C2048 step0 TV0.011137/top1same;
step1 TV0.245209 and step2TV0.160851 change top1. Frozen chunk256 means
step0position2047 has8activeKV splits and step1position2048 activates split9.
This is a testable boundary association, not proof of an attention/cache bug.
Next diagnostic should compare identical HF inputs/KV across255/256,511/512,
2047/2048positions and current-step operator/reduction differences. The existing
short-context F attribution does not settle this long-context case. No source,
numerical threshold, active GPU allocation or measured performance changed.


K132: recorded realistic1,000single-requesttokens/s strategy before any new
architecture change. Recomputed older I raw384outputs/140rounds:2.742857emitted
per4.490231ms decode round,610.850decode/547.348E2E (failedHFqualification).
Current K3max4emissions means acceptance alone cannot reach1000atthatoldroundcost.
Need~1.637xdecode/~1.827xE2E. Priority bets: actual branch-batched SSD scouts
(current slot loop serializes proposals), shallow target-conditioned drafting,
and low-M MLP projection kernels. Optional quantized-target track needs separate
reference/quality qualification; draft quantization keeps BF16 target semantics
under exact verification. R035-R042 primary-source scopes/limitations logged.
EAGLE+SSD self-conditioning, Qwen2.5v1checkpoint patch/acceptance limits, DFlash
model-support gap, SM103low-MFP8 candidate and late megakernel risk documented.
No code, precision default, budget authorization, GPU lease or measured result
changed. L's previously packaged source remains immutable/unexecuted on CUDA.


K133: user explicitly accepts precision changes with same greedy AR/SD/SSD
outputs. Recorded M plan before implementation. New precision targets use
exact within-backend width/full-token gates and separate BF16 quality reports;
historical strict BF16 failures remain unchanged. No wider paid authorization.
Start compressed weights and independent references, then low-M kernels and
shared-trunk parallel scouts. Trained draft integration needs explicit feature
and vocabulary contracts; native FP8/W4 execution is separate from W8A16/W4A16.


K134: implemented deterministic E4M3 W8A16 and own packed E2M1 W4A16 formats;14 CPU format tests passed. Added register-dequantized fixed-plan MMA/vector projections, fused SwiGLU and ordered residual/RMS integration, plus a target adapter retaining canonical BF16 dequantized prefill weights with explicit memory receipts. Added shared-trunk/private-suffix RoPE, split-KV GQA, selected-suffix adoption and a single branch-batched scout graph. The branch transition is fused into one kernel across scouts; no prefix copy or serial per-scout model loop. These CUDA bodies have not compiled/executed here; no speed, exactness or quality claim. R043-R045 read scopes and failed old documentation URLs are logged. No GPU requested, budget unchanged.


K135: pinned EAGLE3 ff17dda64a036cf5bd7bc56c0ab728325f1c0d0b config and1472byte Safetensors header with public bounded HTTP ranges, no tensor payload. Resolved architecture discrepancy using actual shapes:7KVheads, QKV input2H, feature FC3H and32K draft head, separate norms and vocabulary mapping. The4KVhead model-card value is not used for implementation. Older cnets1 architecture was a mismatched reference; cnets.py matches shapes. Feature/token shift, mapping values and SSD self-conditioning still require dedicated integration checks. No generic HF adapter substituted, no trained-draft performance claimed.


K136: completed M local implementation checkpoint.165 CPU tests pass;15 CUDA
modules skip (not GPU passes);135 Python modules and22 shell scripts parse.
27 new two-device CUDA cases are prepared, plus source/toolchain/capability-bound
certification, paired compressed/materialized low-M micros and B1 short/medium
AR/SD/serial-SSD/parallel-SSD worker/auditor. Every repeat needs full AR tokens;
quality/numerical comparison to original BF16 remains separate. Weight loads
keep the existing .cg policy to avoid a cache-policy attribution confound.
Default vector draft plan stays intact; an explicit global MMA draft candidate
can test branch weight reuse without silent query-count dispatch. Retained
canonical BF16 weights and quantization setup/memory costs are reported.
Public EAGLE integer/boolean280064-byte payload audit confirms d2t is offsets,
not absolute IDs; metadata/payload hashes and ABI/feature tests are saved.
No BF16 checkpoint tensor downloaded; trained-draft alignment/runtime and SSD
self-conditioning remain unfinished. Native W8A8/FP4 MMA also remains pending.
Original input/notebook,7 v1 files,3 v2/reference files,12 K kernels,4 oldruntime
files and immutable L ZIP hashes are preserved. A relative sibling-archive
locator initially failed locally; absolute-cwd retry verified the archive
before any pass receipt was written. Plan/report/readings and failures remain
versioned. M has no CUDA execution, upload, resource request, new GPU spend,
new throughput or default promotion. Cap80USD unchanged; proposed90USD and
fresh account admission funding still await the user.


K137: committed M source779d58a, packaged684689byte ZIP with SHA256
ffeb7a14db0ede60c49c14ece0ad0ed19c9ecdafd136f02d2b0604ebebc79974.
Independent temporary extraction verified270 manifest entries and149 critical
certification inputs. Packaged M suite52 CPU passes,2 skipped CUDA modules.
Incremental source bundle verifies and explicitly requires parent1f5620a.
No upload/staging, CUDA run, new GPU request/spend, performance result or default
promotion. No genuine M CUDA certificate exists. Budget/admission pending.


K138: user explicitly answered the pending L budget question with "Keep GPU
testing paused". Recorded the pause for all project GPU testing/execution,
including L/M. Do not allocate or spend credits until explicit user resume.
Cap stays80USD; proposed90USD is not approved. Source779d58a, saved packages,
local validation and previous run evidence are unchanged. No GPU request,
credit purchase, new compute cost or provider action in this pause turn.


K139: user explicitly requests continuing native FP8/FP4 kernels and EAGLE
drafter integration locally while keeping GPU testing paused. Recorded N plan
before edits. No paid compute, CUDA run, resource allocation, upload, credit
purchase or cap increase. Native instruction proof and trained-draft/full-output
GPU qualification remain future gates, not results of local CPU preparation.


K140: implemented native-format rowwise globals, FP4 scale swizzle, CPU decoded
operand algebra,10 passing CPU format/row-independence tests, native FP8 dot
and FP4 dot_scaled candidates, activation quantization and fused epilogues.
The FP4 recipe uses row globals, not a silent M weight-only reuse. Physical
query tiles are fixed8(FP8)/32(FP4); compiler legality and wasted-row cost are
unmeasured. Added opt-in Qwen wiring and instruction proof auditor. No CUDA
compilation/execution, BF16 fallback/native claim, GPU request or speed result.
R050-R053 exact read scopes and failed source lookup are logged.


K141: implemented shifted EAGLE CPU layer/reference/controller and exact initial
width-one AR seed.10 CPU EAGLE checks pass, including raw feature capture,
existing prefill math/KV compatibility at1/7/19 tokens, full tiny-Qwen greedy
SD, forced rejection/acceptance, cache repair, EOS/reuse, and token-only forecast
hits/misses. Five CPU protocol checks pass; synthetic PTX fixtures are only
auditor tests, not native execution evidence. Added raw target-feature CUDA
wrapper, per-graph feature-buffer ownership, fused token/feature norm+join and
mapped proposal transition, captured proposals/forced refresh and headless
repair. EAGLE shifted prefill needs only its one layer's QKV, so its unused
attention/MLP/head is omitted. Native draft roles are explicit and retain
canonical BF16 prefill weights. Downloaded only pinned LFS metadata (zero BF16
weights), pinned full717798344-byte file SHA256 for future local loader.
CUDA bodies and prepared exact native/feature/full-output gates remain entirely
uncompiled/unexecuted. SSD self-conditioning is a serial CPU oracle, not a
claimed overlapped CUDA EAGLE implementation. GPU pause/cap80USD unchanged.

Next local experiment, recorded before code: fuse each activation row's amax,
scale calculation and packing into one kernel as an alternative to the
existing two-pass quantizer. This removes one launch per projection but uses
only1CTA per query; low occupancy/register pressure may outweigh launch savings.
Keep both as explicit frozen plans; do not select by query width or promote
either without resumed GPU code/bitwise/latency checks.


K142:202 local CPU checks pass,17 CUDA modules skipped. Added one-launch
row-fused quantization alternative; both modes are frozen in NativePlan and
identity hashes. No row-based schedule switching, GPU legality or speed claim.
Shifted EAGLE prefill now computes ONLY feature FC, norms and K/V projections;
three independent CPU cases exactly match full reference KV while leaving
future cache poisoned. Added a7-KV-head CPU geometry case. Prepared28 real
CUDA cases and eight emitted-code proof slots; default gate CLI prints a
CPU-only plan. Receipt validator rejects partial/skipped/changed-source code,
missing/modified instruction artifacts and synthetic-to-trained relabeling.

Before next edits: replace host tensor/list emission in the GPU SD path with
one four-int64 metadata packet per round, reuse the existing GPU verifier,
serialize outputs once after synchronized decode, and queue fixed K+1 raw
feature transfer while metadata reaches the host. Keep the simpler controller
as an oracle. Copying all verification features trades bandwidth for fewer
serial dependencies; measure that tradeoff after explicit GPU resume. The
initial exact AR token and every headless repair still count. This is EAGLE
SD, not a claim that forecast-based EAGLE CUDA SSD has been implemented.


K143: completed local N source and validation checkpoint.202 CPU cases pass
(37 new N),17 CUDA modules skip;154 Python files and22 shell scripts parse.
Added separate EAGLE GPU SD packet controller: one metadata packet per round,
initial exact AR seed/EOS handling, one final output serialization, fixed
K+1 feature-copy payload and explicit headless true-feature repair. Its future
full-output cases include both controllers, every-row feature buffers, native
target/draft combinations, EOS/cap/reuse and close guards. None executed here.
Prepared28 CUDA cases/eight instruction proof slots; no genuine N certificate.
Original/user notebook,7 v1 files,3 v2 root/reference files,12 K kernels,4 old
runtime files and immutable L/M ZIP hashes all pass preservation. EAGLE CUDA
SSD overlap, real checkpoint loading/acceptance, native compilation, low-M
latency/occupancy and all speed claims remain open. No new numerical or
compilation failure is observed on CUDA because no CUDA ran. Report records
two-pass/fused-quantizer occupancy tradeoff, native-vs-BF16 oracle boundary,
feature-copy overhead, per-width graph ownership and remaining host packet
latency. No upload/allocation, provider UI action, GPU spend or cap change.

Pre-commit refinement: the packet controller now owns/reuses its GPU workspaces
and has an idempotent close method. Output views retain the request cap when
passing the GPU verifier. Final diff hygiene caught an extra EOF blank line in
the new prefill helper; removed before commit. Syntax checks pass; these GPU
refinements remain unexecuted. No change to the202 CPU/17 skipped result.


K144: committed source5bccd15 and packaged N as756625-byte ZIP,
SHA25681913e70dfc64a217856bf1fd5f2950479b4eb41287db12e9363a99533552e6d. Independent temporary extraction verified
297 source-manifest entries and169 N critical inputs; packaged N checks37 CPU
passes/two CUDA modules skipped. Incremental Git bundle verifies and explicitly
requires parent6dba220. No uploaded/staged N source, CUDA compilation/execution,
real pretrained checkpoint run, native instruction certificate, speed result,
provider action or GPU spend. EAGLE CUDA SSD remains unfinished. Pause/cap80USD
persist. The implementation and package reports distinguish completed local
code, reference evidence, prepared GPU gates and open performance questions.


K145/K146: user resumes GPU testing, approves90USD total and then explicitly
raises the total cap to120USD. Updated the live budget/control state; prior
pause records and source/package receipts remain historical. New conservative
headroom42.217966USD against prior77.782034 reservation. Fresh authenticated
Billing now shows38.64USD,4USD/B300/GPU-hour, auto-reload off,10USD user deposit
today. No agent credit purchase or GPU request. One app inventory call timed
out; native Helium selection worked but focus changed during navigation.
Browser2 extension connection now reads the existing Billing tab directly,
without changing the user's lecture window. Verify node/release control and
stage source before allocation. First run ceiling remains8USD of compute at
last known32USD/8-GPU-node-hour, with exact live grant/deadline before launch.


K147: resumed live preflight reports no active/pending/queued/held resource,
stopped meter, disarmed watch,38.639126USD balance,8xB300 node at32USD/hour
and32USD admission. Provider status carries03:56:55UTC as-of; local log UTC
is later and is kept separate, not used to invent a lease timestamp. Provider
confirms no15-minute maximum/auto-release option. Prepared first resumed batch:
900s grant-to-release ceiling8USD,660s whole setup/work,90s export and150s
release margin. Added native_batch_n.sh to the existing bounded launcher and
export path; gate child450s, fail-fast at first CUDA failure, explicit full
vendor BF16 reduction/TF32-off inside the child. Native math is unchanged.
37 targeted CPU tests pass and launcher syntax checks pass. No GPU requested.
Add-terminal click produced no pane/no console error; asked Marshall to open
a CPU terminal and check only cwd/UTC/staged K ZIP/JIT seed. Source staging
and reliable workspace command input remain to be established before renting.

CPU staging access resolved: Marshall created a CPU terminal and verified
/data/workspace plus the K ZIP and C JIT archive. The terminal panes were
hidden by the maximized Marshall console. Restoring the layout exposes them;
direct browser-scoped terminal4 input executes pwd correctly without changing
the user's lecture window. This was a pane visibility issue, not a daemon
failure. Whole local suite still202 passes/17 CUDA-module skips after bounded
launcher and fail-fast/full-reduction preparation. GPU not yet requested.

K148: reconstructed source201d193d on CPU workspace; all304 manifest files and ZIP SHA verified. Explicit receipt records no GPU requested/executed. Known Marshall display delta0.4413USD reserved separately. Launch readiness checks precede exactly one bounded B300 allocation; compute ceiling8USD and total project cap120USD.

K149/K150: requested exactly one B300 node after304-file CPU staging and
launch-prerequisite verification. Request approved but queued fifth, estimate
1h55m (not guaranteed), at32USD/node-hour. A read-only alternative check found
no immediately available NVIDIA SM100/103-equivalent offer under that rate.
Cancelled the queued request through the explicit Release confirmation to
avoid an unattended later auto-assignment. Provider cleanup receipt at
2026-10-22T06:24:58.017648UTC confirms cancellation BEFORE assignment, no active/
pending/queued/held node, no hold/resources,0USD/hour and disarmed watch. No
GPU compute charge, CUDA execution, native compilation, trained EAGLE run,
performance feedback or measured improvement. Marshal session display rose
from0.6809 to1.6550USD; reserve0.9741USD control delta, not0USD total cost.
Latest reported credit38.197908USD may lag control settlement. Source201d193d
remains staged; no paid worker was launched, and no ended host was reused.
Total cap120USD persists. Report N_GPU_ATTEMPT_1.json contains evidence links.

K151: user explicitly instructs keeping the GPU queued while optimizing locally, then testing on assignment and releasing immediately. Exactly one B300 request requeued, position6/estimate1h50m, watch armed, no assigned node or GPU burn. Total cap120USD persists. Before edits, documented N2 normalization/native packing fusion hypothesis, strict rounding/equality/performance gates and rollback boundaries. Read sources R057-R059; source201d193d remains launch-ready and immutable.

K152: implemented separate opt-in N2 fused normalization/native packing and encoded projection adapter. Original N optimized/test files and source ZIP hash-preserved. Full local suite231passes/18CUDA-module skips;29newCPU checks and12preparedCUDA checks. Added source/toolchain/precision-gated full-boundary paired timing and bounded N+N2 cloud batch. Static review corrected embedded-Python else64 typo and a nondistinguishing timing fixture before any GPU run; no GPU failure inferred. Larger one-CTA live vectors may spill or reduce occupancy, so no default promotion or speed claim. B300 remains queued under explicit user direction; assignment not observed.

K153: packaged N2 sourcee033491a,798742bytes/SHA53374dd303aea6c5773fe4265758d27b21c4c498bbeead19c4f8718fad77f93a. CPU delta transport reconstructed and verified all318files at06:41:36UTC; subsequent N2_LAUNCH_READY marker confirms shell syntax/JIT seed. New N179/N2180critical source hashes match package. Queue advanced6to5, watch remains armed; no node assigned.

K154: CPU workspace Python3.11.2/x86_64; Docker CLI exists but daemon socket absent, so no daemon/settings change. Isolated official Triton3.7.0 installation succeeds. Explicit-target SM103 compilation of staged e033491a finds masked FP8 data/scale tl.load other=integer0 cannot cast int32 vector to fp8e4nv. No CUDA driver initialization, GPU execution or throughput claim. Preserve run1 evidence; change only FP8 masked-fill literals to0.0 then recompile fresh CPU source snapshot. Real vendor GPU gates remain required.

K155: original staged N/N2 matrix finishes14/22offline compile passes,8/22failures; all eight projection cases fail masked float8 loads. Change four FP8 data/scale fill literals0to0.0. Fresh source snapshot SHA5a4cc445f778508b0bc77d6fd7d21e1c3381712f3c10c0db93da020fe3e46357 compiles22/22cases, including native FP4/FP8 projection modes and fused128-bit-compatible row epilogues at3584/16384. No CUDA executed; official wheel equivalence to NGC not assumed. Old e033491a package remains immutable but its compiler issue is now superseded by this local fix; stage a new source before GPU launch. Queue remains position5/watch armed, no assignment observed.

K156: static emission audit reveals22compile passes do not mean22native paths. All4FP8 projection variants emit f16.f16 MMA; all4FP4 variants emit tcgen05 mxf4nvf4 block16. Pinned3.7 Analysis/Utility supportMMA requires result tileM%64=0,N%16=0; physical-query8 missesv5, and AccelerateMatmul documents FP8v2 emulation onSM100. Plan fixedFP8physical16 and BN64/128, retain max_num_imprecise_acc0 and exact per-row/full-output gates. Tighten proof to requirev5 FP8 and reject all half-precision/virtualv2 fallbacks; do not weaken native gate to count emulation. No GPU test or speed result.

K157: fixedFP8physicalqueries16 and BN64/128 with max_num_imprecise_acc0 unchanged. New CPU matrix22/22compiles; all4FP8 projection modes nowemit tcgen05 f8f6f4 withoutF16. Proof rejectshalf-MMA andvirtualFP8v2 onSM100/103. Full local suite234passes/18CUDA-module skips.22ptxasresourceprobes report0spills; FP4S1tinyregs231..233 vsS4singleKblock54 cannotextrapolatetorealQwen. ThreeFP8reassembledcubins differ, keptauxiliary; compiler shared requirementsdistinctfromstatic0. No GPU or speed result. Stage correctedsource beforegrant.

K158: corrected source63c35fd9 staged/verified331files; N3_LAUNCH_READY at06:57:21UTC. Queue advances5to4, estimated1h30m/watch armed/no assignment. Before further edits, plan384CPU static schedules at actual7Bgeometry. Found unexecuted N2synthetic micro usedEAGLEF14336 withtargetqkv4608; correcttoexisting targetF18944 before any GPU measurement. This was never a measured row. Keep drafter7KV/F14336 distinct fromtarget4KV/F18944.

K159: Qwen-target boundary geometry now derivedfromGEOMETRIES7B (H3584/F18944/qkv4608/gateup37888); activation quantizer CUDAgate includes18944. RealGPU native instruction cases save actual compiled-driver resourceattributes beside separateproof. Packagingincludes numberedN2/N3/N4receipts. Full local236passes/18CUDA-skips. CPU384case sweep running; first85compile/nativeproofpass,81resourceeligible, no timing/planpromotion. Queueadvances4to3/watcharmed, GPUunassigned.

K160: N4source69318355 staged343files; N4_LAUNCH_READY07:08:37UTC. Queuenow1, watcharmed/noassignment; modelcounter2.9106USD vs0.6809snapshot reserved ascontrol, notGPU. N5trainedEAGLEsingle-request benchmark plan recordedbeforecode. Keep launched firstqualification source frozen/ready; newpreparationmustnotdelayassignment.


N4 assignment/launch: approximately07:24UTC grant, observed07:28:58UTC after context restoration. Launch07:29:04UTC source69318355. Shortened wholejob420s plus90s export, release by07:39UTC; no waiting for unfinishedN5. Two application GPUs on8GPU billed node. No result/promotion yet.

N5 local preparation: pinned target/EAGLE byte-verifying fetcher, same-precision AR/EAGLE full-output worker, separate originalBF16 point audit, all-width logits/rawfeature checks, EOS/reuse, complete-row validation, synchronized graph cleanup. Cloud wrapper runs N/N2 first; skips trained phase if prefix exceeds150s, otherwise a single240s budget covers download/hash/setup/gates/timings. NativeN4 already running remains unchanged. Broader local suite(kernel_lab/tests plus root tests)300passed33CUDA skips; no trainedCUDA qualification or speed result.

N4 GPU feedback:40/40CUDA passes; all8native instruction receipts validate against frozen69318355 source. Complete down→QKV pair55.619vs55.336µs (~0.51% gain), tiny benefit, stays optional. No trained EAGLE/tokens/sec or SOL claim. Both evidence archives downloaded/hashverified. Explicit release07:33:42.930167UTC,25.93s after export; no resources/meter0. Read N4_GPU_RESULTS.md for full limits and next priorities.

N5/N6 implementation: all4 real-weight target roles get actual-width native instruction/resource/decoded algebra/exact row gates plus isolated packing+projection timings. N5 adds explicit native stages1/2 with distinct target identities and phase progress; future cloud batch runs stage2 then1 under one360s asset/model allowance, subordinate to660s worker and90s export. Broad local suite318passes33CUDA skips;172Python/25shell parse. No trained GPU work/default promotion. Account31.112547USD before finalsettlement is below32USD admission, so no queued request. Exact nativeN4 duration543.639s implies4.832347USD expected total (4.350418 settled partial); conservative minute upper5.181602 retained. Current control4.2548, project reservation86.537535/120USD pending settlement.

N6 source09bfc458372cfb6e68f0d687f774ddc918242ee7 committed, immutable895551byte archive e36309457bee13dc175bce0cb771f03f08025846f72aec6f71a31b8b723a8456. Staged in freeCPUworkspace;360hashes verified twice, launchreadymarker and seed/prerequisites checked. NoGPUrequest; admission remains below32USD. N6_PACKAGE_RECEIPT.md records exact runnable source and release limits.

Status review2026-10-22: re-read current N4/K evidence and N5/N6 launch receipts. No new execution or live billing refresh. Native qualification40passes and the0.51% synthetic boundary gain do not establish a new full-modelTPS record or SOL. Last recorded account31.112547USD before final settlement blocks32USD admission; project cap120 remains distinct. Priorities: staged real-shape stage1/stage2 plus trained EAGLE; then qualified full-targetFP4 and measured head/transfer costs; trained EAGLE CUDA SSD overlap is still unfinished. Revisited official EAGLE3 abstract and Triton warp-specialization tradeoffs; recorded exact reading scope in research.jsonl. No new gain promised.

National Compute CLI/API investigation: verified official Public Research lifecycle is Marshall-only; SSH supports job execution and transfers, already used by workspace_e2e.sh behind browser terminal. Official OAuth MCP and REST exist for supported billing/market/VM/Kubernetes surfaces. Direct Mac SSH and MCP have not been set up. No credentials copied, access changes, allocation or performance test. Details: NATIONAL_COMPUTE_ACCESS_OPTIONS.md.

Two-GPU provider review2026-10-22: official Bitdeer VM tables advertise total starting rates H100SXM2=4.72USD/h, H2002=5.522USD/h, B2002=9.38USD/h. Prefer B200 for existing SM100/103 native work; Hopper needs a separate backend. Rejected Hyperstack per-GPU multiplication because relevant SXM/Blackwell catalog entries are eight-GPU. Stock/topology/billing minima and new-provider access remain unverified. No allocation, purchase or new performance result. See TWO_GPU_DEVELOPMENT_OPTIONS.md.

Provider alternatives2026-10-27: Verda B200spot3.60/GPUh gives estimated two-GPU7.20/h conditional on live quote/stock; CLI lifecycle verified in official docs, spot may evict without warning. Beam singleB200from4.11/h is component-only candidate; pair unverified. Runpod/Lambda current published B200 prices do not improve existing shortlist. Recorded price-page conflicts rather than treating stale marketing rates as quotes. No allocation/spend/test.

Beam quickstart2026-10-27: installed0.2.233/browserOAuth/credit20USD; exact app.py CPU VM printsHello from your VM!, exit0. First attempt exposed SDK context=None credentialprompt; reused saved login locally on stdin without changing exact app. VM independently verified stopped9seconds after creation; disk retained. MCP registered/freshstdio116tools; active Codex tools require reconnect. See BEAM_QUICKSTART_SETUP.md. NoGPU qualification.
