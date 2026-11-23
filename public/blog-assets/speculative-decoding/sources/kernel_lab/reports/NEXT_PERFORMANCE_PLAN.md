# Next performance work after H

This is a ranked experimental plan, not a new measured speedup. No GPU was
allocated for this discussion. H source17e7b468 is the latest measured runtime;
the actual Nsight model traces are from earlier F. Profile H/K3 before treating
F's exact durations as the current bottleneck breakdown.

## Largest kernel opportunity: narrow decode matrix work

F's32-output SSD trace ranks target gate/up18.209ms, output/down13.248ms,
QKV3.141ms and head2.228ms. Merge/RMS3.200ms and attention partial1.487ms are
smaller. These are summed kernel groups, not disjoint E2E fractions. Prior
streaming comparisons suggest output/down/QKV leave more room than gate/head.
Use the new trace to choose the first role; output/down is the current best bet.

H's22 saved `_mma_transposed.ptx` variants all contain
`mma.sync.aligned.m16n8k16...f32.bf16.bf16.f32`; none contains `tcgen05.mma`.
Compare a role-specific small-query kernel against H with controlled load/
compute pipelining, static packed-weight layouts, CTA scheduling and complete
split-K/epilogue costs. Existing residual/RMS and gate/up activation fusions
already exist; simply proposing those again is not a new optimization.

Re-read R005 (NVIDIA CUTLASS Blackwell SM100 GEMMs): newer BF16 tcgen05 and
TMA-specialized schedules are possible architectural candidates. Its documented
standard legacy-type tile examples start at64x64, much wider than our1–4query
axis. A naive replacement may waste work and lose. Benchmark one isolated
candidate with full numerical and sequence gates; no instruction-peak forecast.

## Largest SSD policy opportunity: useful accepted tokens per unit time

H calibration SSD K2/K3/K4 produces535.866/544.194/476.463tok/s with the same
target arithmetic and outputs. More draft work can reduce target rounds yet
lose overall. K3 scout hits48/136; reserved K3 hits100/262. Missed scouts are
not free. Test a bounded policy using recent acceptance, scout hit rate and
measured draft/verification cost to choose K and whether a scout is worthwhile.
Optimize E2E latency, not acceptance percentage alone. Capture the eligible
widths beforehand and test rejection, reuse, EOS and policy transitions.

## Scheduling opportunity: measure exposed dependencies before moving control

F SSD's target has20.369ms without traced kernel activity in a63.958ms decode
window. This includes waiting for real draft work and dependencies, not simply
avoidable CPU overhead. Measure verifier completion-to-next-dispatch gaps in H,
split packet/DMA/device wait from Python scheduling, and improve overlap first.
A C++ controller or more device-side control is justified only if that gap is
material. Current code already uses one pinned outcome packet per round,
captured proposals and packed incremental KV copies. Do not claim these are
new ideas or assume every cache copy is the main cost.

## Quick low-risk candidate: pack prefill weights once

Retain contiguous de-interleaved gate/up weights at packing instead of rebuilding
them per request. Preserve exact layout and rounding, account for extra resident
memory, and compare prefill/E2E separately. H reserved prefill is10.67% of total
generation time. Even eliminating all prefill would cap throughput improvement
at11.94% on that measured workload; removing copies saves only part of it.

## Numerical and measurement boundary

HF equivalence is still unresolved; do the operator-combination repair alongside
performance work, keeping the TV/top1 gate unchanged. G's changed arithmetic is
not an acceptable speedup; H's narrower schedule is exact on the tested control
inputs. BF16 alone does not guarantee identical reductions (re-read R018/R020).
Re-profile and compare accepted candidates with same models, prompts, capacity,
EOS, timing definition and GPU count. These short-context measurements do not
establish long-context behavior, production-serving superiority or SOL.

Practical order: prepare prefill packing, profile current H/K3, optimize the
largest exposed matrix role, then test cost-aware SSD and measured control gaps.
All candidates retain explicit failed-HF/provisional status until repaired.

Sources re-read: [CUTLASS SM100](https://docs.nvidia.com/cutlass/latest/media/docs/cpp/blackwell_functionality.html),
[cuBLAS](https://docs.nvidia.com/cuda/cublas/index.html),
[PyTorch numerical accuracy](https://docs.pytorch.org/docs/main/notes/numerical_accuracy.html).
Primary evidence: F/H reports, H raw PTX and H per-job rows; no code changed.
