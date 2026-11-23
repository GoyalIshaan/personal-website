# Research C: measured transpose, usable CUDA activity, and small gains

Executed source **cd28274153a71136d5910f290de3f6c6cb24352d** on National
Compute's B300 pool through Helium. The original notebook, measured root sources
and frozen unit-C kernel plans remain unchanged. The candidate is explicit `mma_t`.
The later fusion-D source is a separate, unexecuted candidate.

## Protocol and correctness

The pinned NGC26.06 image, Transformers4.57.1, public model revisions and hashes
match the receipt. Target7B is on device0, draft0.5B on device1. The provider
leases all8 GPUs for $32/node-hour even when the application uses only two.
BF16 reductions use the recorded full-precision policy. AR uses chunk8; SD
uses K2; SSD uses K2/B1. Each generation job runs in a separate process.

* **92 baseline checks passed** in33.91s;16 experimental checks were excluded.
* **16 experimental checks passed** in10.03s, including the transposed primitive,
  rounding, query invariance, stable head ties and top-one/top-two cases.
* All40 synthetic microbenchmark rows completed, producing20 paired cases.
* All6 unprofiled generation jobs completed. All24 timed rows match their
  native AR, and native sequences match between baseline and candidate plans.
* Independent HF audits **still fail**. Target max TV is0.02457046 against an
  unchanged0.02 threshold; all target audit top-one IDs match. The saved target
  audit files are byte-identical across all6 jobs. Draft max TV changes from
  0.04666274 with one top-one disagreement to0.03088046 with none. This is a
  small regression audit, not a model-quality evaluation.

The candidate retains fixed per-query arithmetic and the intended BF16
materialization boundaries. Passing those gates does not make it identical to
HF, nor does matching the target's greedy output validate stochastic sampling.

## Unprofiled observations, explicitly provisional

Two public calibration prompts,96-output cap,2repeats per prompt. Prefill and
decode are timed; model load, audit and graph capture are separate setup costs.
No untouched test set, broad workload sweep or confidence claim is implied.

| Method | Baseline E2E tokens/s | Transposed E2E tokens/s | Observed ratio | Baseline / transposed decode tokens/s |
| --- | ---: | ---: | ---: | ---: |
| AR | 308.833 | 313.439 | 1.0149x | 324.000 / 329.055 |
| SD | 407.584 | 414.067 | 1.0159x | 443.103 / 450.453 |
| SSD | 515.488 | 525.309 | 1.0191x | 572.230 / 583.903 |

**Every comparison is excluded from validated speedups because independent HF
gates fail.** These short observations are useful for engineering diagnosis.
The1.5–1.9% changes are modest; they do not establish peak performance.

The draft projection changes from the frozen SIMT schedule to a transposed MMA
schedule, so this is not a pure transpose ablation for the0.5B model. Across
the4 timed requests, accepted drafts change224/336 to226/332. SSD hits change
80/164 to78/162. Thus SD/SSD differences include altered draft proposals and
scheduling as well as kernel duration. Target output sequences remain identical.
The next hybrid keeps the frozen draft projection.

## Paired microbenchmarks and generated instructions

Five CUDA-event timing samples per case, adjacent baseline/candidate cases,
alternating first variant by role,512MB rotating weight-bank target. Useful
byte arithmetic is not a hardware DRAM counter. See the complete20-case CSV
and raw per-sample data, including all losing cases.

All10 target cases have lower observed median duration, by about0.9–2.7% in
baseline/candidate ratios. Draft gate/up improves roughly5.2–5.6% in that ratio,
and draft head2.6–2.9%. Draft q1 QKV regresses3.192→3.450us; q1 output+norm
regresses3.706→3.990us. Both down cases also regress. A blanket replacement is
therefore unsuitable; defaults and frozen plans remain intact.

All76 saved candidate PTX variants contain legacy `mma.sync`; none contains
`tcgen05.mma`, `wgmma.mma_async` or TMA load instructions. Static instruction
counts are not executed counts or measured SOL. Reducing query-axis padding
does not reduce compulsory model-weight reads. The small measured benefit is
consistent with that bandwidth constraint, but no DRAM counters were available
to prove the bottleneck quantitatively.

## What the profilers actually collected

