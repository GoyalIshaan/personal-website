# N4: native execution qualified, normalization fusion adds little speed

Executed source `69318355a2579995af340c69752e890a490c484f` on two visible
SM103 B300 GPUs in the pinned NGC image. The provider bills the full eight-GPU
node at $32/hour. All343 source archive hashes and both gate manifests were
verified locally after download. Original notebook, v1 and v2 are unchanged.

N passed28/28 executed CUDA tests in48.43s; N2 passed12/12, with no skips or
failures. The primitive PTX/IR receipts were reaudited after download: all eight
FP8/FP4 split/quantizer combinations contain the required native tcgen05
instruction family and no half-precision or emulated FP8-v2 MMA fallback.
This confirms that the CPU-discovered masked-fill and physical-query-tile fixes
work on the deployed stack. Synthetic native AR/SD/standalone SSD and EAGLE
packet/feature/cache tests passed. A trained EAGLE checkpoint was not loaded.

The full down→normalization/packing→QKV boundary used the actual target7B
geometry: input18944, hidden3584, next rows4608, one query. Both paths used the
same four encoded synthetic weight banks, identical schedules,32 operations
per CUDA graph and nine alternating-order measurement pairs. All boundary
outputs and raw residuals matched exactly before timing.

| Measurement | Control | Fused |
|---|---:|---:|
| Median complete-boundary device latency |55.6190µs|55.3360µs|

Ratio of medians1.00511×, or about0.51% higher boundary throughput. Candidate
was faster in9/9 pairs; median paired ratio1.00591×. The absolute median saving
is0.283µs. One small comparison does not establish a robust end-to-end gain.
The option stays disabled by default. No tokens/sec, physical DRAM bandwidth,
occupancy, trained acceptance or SOL measurement was obtained in this batch.

This result changes priority: additional normalization/packing fusion is unlikely
to be the main route to a large gain in this tested boundary. Next measure the
projection paths and pipeline/split schedules, then the complete trained target
and EAGLE request. The CPU static sweep shows a useful experiment: FP8 stage1
can reduce the declared register requirement compared with stage2 for actual
target shapes. That is a candidate for timing, not a reason to promote a plan.
FP4 full-shape schedules also need attention; some have high static register
counts despite zero spills. Synthetic385-wide deployed resource records cannot
be substituted for the actual3584/18944 target shapes.

The CPU-only actual-shape sweep completed384/384 native compilations;
368 survived static resource pruning. Its entire28.7MB evidence archive is saved
separately. CPU wheel/toolchain resource results remain distinct from deployed
GPU measurements. Full matrix, logs and emitted PTX/IR/cubins are preserved.

The node was granted approximately07:24UTC, but assignment was observed only
at07:28:58 after context restoration. The ready batch launched07:29:04 with
a shortened420s work bound to preserve the original07:39 release deadline.
This delay is recorded as wasted allocation time. Future queue monitoring must
avoid long uninterrupted preparation/context work while a grant is imminent.

Run and export both exited0. Export completed07:33:17UTC; node release was
confirmed07:33:42.930167UTC,25.930167s later. Provider verified no active,
pending, queued or held GPU resource, stopped meter and disarmed watch. The
compute upper estimate from the minute-resolution grant is$5.181602; use the
settled charge when available. Process exit was not treated as release.

Evidence: [machine-readable result](N4_GPU_RESULTS.json),
[GPU archive](../evidence/nativeN4-69318355.tar.gz),
[offline compiler archive](../evidence/ssd-native-offline-n2-all-evidence.tar.gz),
[release receipt](../evidence/nativeN4-run-preflight/release-confirmed.txt),
[release proof](../evidence/nativeN4-run-preflight/release-confirmed.png).

GPU archive SHA256:
`5079efd2f615f10748d0461f655f3e00927cb3a991c6fbe0c5ca1c610c5d9fc7`.
Offline archive SHA256:
`a1f218570ef5c887bcdb637f9e800945252ea053b83cbb28d452c7158e964396`.
