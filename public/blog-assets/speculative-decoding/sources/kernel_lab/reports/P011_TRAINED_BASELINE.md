# P011: trained FP8 AR / BF16 EAGLE on two Modal B300s

Source: f0a958a.5 repetitions per case, batch1,128 generated tokens.128-context uses a code prompt;512-context uses prose. Different prompts confound context with acceptance; these are two development cases, not isolated context scaling or held-out performance.

| Context | Method | Decode tokens/s | Request tokens/s including serialization | Acceptance |
|---:|---|---:|---:|---:|
| 128 | ar-chunk8 | 293.10 | 283.13 | N/A |
| 128 | ar-chunk32 | 293.51 | 283.55 | N/A |
| 128 | eagle-k3 | 563.76 | 527.73 | 0.43636363636363634 |
| 512 | ar-chunk8 | 290.79 | 279.06 | N/A |
| 512 | ar-chunk32 | 291.26 | 279.46 | N/A |
| 512 | eagle-k3 | 450.03 | 422.22 | 0.28502415458937197 |

Paired EAGLE/AR-chunk32 median decode speedups:
- Context128: 1.92078x, paired bootstrap95% interval [1.92029,1.92102]. Five repeats only; uncertainty is within this allocation, not across hardware or prompts.
- Context512: 1.54515x, paired bootstrap95% interval [1.54461,1.54553]. Five repeats only; uncertainty is within this allocation, not across hardware or prompts.

All30rows locally revalidated against complete128token AR references. Gates cover query widths, features, EOS and unrelated-request reuse. Target projections use row-scaled native FP8 E4M3 with BF16 attention/head/cache and FP32 accumulation/reductions; EAGLE drafter BF16. Same-recipe AR/SD agreement passed. Trained SSD not implemented/qualified.

The changed-precision reference differs from original HF BF16: first top1 divergence at512context step0 (32 versus1249); sampled relative L2 errors span0.0526–0.5503. No task-quality equivalence claim. This does not explain or erase the historical same-BF16 mismatch.

First-layer isolated real-weight projection medians: QKV9.442us, output8.914us, gate/up35.468us, down23.056us. Includes activation packing and SwiGLU for gate/up; warm resident weights, not a whole-model time attribution or SOL measurement. P013 targets the two largest boundaries.

Nsight Systems smoke completed; Nsight Compute failed clock locking. No full-model profile yet. Final ZIP failed on pre1980 timestamp. Hash-checked streamed text recovered alltiming rows, gates, model inputs, metadata and numerical comparison. Large precision-contract.json exceeded the256KiB streaming cap and binaryprofiles were not recovered. Sourcecommit and numerical recipe hash survive, but full evidence export is incomplete; no default winner promotion. P013 fixes ZIP timestamps and excludes disposable Triton cache.

App ap-SBDN4faIF4YIZCUCYjGoPm explicitly stopped; independent provider app state stopped/tasks0, containers[]. Elapsed upper bound330s at14.55USD/hour gives1.33375USD; pending billing is recorded separately, not an invoice-final claim. No persistent model volume.

Decision: retain as first qualified trained comparison, not1000tokens/s success. P012 queues fixed-length AR chunks without intermediate CPU packets; P013 measures stage/packing variants with exact output gates. Preserve synchronous EAGLE as incumbent before adding SSD overlap.
