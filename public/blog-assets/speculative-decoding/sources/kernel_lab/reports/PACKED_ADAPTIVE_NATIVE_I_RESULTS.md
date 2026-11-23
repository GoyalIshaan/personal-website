# Systems I: correct independent candidates, small gains, adaptive regression

The survey finished and exported successfully. All155 executed pytest checks passed, all24 timed SSD requests matched their complete custom-AR token references and cross-control inputs/outputs, and eight saved pretrained logit checkpoints match bit for bit. Independent HF audits still fail unchanged thresholds. This is provisional same-backend evidence, not a validated HF-equivalent speedup or proximity-to-SOL result. No default was promoted.

## Measured configuration and scope

Source `fe96e2002cf38c25aef66f3ae98aa8cda1176218`, pinned NGC image and Qwen2.5-7B-Instruct/0.5B-Instruct revisions. BF16 weights/activations, full vendor reductions, TF32 off. Application used CUDA devices0 and1 on a whole8xB300 node. Cache capacity256; fixed control K3; one scout. Two calibration prompts,96 output tokens, two repeats, one fresh process per variant. Prompt order reverses on the second repeat, but variant processes are sequential: tiny differences need interleaved repetitions and untouched prompts before a general improvement claim.

E2E includes prefill and all launched draft/scout work. Decode timing excludes prefill. Model loading, numerical audits, compilation, packing and graph capture occur before warm timing. Token-list serialization is separately recorded. No AR/SD performance ablations or fresh-prompt evaluation ran in this survey; these are not implicitly passed.

| Variant | E2E tokens/s | Decode tokens/s | E2E vs control |
| --- | ---: | ---: | ---: |
| control | 547.348 | 610.850 | +0.000% |
| packed | 549.663 | 614.853 | +0.423% |
| native | 548.137 | 612.916 | +0.144% |
| adaptive | 511.231 | 564.393 | -6.599% |
| combined | 511.928 | 568.210 | -6.471% |
| native-adaptive | 510.235 | 565.295 | -6.781% |

The packed and native deltas are too small to establish a practical general win from this experiment. Adaptive modes are consistently slower on both calibration prompts. The earlier H reserved result used a different prompt set; do not compare its562.624 tokens/s directly with this table.

## What worked and what failed

**Packed storage:** all18 matrix rows were exact, with nine timing samples per row and rotating weight banks exceeding512MiB. Packed layout without lookahead reduced measured complete projection latency by about2.3–2.8%. The selected plan is saved as `optimized/plans/b300-7b-packedI-provisional.json`, an explicit opt-in. The full target adds5,446,303,744 weight bytes (about5.07GiB), retaining original weights for prefill; synchronized packing took13.514ms. That storage cost is material for a0.423% E2E calibration delta.

| Role | Query width | Control us | Packed us | Latency reduction | Lookahead us |
| --- | ---: | ---: | ---: | ---: | ---: |
| qkv | 1 | 8.715 | 8.481 | 2.69% | 10.002 |
| qkv | 4 | 8.827 | 8.587 | 2.72% | 9.992 |
| output | 1 | 9.817 | 9.563 | 2.58% | 11.256 |
| output | 4 | 10.120 | 9.836 | 2.81% | 11.412 |
| down | 1 | 28.932 | 28.232 | 2.42% | 37.198 |
| down | 4 | 29.105 | 28.448 | 2.26% | 36.730 |

**Lookahead failed:** it increased latency about13–29%. Loaded compiled resources report106–107 registers/thread versus32–54 for ordinary packing. Raw Triton spill counts remain0; do not call this an observed spill bottleneck or claim measured occupancy. Lower shared-memory allocation did not make the lookahead variant faster.22 static CUBIN hashes and resource reports were independently rechecked locally.

**Native dispatch:** all six CUDA stream/device/graph-lifetime tests passed, including the multi-GPU speculative path. In the symbolic-prefix microbenchmark, q1 host submission fell15.959→7.596us and q4 fell15.814→7.481us. Completed q1 latency fell24.786→23.473us; q4 fell26.831→24.699us. This is real host-overhead evidence for a tiny symbolic model. The real pretrained SSD E2E change is only0.144%; do not substitute the microbenchmark percentage for inference acceleration.

**Adaptive scheduling failed its performance hypothesis:** across four requests, rounds rose140→146, proposals420→448, and accepted proposals246→248. KV copy payload rose10,469,376→16,121,856 bytes (+54%). Cache hits rose48→54, but that extra reuse did not compensate. Code prompt:24 of33 rounds used K4; systems prompt:25 of40 used K2. The fixed-position calibration estimated target costs2.919/2.929/2.936ms for K2/3/4 and draft costs1.371/2.063/2.725ms. Its geometric acceptance/overlap estimate omitted full per-round/cache-transition costs. These observations support rejecting the policy, not assigning the entire6.6% loss to copies alone. Keep fixed K3 as this experiment's control and adaptive mode off.

