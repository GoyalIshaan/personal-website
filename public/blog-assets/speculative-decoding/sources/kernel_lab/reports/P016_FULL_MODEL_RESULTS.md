# P016: measured full-model projection improvement

Source1b29ad9082b9d57423deb143c1feb6d25aa37c2e. Modal2xNVIDIA B300 SXM6 AC, driver610.57.04, CUDA13.3, Torch2.13.0a0+8145d630e8.nv26.06, Triton3.7.0. Qwen2.5-7B-Instruct revisiona09a35458c702b33eeacc393d103063234e8bc28; trained thoughtworks EAGLE3 revisionff17dda64a036cf5bd7bc56c0ab728325f1c0d0b. Batch1,128 generated tokens,5paired repetitions per case.

Native FP8 target projections, BF16 head/attention/KV and BF16 drafter. Two-pass activation packing retained. Gate/up uses BN128/BK256/stages3/split1; down uses BN64/BK128/stages3/split4; QKV/output retain incumbent schedules. This changes scheduling, not the intended precision format.

## Complete request results

| Input context/task | Method | Incumbent decode tok/s | Optimized decode tok/s | Optimized request tok/s | Paired speedup |
|---|---|---:|---:|---:|---:|
|128/code|ar-chunk32|290.05|350.07|336.14|1.2069x|
|128/code|eagle-k2|528.44|622.06|578.85|1.1768x|
|128/code|eagle-k3|564.04|661.96|612.97|1.1736x|
|128/code|eagle-k4|597.50|696.64|642.80|1.1659x|
|512/prose|ar-chunk32|287.93|347.01|330.42|1.2053x|
|512/prose|eagle-k2|454.39|534.85|496.35|1.1770x|
|512/prose|eagle-k3|450.08|527.82|490.25|1.1730x|
|512/prose|eagle-k4|435.08|507.38|472.47|1.1663x|

Request throughput includes prefill and host-visible output serialization. Decode throughput excludes prefill/serialization but includes synchronization, drafts, verification, transfers, repair and discarded work. All outstanding target/drafter work is synchronized before stopping the timer. AR uses one GPU on the same two-GPU allocation; SD uses the trained drafter on the second. This is synchronous SD, not trained SSD overlap.

## Validation and uncertainty

The two target instances have separate caches and graphs. Their requests are interleaved on the same allocation with reversed order on alternating repetitions.80raw timing rows were locally revalidated;161correctness gates passed, including identical full greedy outputs between incumbent/candidate AR and SD across K2/3/4, candidate row/feature invariance, EOS, and unrelated-request reuse. Native gate28passed/0skipped; queued-AR regression tests2passed. Local suite317passed/18GPU-skipped.

All8paired runtime comparisons exceed the3%promotion threshold with bootstrap95% intervals excluding regression. Raw distributions, MADs, pair IDs, bootstrap seed and intervals are in paired-full-model-analysis.json and immutable run objects. Tight within-allocation intervals do not capture variation across prompts or machines.

These are two development prompts; context and task differ. No held-out generalization claim, no512output confirmation, and no2048/4096context or batch-throughput qualification in this round. Changed precision differs from original BF16; AR/SD agreement does not establish task-quality equivalence. Trained SSD remains unimplemented. Both Nsight smoke probes succeeded; full-model profiling/SOL analysis is still outstanding.

## Preserved experiments

P012 removed intermediate AR host packets: -0.06% to+0.21%, not promoted. P013 tried one-stage pipelines/fused packing: all6slower. P015 tried deeper pipelines/larger tiles:7exact,3rejected for changed down-projection output; selected kernels improved isolated boundaries1.33x/1.60x. P016 confirms their complete-model benefit. Original notebooks and historical candidates remain separate and untouched.

Eight workload-specific winner pointers are in history/registry/p016-promoted-workloads.json. Each includes the incumbent control_recipe, candidate_recipe, both immutable run IDs and promotion receipt. Restore the control recipe/its stored target plans to roll back without reconstructing old code. No universal draft-depth dispatcher was enabled; K4 is best on the tested code prompt and K2 on the tested prose prompt.

## Export, release and cost

ZIP checksum14480737233a54bba5e1f902f63f149d5c7d75753ba5944eb2b137fa7f63760d verified locally. Full precision contracts, native proofs, source snapshots, model inputs, token sequences, profiler smoke reports and hardware receipt are preserved. The archive timestamp bug is fixed. Seven P015CUDA binary hashes also verified locally.

App ap-nwO9ghg6pTdxA5eIZ11EAq explicitly stopped; refreshed provider state stopped/tasks0, containers[]. All four batches released; no persistent model volume or queued compute.

Provider-reported charge for these four trained batches: 4.11100136USD. Reported cumulative listed project charges: 4.97203390USD. These are pending provider reports, not final invoices. Conservative journal accounting remains 8.754858713333333333333333333USD under the10USD available-credit limit; remaining conservative allowance 1.245141286666666666666666667USD. No credits purchased. The driver credit argument used the user-reported10USD less observed charges/conservative bounds, not a newly read wallet balance.

## Next highest-value work

1. Confirm the selected recipe at512generated tokens and2048/4096context, plus a held-out prompt set; retain complete-output gates.
2. Capture full-model Nsight Systems traces and Nsight Compute counters for the remaining expensive operations. Profiler access is now working; smoke traces are not a bottleneck breakdown.
3. Qualify trained native FP4/mixed recipes against their own AR reference and report BF16 differences. FP4 synthetic qualification alone is insufficient.
4. Implement trained SSD overlap only after quantifying draft/repair/verification costs and testing feature-cache ownership and rollback.

Best observed single-request decode is696.64tokens/s, with642.80request tokens/s. Reaching1000still needs about1.435xmore decode throughput, or30.3%less decode time per token. It has not been achieved.
