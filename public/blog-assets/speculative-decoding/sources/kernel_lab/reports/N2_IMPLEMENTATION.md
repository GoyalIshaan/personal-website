# N2: normalization-to-native activation packing

The opt-in candidate is implemented locally. Full local suite: **231 passed,
18 CUDA modules skipped**. N2 adds 29 CPU checks and 12 prepared CUDA cases.
There is no N2 CUDA compilation, native instruction receipt or speed result.
The original N optimized code/tests and source ZIP are hash-preserved.

`kernels/native_fused_norm.py` adds fused residual/RMS+pack and ordered native
split merge+residual/RMS+pack candidates. They retain explicit BF16 projected,
residual, normalized and learned-weight boundaries. Row globals, block16 E4M3
scales and low-even E2M1 nibble rounding follow N. RMS uses the same flat
reduction width/warp policy. An encoded-input projection consumes packed data
through N's unchanged native MMA and ordered split merge.

`runtime/native_fused_norm.py` exposes a separate `FusedNormNativeQwen` adapter.
Internal output/down normalized values directly feed native gate/up or next
qkv. The first embedding RMS, last head boundary and standalone branch scouts
retain original N dispatch. EAGLE target capture still receives raw residuals.
Eligible fused widths are multiples of128,128..16384; unsupported boundaries
retain the original path. This remains an explicitly selected experiment.

Prepared CUDA checks compare raw residuals and encoded data/scales/globals
against original N's actual CUDA composition, both quantizers and split1/4.
They cover every-row independence, encoded projections/SwiGLU, complete greedy
AR/SD/serial and parallel standalone SSD, EOS/reuse, and raw EAGLE features and
packet SD against original N target AR. CPU composition tests are not a
bit-exact oracle for CUDA RMS reduction. A failure blocks timing.

`native_boundary_micro_n2.py` times the complete two-projection boundary using
the exact same encoded weights, schedules and explicit rotating bank count.
Control/fused samples alternate order. Both paths include first input packing,
projection, ordered merge, residual/RMS, next input production and next
projection/SwiGLU. Output and raw residual must match exactly. Paired ratios,
ratio of medians, raw CUDA-event and host-wall samples remain separate. Bank
rotation is not proof of measured HBM traffic. No request tokens/sec is inferred.
It requires actual matching-source/toolchain N and N2 gate receipts.

The new bounded cloud batch runs N's28 original gates first, then N2's12 gates,
then one B1 FP8 down-to-qkv paired microbenchmark, stopping on failure. It uses
the same pinned container and two visible GPUs. The outer660s setup/work limit
supersedes inner330s/180s/60s bounds. Export/cleanup is bounded90s. Explicit
provider release is mandatory within900s from grant; timeout is not release.
The existing N-only source remains staged as a launch-ready fallback.

Static review caught a missing space in embedded Python `else64`, corrected
before execution; both heredocs now parse. Review also corrected a CPU timing
fixture so paired-ratio and ratio-of-medians differ and are tested independently.
No failed GPU run or numerical regression is inferred from these local fixes.

Risks: larger live vectors can raise register/shared-memory use and reduce
occupancy; one-CTA packing may lose despite fewer nodes; compiler reduction
layouts/rounding may differ; trained EAGLE acceptance can fall after precision
changes. Keep raw failures, generated PTX/IR and compiler metadata. Do not
promote without exact equality and complete paired performance evidence.

The user explicitly requested keeping one B300 request queued while this work
continues. No GPU has been assigned at this checkpoint. Total cap: $120.
See [plan](N2_FUSED_NORMALIZATION_PLAN.md), [local receipt](N2_LOCAL_VALIDATION.json)
and reading-log entries R057-R059.
