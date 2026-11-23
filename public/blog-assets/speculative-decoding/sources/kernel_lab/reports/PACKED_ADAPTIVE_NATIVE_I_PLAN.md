# I: projection layouts, speculative policy and native dispatch

User authorized work on performance priorities1–3 and up to20USD additional
compute. Total project cap80USD; no topups or host/security/billing changes.
Last verified H GPU was released; no GPU requested during preparation. Computer
control currently times out even loading documentation. User asked to reconnect
while local work continues. GPU execution remains pending until control works.

Later steering: the restart also timed out. User explicitly chose “Finish
preparation; GPU testing can wait.” No I lease requested. Preserve this original
plan; [preparation outcome](PACKED_ADAPTIVE_NATIVE_I_PREPARATION.md) records work
completed and remaining validation.

This protocol is written before implementation. Preserve H as control and keep
each axis independently opt-in. No change to original notebook/frozen v2 sources,
BF16 boundaries, strict independent HF thresholds, or default runtime behavior.

1. Projection: pack QKV/output/down weights once into split/tile/K-block-major
   contiguous storage, preserving original matrices for prefill. Same BN/BK/S4
   and accumulation order as H. Compare packed layout alone, then explicit
   one-block lookahead pipelining. Reuse the exact existing merge/RMS epilogue.
   Measure setup/storage separately. No automatic newer-MMA substitution.
   Selection requires exact complete q1/q4 pairs, no per-width median regression
   and at least1% mean improvement for an activated role. One layout/lookahead
   choice is frozen across query widths. Pretrained gates still control eligibility.
2. Policy: use frozen setup-time verification/proposal costs and online
   acceptance/scout-hit estimates to choose K and whether to forecast. Pre-capture
   supported widths. Separate scout cache ownership across K values; clamp every
   mirror on rollback. K changes cannot reuse proposals of a different length.
3. Native dispatch: public CUDAGraph executable handle remains owned by PyTorch;
   C++/CUDA fuses int64 token/position preparation and graph launch on PyTorch's
   current device stream. No floating-point kernel replacement. Normal packet
   and early scout-seed fencing remain intact. Compile before timed work; error
   explicitly rather than silently falling back if native mode is requested.

First paid batch: correctness, H/K3 software Nsight timeline, isolated matrix
and dispatch comparisons, and pilot generation if time remains. Profile markers
separate preparation, proposal/scout, verifier dispatch and host packet waits;
classify dependencies before claiming removable host time. No counter retries.
Freeze promising candidates only after exact native and cross-control sequences.
Second batch: fresh-process controls/ablations, then fresh prompts frozen before
selection. The previous reserved H prompts are now regression data.

CPU: plan serialization/layout inversion, cost-policy decisions/hysteresis,
failure handling and source packaging. GPU: padded projection shapes and actual
7B geometries across query widths; biased QKV/full residual-RMS outputs; causal
prefix oracle for K changes, rejection, EOS/reuse and two-GPU scouts; native
dispatch repeated launches, stream/device ownership and sequence parity.
Same-weight pretrained logits and full generation sequences remain mandatory.
Independent HF failure still excludes validated HF-equivalent speedups.

Budget every allocation from verified price and allocation-to-release ceiling.
Stage clean source and verify hashes before lease. Two bounded batches are the
initial plan; reserve assistant/export/release time. Export then release at once,
download and analyze after release. All failures/skips/incomplete rows remain.

Sources: R001/R005/R017 for shape/layout scheduling; R018/R020 for unchanged
rounding/reduction boundaries. Newly read public CUDAGraph raw executable API,
CUDA graph launch/current-stream APIs and Triton loop-pipelining attributes.
No speedup or GPU compilation is claimed by this plan.