## Refreshed H/K3 profile

The saved SQLite contains21,044 CUDA kernel rows. Within the instrumented32-token decode window, duration61.867ms, target activity union35.750ms and target gaps26.117ms; draft activity union46.202ms. These overlap across GPUs and cannot be added as wall-time percentages.

Target gate/up projection is the largest kernel group:15.450ms summed. Output/down projections together account for10.654ms; QKV2.535ms; residual/RMS merge2.841ms; direct attention1.124ms. The draft's largest groups are its vector projection13.696ms and gate/up8.399ms. These ranks identify next experiments, not guaranteed removable critical-path time.

Packet-ready to CPU-return median19.876us; CPU-return to next submission18.799us; CPU-return to next target forward809.151us. The last interval includes dependent drafting. The3.372ms median packet wait includes unfinished device work. More C++ submission alone cannot remove all these gaps. Hardware counters remain unavailable; no SM occupancy, measured HBM bandwidth or hardware SOL result is claimed.

## Numerical boundary

All155 pytest cases executed with no skips:135 baseline,10 packed,6 native,2 adaptive Python and2 adaptive native. The pretrained packed/control gate has eight exact saved logits and16 width checks (two prompts x four widths x two plans). All24 timed96-token requests match their custom AR references. Local CPU analysis rechecks the actual saved tensors, full token lists, hashes, repetition grids, aggregate durations and static CUBIN bytes.

Target max TV remains0.024570463 against unchanged0.02; draft max TV0.046662740, with a top1 mismatch. Packed/native/scheduling changes preserve the custom backend, and do not repair equivalence with HF. Original notebook, frozen v2 root/reference files, and nine older kernel files match their preserved hashes.

## Release incident and cost

Lease: October21,2026,8:03:32.599–8:20:34.232PM Chicago (October22,01:03:32.599–01:20:34.232UTC),17m01.633s. Work ended01:12:49UTC and export01:13:03UTC. The Mac locked and blocked UI control; user unlocked at the later recovery turn. Release occurred3m34.232s after the01:17UTC deadline. This missed the planned cost bound. The exact lease duration at32USD/node-hour implies9.081182USD; the release-time ledger had posted only5.614427USD, so that was partial rather than final. The later Billing page shows69.48USD monthly spend and30.52USD balance (rounded account totals). No topups, settings changes, new or pending node requests.

Provider confirms ended/released, no active GPU, no pending request, stopped meter and disarmed watch. Proof: `../evidence/systemsI-preflight/release-confirmed.jpg`. A shell timeout did not protect billing during UI loss. No next allocation should rely only on that timeout or a pool watcher as a release timer.

Archive38,363,285bytes, SHA256`36527e08494e460ee5975528118bf0ed120b7a27c7501e236a496ae630667efc`, downloaded and verified locally. Organization-only checkpoint`37b4ca25-e1a0-419e-a240-b08db6d06da1`. Raw archive in`kernel_lab/evidence/systemsI-fe96e200.tar.gz`. No SSH was attempted after release.

## New user target and next work

The user explicitly requires1,000 output tokens/s from **one request on exactly two GPUs**. DP aggregate throughput cannot satisfy that. Batch/context sweeps are an additional evaluation track, including batches1,2,4,8,16,32,64,128,256,512 and contexts from short through the current32K configuration limit, with generation/scout reserves. Record unsupported shapes, predicted memory failures, OOMs and timeouts explicitly. Do not claim a long-context or batch result from this C256/B1 survey.

Investigate TP2 target execution with ordered FP32 split exchange before the unchanged BF16 merge, avoiding an unexamined all-reduce reduction-order change. Measure communication before selecting it; simultaneously splitting the target means the draft shares a busy GPU and overlap is not free. Prioritize actual gate/up and draft hot paths; the failed lookahead/adaptive directions stay recorded. Preserve the independent numerical gate and report decode speed, prefill/TTFT and E2E separately. No1,000tokens/s achievement has been measured.

## Reproduce the CPU evidence audit

Extract the nested`node-results.tar.gz` from the verified outer archive into an ignored`node/`directory, then from the repository root:

```sh
python -m kernel_lab.benchmarks.analyze_systems_i --batch-root kernel_lab/evidence/systemsI-fe96e200/node/kernel_lab/results/systemsI-fe96e200 --output kernel_lab/reports/systemsI-analysis.json
```

Machine-readable totals, all matrix pairs/resources, per-prompt timings, policy calibration and limitations are in`systemsI-analysis.json`; scalar throughput CSV in`systemsI-performance.csv`. Historical preparation remains in`PACKED_ADAPTIVE_NATIVE_I_PREPARATION.md`. This report supersedes its pending-execution status.
