# Research C: transposed narrow GEMM and actual capture preflight

Execution is now recorded in [Research C results](RESEARCH_BATCH_C.md). The
pre-execution protocol below is retained as the declared plan. The later
fusion D source is a separate pending candidate.

Prepared after B; not yet GPU-executed. Local suite:24 passed,3 CUDA-only
modules skipped. Python AST, shell syntax and CLI imports/help passed.

## Hypothesis and attribution

[R001/R006/R007](READING_LOG.md) motivated a fixed8-query-axis product
`W × X.T`, stored back in query-major order. It can change the hardware MMA
shape and input layout compared to the baseline's16-query-axis product.
It may win or lose; generated PTX and measured paired timings decide.
The baseline `_mma` JIT function remains byte-identical to the prior version;
the candidate is isolated in `optimized/kernels/linear_transposed.py`.

The candidate uses the same target projection/gate/head tile parameters as C,
changing their kind to `mma_t`. The baseline draft projection was SIMT, so its
candidate instead uses BN64/BK128/split4; this is a resource/schedule change,
not a pure transpose ablation. Draft gate/head keep their C tile parameters.
No candidate dispatch depends on query width. C plans remain immutable.

## Bounded sequence

1. Pinned container and verified compiler seed; expose only devices0/1 to
   PyTorch while recording all8 leased GPUs in nvidia-smi. This may reduce
   unused-device initialization work; it does not reduce the node billing rate.
2. Baseline correctness suite excludes explicitly marked experimental cases.
3. Tiny Systems preflight tries NVTX then full-process capture, requiring
   actual CUDA-kernel rows in SQLite. Only a successful mode can start the
   expensive pretrained SSD capture. Use primary-process wait and no forced
   target kill. Failed/missing reports are explicitly rejected. A labeled
   Torch activity capture is a fallback if Systems fails again.
4. Run experimental candidate gates independently: projection/reference and
   query invariance, fused BF16 boundaries, odd output tails, head ties and
   top-one/top-two agreement. Failure excludes candidate generation.
5. Paired synthetic microbenchmarks at real7B/.5B geometries, queries1/3,
   five device-timing samples,512MB rotating weight bank. Alternate candidate
   order, keep numerical errors and losing rows, save emitted PTX/IR/cubins.
6. Unprofiled fixed-plan calibration: AR, SSD and SD, baseline and transposed,
  96-output cap,2repeats,2prompts. Every method must match its native AR.
   Cross-plan native sequences are also compared. Independent HF failures,
   sequence differences or nonzero process exits exclude validated speedups.

The outer whole-job bound remains540seconds with at most90seconds stop/export,
and explicit provider release immediately after export. Operational maximum:
12minutes,$6.40 at$32/node-hour, within the last verified$9.48 remaining cap.
The research process has its own280-second bound and records budget-skipped
configurations. Missing/incomplete rows are not filled or called successful.
Nsight Compute's verified B counter denial is retained; no permission or
container capability changes and no repeated denied-counter collection.

The goal is a measured kernel improvement and an explainable critical path,
not a claim of hardware SOL from useful byte arithmetic or instruction names.
