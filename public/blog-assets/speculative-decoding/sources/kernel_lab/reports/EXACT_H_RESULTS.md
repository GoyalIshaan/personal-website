# H: preserved-output schedules and calibrated speculative budget

Executed source `17e7b46886eab9bef40ea4f2a066d4f886993f3d` on B300,
Qwen2.5-7B target on cuda:0 and 0.5B draft on cuda:1, BF16/full FP32 reduction.
The provider bills an entire eight-GPU node at32USD/hour; the application uses
two GPUs for SD/SSD. These are warm batch-one generation measurements.

H preserves BK128/split4/stages3 and changes only BN64/four-warps to
BN32/two-warps for QKV/output/down. All18 synthetic BF16-bit comparisons pass,
including biased QKV and complete residual/RMS epilogues, two seeds and query
widths1/3/8. All three roles improve in complete paired rotating-weight timings:

| Mean q1/q3 device time | Control us | Narrow us |
| --- | ---: | ---: |
| QKV | 9.048 | 8.712 |
| Output | 10.276 | 10.038 |
| Down | 30.068 | 29.035 |

Nine samples per case,512MB weight rotation,12 timing rows. This is a narrow
tested-domain bit agreement, not a proof for every input. Loaded width-one MMA
shared storage falls36,864→20,480bytes. QKV/output registers52→58, down48→48;
raw driver `n_spills` is0. Sixty resource observations and30 complete CUBIN
reports are retained. These resource values do not measure occupancy or HBM.

The same packed pretrained weights then give bit-identical control/selected
logits at all8 forced checkpoints. Both plans pass query-width invariance.
Cross-control native sequences match throughout all11 fresh-process jobs,
including the reserved pair. All52 timed rows match their native AR reference.
Baseline108 tests pass in34.425s and higher-K two-GPU2 tests in4.442s.

| Calibration, two prompts x two repeats | Control | H, same K2 | H, K3 | H, K4 |
| --- | ---: | ---: | ---: | ---: |
| AR E2E tok/s | 319.504 | 323.483 | - | - |
| SD E2E tok/s | 425.596 | 432.123 | 453.957 | - |
| SSD E2E tok/s | 535.763 | 535.866 | 544.194 | 476.463 |

The schedule alone helps AR/SD modestly; SSD's535.76→535.87 is effectively
flat at this sampling scale. Increasing K is not uniformly beneficial. SSD
K2/K3/K4 has accepted/proposed224/336,246/420,262/520; scout hits/lookups80/164,
48/136,34/124. K4 lowers target rounds168→130 but spends more draft work and
has fewer successful scout reuses. Those observations explain a tradeoff; H
did not acquire an additional timeline proving each component's causal cost.

K3 is frozen using calibration before the reserved pair. Four reserved prompts,
two repeats, maximum96 output tokens, identical256capacity and EOS policy:
control K2 **534.841tok/s**, selected H/K3 **562.624tok/s**, **5.1946% faster**.
These prompts were not used to choose H's tiles or K. This is one small paired
study, not a broad independently replicated performance claim. Per-prompt
changes are0.42%,22.16%,3.94%,1.67%; the aggregate benefit is uneven. Reusing
these prompts for future tuning makes them regression data.

## Numerical qualification

Both control and H still fail the unchanged independent HF audit. Target maxTV
is0.0245704632 versus0.02 allowed; target audited top1 values match. The draft
also retains its prior independent failure. H does not worsen this error, but
it does not solve it. All throughput is explicitly diagnostic/provisional;
`eligible_validated_speedup` stays false. No near-SOL or HF-equivalent claim,
default promotion, production baseline comparison or tolerance relaxation.

G remains rejected even though it printed higher calibration throughput: its
changed split grouping changed target sequences. H fixes that experimental
failure by keeping grouping fixed and verifying actual outputs before tuning.
Earlier F vendor-all arithmetic matches HF; teacher-cache replacement alone
does not repair custom decode. [HF boundaries and next target](INFERENCE_DEPENDENCIES.md).

## Reproduction and evidence

Measured opt-in JSONs are `../optimized/plans/b300-7b-exactH-provisional.json`
and `b300-0.5b-exactH-provisional.json`; their bytes match the executed selected
plans. Defaults and the original notebook are untouched. For the recorded
SSD configuration, use the normal `end_to_end` entrypoint with `--backend kernel`,
`--method ssd --k 3 --branches 1 --capacity 256 --ar-chunk 8 --tokens 96`,
the two plans, pinned revisions and cuda:1 draft. Running it starts GPU work;
diagnostic mode must explicitly retain the failed-HF label.

Derived tables: `exactH-generation.csv`, `exactH-generation-rows.csv`,
`exactH-matrix-pairs.csv`, `exactH-reserved-prompts.csv`, and `EXACT_H_ANALYSIS.json`.
Exact provider tar, nested raw node export, samples, logits, resource binaries,
JUnit, source receipt and screenshot are in `../evidence/exactH-17e7b468/`.
Extracted node contents can be recreated from the tracked raw export.

All140 source hashes verified before allocation. Whole work bound shortened
600→480seconds after a new provider assistant-billing notice; inner protocol
unchanged, no edits on the node. Started23:29:46UTC; correctness23:32:29;
K gates23:33:07; public downloads23:33:14; study23:33:42; completed23:37:09.
Outer0/export0. Released23:37:51UTC before the tightened23:40 ceiling.
No active GPU/pending request, meter stopped, watch disarmed. A billing notice
initially covered the release dialog; dismissed notice then confirmed release.

Archive49,091,706bytes SHA256
`fc65a801d4f756e738bfe67140fc984f2b649df0fe3e4b10f3b2a55f9d44c6cc`
verified after download. Organization-only checkpoint
`5050709c-e64b-4e42-b096-5d2f1a3fa3da`. Duplicate checkpoint13 pane labels
required selecting by exact artifact identity; no data was overwritten.

Final read-only billing reconciliation became unreadable when browser control
timed out. Release was already confirmed and screenshotted. Do not claim a
settled total: F settled, G/H final rows and newly billed assistant charges
remain pending locally. An ended H lease bound592s costs<=5.262222USD. Using
settled pre-G47.755534 + endedG4.248889 + endedH5.262222 + last assistant
session display1.39 +0.50 reserve for the final read gives59.156645USD reserved
under the60USD cap. No additional GPU request, topup or billing changes.
