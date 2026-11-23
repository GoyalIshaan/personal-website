# K plan: single-request latency first

The user replaced the active large-batch/long-context request: cap inference
batches at32, use short/medium inputs, prioritize one-request tokens/sec on two
GPUs. Keep J plans/packages as historical evidence. K active inputs will be
128,512,2048,4096; active batches1,2,4,8,16,32. Generation remains128tokens and
native capacity checks remain unchanged. No long-context/batch64+ execution.

Before implementation, source4fbc13f is clean. J is uploaded/hash-verified only;
no J CUDA execution or timing exists. Last observed provider balance30.03USD
is below the32USD B300 admission threshold; no allocation is authorized by a
balance assumption. Existing80USD project cap and explicit release still apply.

Changes planned before the next GPU batch:

1. Replace active grids/defaults/worker bounds and cloud overrides. Add a
   one-GPU AR baseline. Prioritize every B1 model case before microbenchmarks
   and secondary batching so the bounded budget serves the user's objective.
2. Add an opt-in packed fused gate/up-SwiGLU candidate. I's Nsight timeline
   identified gate/up as the largest target kernel category. I packing only
   covered QKV/output/down. Pack the gate/up layout once; retain original
   weights, BF16 boundaries, eight-query MMA and K-block order. Write activation
   directly, without a new FP32 partial/merge pass. Do not enable by default.
3. Wire the candidate into one-GPU and TP2 AR with full exact-logit/token gates,
   variant-bound receipts, setup/memory accounting and CUDA graph A/B timing.
   Restrict active CUDA shapes to batch<=32; retain historical tests in Git.
4. Run appropriate CPU/static checks, produce new ledgers, commit/package
   separately from J. CUDA correctness and performance stay pending until real
   GPU execution. Failed HF audits remain diagnostic; thresholds are unchanged.

Readings before implementation: Triton matrix-multiplication tutorial's block
layout/pointer arithmetic and fused-activation motivation; NVIDIA Best Practices
APOD sections about optimizing observed hotspots and verifying total speed.
No external kernel is copied and no tutorial benchmark is a project result.

https://triton-lang.org/main/getting-started/tutorials/03-matrix-multiplication.html
https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html
