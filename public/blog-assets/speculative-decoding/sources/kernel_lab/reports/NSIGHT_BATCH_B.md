# Nsight B: runtime evidence and profiler failures

Source19c95847 ran on an8×B300 node through Helium. All89 correctness checks
passed in39.51seconds. Models, C plans, full-precision vendor BF16 reductions,
K2/B1 and split target/draft placement were fixed. Two calibration prompts,
64-output cap and one repeat produced the following observations:

| Method | Aggregate end-to-end tokens/s | Decode tokens/s | Native-AR sequence equality |
| --- | ---: | ---: | --- |
| AR, chunk8 | 302.46 | 324.74 | Passed |
| SD, K2, split devices | 390.69 | 439.16 | Passed |
| SSD, K2/B1 | 486.38 | 563.78 | Passed |

**These are provisional, profiler-launched observations, excluded from validated
speedup claims.** The independent HF numerical audit still fails. They are
short calibration runs with no held-out evaluation or tuned K/B claim. The
32-output captured requests also matched native AR for all three methods;
SSD's captured request had19 accepted drafts from28 proposals and6 cache hits
from13 lookups, with1,142,784bytes of local KV-copy payload. That is one request,
not a general acceptance or hit-rate estimate.

## What failed and what is being changed

Nsight Systems2026.3.1.117 generated no `.nsys-rep` for any method. AR and SD
returned exit0; SSD's profiler wrapper timed out after67.27seconds even though
the application's captured-result file had completed. Thus zero Systems
timelines exist, and no GPU idle fraction, kernel ranking or measured SOL can
be inferred from this batch. Returning exit0 is insufficient capture evidence.

The new repair performs a tiny capture preflight, requires actual CUDA kernel
rows in exported SQLite, uses an explicit NVTX trigger, and falls back to a
full-process capture if necessary. `--wait=primary` and `--kill=none` explicitly
control helper-process waiting and target termination; the installed help says
the defaults are `all` and `sigterm`. A helper-process wait is a hypothesis for
the SSD wrapper timeout, not a proven root cause. Failed or absent artifacts
receive an explicit failed/incomplete status. A separately labeled Torch
activity trace is available if Systems remains unusable.

Nsight Compute2026.2.0 connected but returned `ERR_NVGPUCTRPERM` on device0.
All20 synthetic matrix primitive checks completed, but no hardware counter
report exists. The state-counter attempt was skipped after that concrete
denial. No container capabilities, driver settings, host profiling permissions
or clocks were changed. The next run focuses on timelines and paired timing;
it does not retry the same restricted counter path.

## Research-informed kernel work

[The reading log](READING_LOG.md) maps papers, blogs and vendor/compiler sources
to adopted and deferred ideas. The opt-in `mma_t` kernel is a separate candidate
using a transposed8-query dot. Frozen baseline arithmetic and C plans remain
available. Its next run records marked experimental tests, paired synthetic
timings at actual model shapes, emitted PTX and unprofiled AR/SD/SSD comparisons.
It is not yet GPU-tested or promoted.

## Release, evidence and accounting

Export completed20:47:48UTC on2026-10-21. The provider console reported release
at20:48:30UTC, ended/released, no active node, stopped meter and disarmed watch.
The final ledger instead ends billing at20:48:12UTC; preserve both timestamps
rather than silently equating the console narration with the billing event.
The ledger records20:40:03–20:48:12UTC (3:40:03–3:48:12PM CDT),8m10s,$4.35.
GPU total:$30.42; historical Marshall:$0.10; remaining project authorization:
$9.48 of$40. No topup or billing setting change occurred.

The11MB evidence archive was published organization-only, downloaded and
SHA256-verified: `451f2794006543ae792d224f4feaa2371803de3e836f0e270bbffa6c61b8a811`.
Checkpoint931249e8-f32d-4fd3-9b3b-10c811dbdb26. Raw logs, model/numerical
metadata, all generation rows, primitive checks and the release receipt are
under `../evidence/nsightB-19c95847/`; the original archive is immutable.

## Later ledger correction

While downloading Research C, a later visible Billing row superseded the
earlier4.35 snapshot:20:40:03–20:48:30UTC,8m27s,$4.50. This matches the console
release timestamp. The previous text and observations remain here for lineage;
the budget journal applies the extra$0.15. C settlement is still pending after
the browser controller disconnected. Treat a live billing snapshot as provisional
until the final row has stabilized; do not expand the user's spending cap.