Systems now creates tiny `.nsys-rep` and SQLite files for both NVTX and full
preflights. Both lack CUDA kernel rows, so the preflight rejects them and skips
the expensive model capture. The NVTX SQLite's `DIAGNOSTIC_EVENT` reveals:
`CUPTI_ERROR_INSUFFICIENT_PRIVILEGES` while enabling activity kind1 and flushing
activities, plus a message identifying hardware tracing. Full capture records
17 CUPTI events but still no kernel table. This is stronger evidence than the
successful process exit. Raw reports and extracted diagnostics are retained.

[NVIDIA's guide](https://docs.nvidia.com/nsight-systems/UserGuide/index.html)
documents hardware HES as the Blackwell default and `cuda-sw` as the software
tracing option. The installed help also supports it. A follow-up source repair
selects `--trace=cuda-sw,nvtx --cuda-graph-trace=node:host-only`; it has not run
on a GPU. No host permissions, security settings or capabilities were changed.
Compute counters were deliberately not retried after B's verified denial.

The Torch fallback **does contain device-attributed CUDA activity**:81,004
events, including31,470 CUDA kernels. Its48-output SSD request has21 rounds,
28/42 accepted drafts,8/20 scout hits, and1,449,984 bytes of local KV-copy
payload. The analyzer isolates the97.663ms instrumented decode using the
prefill and synchronization annotations:

| Device | Kernel events in decode | Traced CUDA activity union | No traced activity | Largest summed kernel categories |
| --- | ---: | ---: | ---: | --- |
| Target0 | 6,006 | 65.489ms | 32.174ms | MMA55.131ms; merge+RMS4.868ms; attention partial2.385ms |
| Draft1 | 23,228 | 67.769ms | 29.894ms | SIMT partial23.181ms; MMA15.496ms; merge+RMS9.528ms |

Target attention partial+merge+RoPE sum4.671ms; draft sum13.438ms. KV-copy host
ranges total1.802ms inclusive. Packet waits include real device work; they are
not all avoidable overhead. CUDA graph launch host ranges sum21.406ms under
instrumentation, which must not be substituted for unprofiled launch cost.
Likewise, summed kernels can overlap; the device union prevents double counting.
The67.1%/69.4% trace-coverage fractions are **not SM utilization, occupancy, HBM
bandwidth or hardware SOL**. The CPU analyzer has independent clipping, overlap,
decode-window and incomplete-trace tests.

These observations motivate a separate fusion candidate to remove RoPE and
single-split merge launches, while retaining matrix-kernel work as the largest
target cost. They do not support prioritizing a large KV-manager rewrite.

## Resource lifecycle and evidence

Provider assignment narration:21:02UTC. It was observed after context
restoration; the wrapper started21:05:00. That approximate3-minute delay is
recorded rather than hidden. The existing540-second bound was retained and
a14-minute reserve was temporarily recorded; the run completed well inside
the original12-minute ceiling. Execution ended21:11:39, export21:11:51,
provider release21:12:17: a26-second export-to-release gap. The provider
confirmed no active node/request, a stopped meter and disarmed watch.

The organization-only archive was downloaded through Helium and SHA256-verified:
`20c73921452314414f64bb493d25881f27db95e879cfce15b40be0b186c9552a`.
Checkpoint3b5426a2-eacc-4d20-977b-24301f45e210;29,266,273bytes. Browser multiple-file
permission delayed the download until after release; it did not extend billing.
Raw data is in `../evidence/researchC-cd282741/`, with a release screenshot and
structured transcription. No model weights are distributed.

The final C ledger could not be refreshed after Helium control disconnected.
Keep its conservative reserve until settlement. A later visible B row corrected
the earlier4.35 snapshot to4.50; the budget journal preserves this correction.
No new GPU request, paid topup or billing change is authorized by account balance.

Next candidate, exact pending tests and commands: [fusion D](FUSION_D_PLAN.md).
Reading-to-implementation lineage: [reading log](READING_LOG.md), with append-only
events in `../history/`. None of the pending work is presented as a measured win.

## Settled billing reconciliation (after control recovery)

The final ended ledger and read-only provider reconciliation give start
21:02:44.763UTC, end21:12:17.208UTC,572.445seconds and **$5.088400**.
This supersedes the partial row and$7.47reserve, both retained in history.
All GPU charges now total$35.659356; historicalMarshall$0.10 gives
$35.759356 spent and$4.240644 remaining under the original$40authorization.
See `evidence/fusionD-preflight/billing-before.txt` and `.jpg`. No new node
was allocated during browser recovery or the user's pause.
