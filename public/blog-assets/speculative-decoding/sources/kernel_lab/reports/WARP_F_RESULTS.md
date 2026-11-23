# F: real model timelines, small E gains, and rejected blanket two-warp change

Executed source **1f2b5d41f4f95c08b3eda2fa009aa51a7c2e3071**, all125
manifest hashes verified before allocation. Original/frozen/D/E JIT bodies and
unit-C plan files remain unchanged. Full artifacts are under
`../evidence/warpF-1f2b5d41/`, including the exact compressed provider export.

104 baseline checks passed in33.006s;29 experimental checks passed in18.666s.
All60 matrix rows and20 three-way pairs completed. All126 loaded-resource
queries completed, covering74 distinct binaries. All9 unprofiled generation
jobs completed,36 timed rows. Every row and cross-variant native sequence match.
No default promotion is made.

## Unprofiled short-request observations

Qwen2.5-7B target on cuda0,0.5B draft on cuda1; pinned BF16/full-reduction
stack, K2/B1, AR chunk8. Two43/44-token calibration prompts,96-output cap,
two repeats each. All scout work included. Fresh process per configuration;
model loading, numerical audit and graph capture stay outside generation time.

| Method | Frozen2048 tok/s | Frozen256 tok/s | Direct256 tok/s | Direct over frozen2048 |
| --- | ---: | ---: | ---: | ---: |
| AR | 309.022 | 310.408 | 314.855 | 1.0189x |
| SD | 411.250 | 413.606 | 423.258 | 1.0292x |
| SSD | 515.731 | 520.041 | 528.896 | 1.0255x |

The256 direct control changes only physical capacity and the E flag; it does
not use the earlier E hybrid matrix plans. Comparing direct256 to frozen256
isolates the epilogue; comparing frozen256 to2048 isolates capacity layout.
Runtime request bounds include speculative/scout lookahead. Automatic general
request bucketing is not implemented. CSV includes acceptance/hit totals.

**Independent HF audits still fail.** Every row is diagnostic and excluded
from validated speedups, untouched-test or peak claims. The target maxTV stays
.0245704632 against unchanged.02. The framework/current-backend boundary is
not erased by exact native sequence agreement.

## Cached numerical attribution

At cal-code teacher-forced step2, copying HF's exact cache does not remove drift:
target TV.02448855; draft TV.03086357 with a top-one disagreement. Factoring
the custom operations reproduces the native runtime logits exactly, so the
diagnostic reconstruction is verified on this step. The vendor-all control
reproduces HF exactly for both models, including all recorded layer values.

For the draft, replacing linears alone also gives exact HF values on this step.
The HF top-two margin is0 here: its two best BF16 logits tie. This helps explain
proposal sensitivity, but does not waive the strict gate or prove broad quality.
For7B, vendor linears alone yield TV.02756238 and vendor attention alone
.02456908; both together give0. First local differences appear in layer0
QKV/attention and compound through later layers. Nonlinear-only replacement
does not change this case. This supports current-step arithmetic/reduction
differences, rather than a cache-manager-only explanation. It does not identify
one universal bad operator or establish an acceptable stochastic distribution.

R018/R020 explain why equal BF16 dtype need not mean equal floating-point
operation order. Thresholds and reference implementation were not relaxed.

## What Nsight actually measured

All3 NVTX software captures contain actual CUDA kernel rows: AR10,339,
SD15,938, SSD21,075 across their full capture windows. Kernel-row validation,
capture/SQLite export and both full/decode analyses succeeded. Decode windows
were derived only from verified prefill and three synchronization annotations.
There was no hardware-counter retry or permission/security change.

| Instrumented decode | Window ms | Target activity union ms | Target no traced activity ms | Draft activity union ms |
| --- | ---: | ---: | ---: | ---: |
| AR | 105.822 | 98.890 | 6.933 | - |
| SD | 77.085 | 43.608 | 33.477 | 27.396 |
| SSD | 63.958 | 43.588 | 20.369 | 41.889 |

These are32-output instrumented requests. Activity coverage is not SM
utilization, occupancy, DRAM bandwidth or SOL. Target SSD summed matrix groups
include gate/up18.209ms, output/down13.248ms, QKV3.141ms and head2.228ms;
merge+RMS3.200ms and attention partial1.487ms are smaller. Overlapping sums
rank work; the activity union prevents double counting. Host packet waits
include real GPU work, not just removable communication overhead.

All3 optional `nsys stats` CLI calls returned1: the pre-existing SQLite export
tripped the vendor's timestamp check, which recommends `--force-export=true`.
These failures remain in raw logs. They do not invalidate the actual SQLite
kernel tables or the successful custom read-only analyses. Do not describe the
whole profiling pipeline as error-free. No additional GPU run is needed merely
to regenerate those convenience tables.

## Matrix resources and bandwidth calibration

Two-warp transposed BN64 schedules lose all8 target QKV/output/down/gate cases
against transposed4. They improve target head only about0.2–0.25% and draft
head about0.9–1.3%; draft gate differences are small. Draft projection remains
the same frozen SIMT plan in all3 variants, so its tiny timing differences are
controls, not claimed changes. See all20 rows in `warpF-matrix-triplets.csv`.

Loaded target transposed QKV changes52→72 registers/thread, same36,864 shared
bytes; gate40→56 at18,432 bytes; down48→72 at36,864 bytes when4→2 warps.
Head token-only variant64→128 at69,632 bytes. These resources do not alone
prove the reason for the latency change. The collected binaries report raw
Triton n_spills0, and vendor cuobjdump inspection completed. No measured
occupancy or executed-spill-traffic claim follows. Head case resources also
contain the separate materialized-logit oracle; distinguish those binaries.

2GiB exact-read/copy calibration at unchanged clocks observed7.07–7.35TB/s
useful read-with-block-sum rates and6.91–6.94TB/s read-plus-write copy rates.
These are achieved rates for those SIMT kernels, not physical peaks or inference
SOL. The matrix useful-byte proxy differs by role: gate/head are relatively
close to that streaming calibration, while output/down/QKV leave more room.
The next experiment separates role schedules instead of forcing one projection
plan onto three different shapes. It tests narrower output tiles and split
counts with complete query-width gates; it does not blindly apply two warps.

## Lifecycle

One B300 node; all8 GPUs billed at32USD/node-hour. Assignment UI22:50UTC
(minute precision), launch22:51:14. Profiler discovery22:53:49, baseline
22:53:57, direct model downloads22:54:33, suite22:55:00. Suite finished
23:00:45, outer0/export0. Release23:01:33 before23:04 ceiling; no active GPU,
pending request or watch; meter stopped. Early supervision cutoff was not
needed. Analysis and download happened after release.

The67,485,135-byte export SHA256 is
`d6ebb606ac7eb391af9d4a33609fdc543530bd734a457ecc2d4f767bfd29a4ef`,
verified locally. Organization-only checkpoint1dbe7e36-dc53-4771-a969-8c5c87b265ef.
Retain the7.466667USD reserve until settled. Project cap60USD, not the account
balance; no paid topups or billing/security/clock changes.
