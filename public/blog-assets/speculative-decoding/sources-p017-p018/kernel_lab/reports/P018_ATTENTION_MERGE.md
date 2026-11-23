# P018: smaller head-dimension tiles in split-KV merge

Status:18GPU microbenchmark cases executed. Faster32/64wide candidates fail exact equality at longer positions; retained experimentally, no default change or full-model speed claim.

Hypothesis: P017's fixed131072slot buffer leads to512split merge tensors even early in a request. The existing per-head merge holds a512x128logical tensor in one CTA. Splitting the128head channels into32/64channel tiles may reduce register demand/spills and improve occupancy. This is a hypothesis from code structure, not a measured Nsight diagnosis.

Change: separate experimental `attention_merge_p018.py`, sharing the incumbent partial kernel. Each output dimension still reduces across the same splits; head-dimension tiling may nevertheless change Triton's reduction/layout scheduling, so bit-exact outputs are a gate, not an assumption. Candidate128tile is a structural control. Production dispatch is untouched.

Tests planned:6capacity/position regions,3dimensiontiles; querywidth1/4exact equality against production attention; CUDAgraph timing of8complete partial+merge operations per replay;7interleaved pairs; raw samples, bootstrap paired speedup, registers/spills, PTX/CUBIN hashes. No profiler during final timings. Same allocatedB300, syntheticBF16Q/K/V; no trained model or long-run promotion implied. Qualification at4096capacity/positions127,2047 and131072capacity/positions127,32767,65535,128127.

Reuse the already-qualified provider/toolchain; nativeFP8/FP4 instructions are not changed or exercised by this BF16attention microbenchmark, so do not repeat the full native suite. The worker verifies B300 identity and fails if the benchmark baseline differs from production attention. A bounded480second pair allocation reserves1.94USD; benchmark subprocess280second timeout, explicit host stop and provider readbacks. GPU1 remains idle for inference/timing and is included in cost, not claimed as parallel acceleration.

Provenance: new code adapts our existing `kernel_lab/optimized/kernels/attention.py` reduction; no new external implementation copied. P017 report links source material for context/precision. Record every failed numeric candidate and slower result. Full-model implementation/qualification follows only a measured win.

## Executed results

Run`modal-b300-attention-20261028T224229Z`, source7feff4d, app`ap-baUzSmykDP9W10R7oHbfK2`, B300SM103.18cases executed:10exact and8nonexact.10timed rows recomputed locally from raw paired samples; generated CUBIN hashes and kernel source hashes match receipts. ArchiveSHA256`c9382e5f43e0c72e17527087e4fd11906bdb3f1be5bcbee6c49696803cdee2c9`.

| Capacity | Position | Dimension tile | Exact vs incumbent | Paired speedup |
|---:|---:|---:|---|---|
| 4096 | 127 | 32 | True | 1.065x [1.044, 1.084] |
| 4096 | 127 | 64 | True | 1.068x [1.056, 1.094] |
| 4096 | 127 | 128 | True | 0.969x [0.963, 1.021] |
| 4096 | 2047 | 32 | False | Not timed: numerical gate failed |
| 4096 | 2047 | 64 | False | Not timed: numerical gate failed |
| 4096 | 2047 | 128 | True | 1.003x [0.986, 1.015] |
| 131072 | 127 | 32 | True | 6.402x [6.377, 6.437] |
| 131072 | 127 | 64 | True | 5.525x [5.449, 5.529] |
| 131072 | 127 | 128 | True | 0.782x [0.778, 0.784] |
| 131072 | 32767 | 32 | False | Not timed: numerical gate failed |
| 131072 | 32767 | 64 | False | Not timed: numerical gate failed |
| 131072 | 32767 | 128 | True | 0.776x [0.774, 0.780] |
| 131072 | 65535 | 32 | False | Not timed: numerical gate failed |
| 131072 | 65535 | 64 | False | Not timed: numerical gate failed |
| 131072 | 65535 | 128 | True | 0.832x [0.831, 0.835] |
| 131072 | 128127 | 32 | False | Not timed: numerical gate failed |
| 131072 | 128127 | 64 | False | Not timed: numerical gate failed |
| 131072 | 128127 | 128 | True | 0.870x [0.866, 0.873] |

Intervals are95%bootstrap CIs for paired speedup;7pairs each. Synthetic operation timings, not full-model speed.

At131072capacity/position127,32wide reduces full attention52.86→8.256microseconds (6.402x). Compiler reports incumbent merge32registers/766spills versus32wide159registers/0spills.64wide reports255registers/38spills,5.525x. These resource receipts support the spill hypothesis; no hardware-counter/SOL attribution was made.

Both32/64tiles differ from incumbent at2047/32767/65535/128127positions, with maximum recorded BF16 output discrepancy3.0517578125e-5. A small error is still a failed exact-output gate. The128wide structural control preserves outputs at all6regions but has1200reported spills at131072capacity and0.776–0.870x speedup at later positions. Default unchanged; no universal or workload winner promoted.

Decision: retain as measured experimental candidates. Next: determine the changed FP32 reduction ordering and preserve it, or explicitly qualify a new backend recipe with its own AR reference and complete AR/SD greedy agreement. Do not silently relax an incumbent-equivalence gate. Measure trained end-to-end effects before claiming model speedup.

All candidates, including failures, have content-addressed manifests in`history/registry/p018-candidate-index.json`;4recipes and28run records in`p018-run-index.json`. Missing timings remainnull/absent rather than zero. Shared allocation cost is counted once.

Explicit stop succeeded; refreshed provider receipts show stopped/tasks0/containers[]. Rounded lifetime90seconds gives0.36375USD upper bound. No persistent resource created.
