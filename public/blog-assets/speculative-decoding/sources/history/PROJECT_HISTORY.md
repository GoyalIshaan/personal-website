# Project history: speculative decoding performance

This is the durable engineering record for the supplied notebook, the first rewrite, and the second optimization round. Entries E001–E015 are reconstructed from saved code, receipts and measurements, not retroactively claimed as preregistered experiments. Subsequent experiments get a hypothesis and validation plan before execution. Failed attempts remain recorded. No results from different hardware, precision or models are treated as code-only speedups.

## Preserved starting point

Original: `../original/ssd-original.ipynb`, SHA256 `daf3770ca1b9d75082eeee477e96f4fd2cda08001441bbc25f7506bd6ad74811`. Exact bytes and saved outputs are preserved. The source uses Qwen2.5-7B-Instruct / 0.5B-Instruct. Saved AR/SD/SSD times were 5.8759 / 3.9746 / 12.5391 seconds for a requested 128 tokens. SD and SSD text did not match AR. GPU/runtime identity is incomplete, so these are historical observations, not a validated speedup baseline.

## Reconstructed chronology

| ID | Attempt / observation | Outcome and evidence |
|---|---|---|
| E001 | Audit original cache, token selection and timing | Identified inconsistent inference-mode use, top-k tie ordering, full-prefix branch copies, and incorrect logical positions for padded branches. Original final mismatch not fully attributed. |
| E002 | Rewrite greedy AR/SD/SSD with reusable KV slabs, cursor rollback, incremental branch mirrors and event ordering | CPU tests passed. Original source unchanged. Stable engine retained in `baseline-v1/`. No production GPU speed claim from local tests. |
| E003 | Build independent calibration/evaluation protocol, token gates, optional eager HF and colocated-SD baselines | Raw JSON/CSV, model revisions, precision/device accounting and failure artifacts added. Initial local suite:126 passed/3 CUDA skipped. |
| E004 | Modal browser upload and cluster setup | Separate execution notebook imported in Helium. Browser GPU selector unreliable; ephemeral public Modal SDK used instead. Unused CPU notebook container stopped. |
| E005 | SDK resource setup | First attempt rejected scaledown_window=1 (minimum2); second rejected too-small explicit ephemeral disk. Corrected to2 and default disk. No GPU work in these failed launches; image-build cost retained. |
| E006 | Cheapest fitting 2×A10080GB request | Queued about5min without a GPU container; cancelled and verified stopped. Switched to2×H100 within authorized original$5 cap. |
| E007 | 32B/0.5B BF16, H100, native eager model forward |129 tests passed. Sequential SD failed warmup exact-token gate at generated index2. Saved failure and raw evidence; no valid throughput claim. |
| E008 | Replay exact divergent context using native DynamicCache and custom SlabCache, serial versus block | Both caches agree within each schedule. Serial scores30.0 vs29.875; block scores tie29.875. This attributes this particular divergence to numerical execution shape, not the custom cache. It does not clear every possible cache bug. |
| E009 | FP32 target output head | Resolved first investigated BF16 tie, but upstream numerical differences remained. A diagnostic script later tried converting a custom FP32-head wrapper to FP16 while its input cast stayedFP32; that diagnostic branch failed with a dtype error. Preserved complete BF16 diagnostic cases remain valid. |
| E010 |32B FP16 transformer + FP32 target head |131 tests passed on H100. Exact SD/AR gate failed at index6 ('defining' versus 'explaining'). No valid performance claim. |
| E011 | Original7B/0.5B pair in fullFP32, noTF32,2×H100 | Complete200-row experiment;90 evaluation rows=5methods×6prompts×3repeats. All evaluation token hashes agree.131 tests pass. E2E TPS:AR71.61,HF eager55.32,SD single47.19,SD two46.08,SSD34.80. SSD slower in all18 paired cases. |
| E012 | Analyze actual kernel interval unions/intersection | Full128-token profiled SSD decode:2.644ms simultaneous target/draft kernels over5706.435ms span.325,497 kernels. Large dispatch/coordination gaps; profiler adds overhead and no hardware occupancy counters were collected. |
| E013 | Move scout submission before target forward | CPU tests and3 actual CUDA handoff cases pass. Matched6-request ablation:originalSSD35.68 versus earlySSD30.94 decodeTPS; median0.873×, all6 regress. Same acceptance/hits. More overlap but target CPU dispatch spans doubled. Candidate discarded. |
| E014 |32B fullFP32 on2×H200, fixedK4/B2, bounded8minfunction | Model fits143771MiB GPUs.131 tests pass. Timed out372.1s benchmark limit including downloads,404s before export.49 rows correct;40 evaluations cover4code/math prompts×2repeats×5methods. Prose/EOS/fullsummary missing. Math prompt SSD beatsAR but all4group medians still trailSD. Partial evidence only. |
| E015 | Freeze first-round outcome and clean up | All containers stopped. Final recorded usage$3.99307232 of original$5. Original/optimized files separated, CRC/manifests checked. Latest default-policy notebook:130CPU passed/3CUDA skipped; source engine unchanged from GPU-tested snapshot. |

Full first-round report and all receipts: `../../ssd-comparison/results/REPORT.md`; raw cloud bundles under `../../ssd-comparison/results/bundles/`. The evaluation prompts were calibration-disjoint but reused across smoke/full/later experiments; they are not an untouched final test set.

## Current blockers

1. SD itself loses to optimized AR: extra draft model forwards and coordination cost more than the verification rounds save.
2. Eager transformer forwards launch many small operations. Almost no useful two-GPU overlap occurred in the profiled first implementation.
3. BF16 serial and block shapes can differ at close argmax decisions. Same dtype does not establish identical arithmetic order. Exact-token equality, numerical closeness and algorithmic correctness must be reported separately.
4. V1's dynamic active-prefix tensor shapes prevent a single reusable CUDA graph. Cursor rollback already avoids bulk cache edits, so more cache copying changes alone are not the first target.
5. FP32 reference execution changes the performance balance; it is not a valid substitute for measuring a BF16 fast path.
6. Cold model downloads consumed paid GPU time. Stage weights on CPU and reuse a temporary model cache during this round; delete that cache at cleanup.
7. Short reused prompts, limited repetitions and absent real-model EOS cases restrict general claims. Bigger verifier alone did not fix the implementation.

## Second-round authorization and order

User authorized **$10 additional** GPU/cloud usage. This is separate from the previous$3.99307232. First establish SD faster than a strong AR baseline; only then add SSD. Preserve all planned, failed and successful variants. No performance percentage is promised.

Planned E016: research PyTorch numerical contracts, production speculative validation, and the authors' optimized SSD engine. Planned E017: graph-safe static KV buffers and fixed-width target verification, graph both AR and SD, and test rollback/cache semantics locally before renting GPUs. Keep a native-width optimized AR baseline to prevent padding the baseline into a misleading speedup. Planned E018: single-GPU BF16 correctness/performance ablations with exact shape-matched reference plus separately reported native-AR agreement. Later candidates: fusion, larger target and SSD, conditioned on measured SD performance and remaining budget.

## Second round: prospective experiments and observations

| ID | Recorded plan / implementation | Outcome / evidence |
|---|---|---|
| E016 | Read primary numerical-accuracy/speculative-validation references, pinned Transformers source and the authors' optimized SSD engine | Same BF16 dtype does not imply shape-invariant arithmetic. Primary references, version/attribution boundaries and three separate correctness contracts are in `../research/NUMERICS_AND_RUNTIME.md`. |
| E017 | Replace dynamic active-prefix cache shapes with fixed buffers and captured model/token-selection graphs | 24 CPU tests initially passed. An initial test fixture attempted to poison inference tensors outside inference mode; nine fixture cases failed and were corrected with an inference-mode decorator. The engine did not require a change for that fixture failure. |
| E018a | Stage 7B, 0.5B and 32B weights on CPU into a temporary volume | Download stage completed in 356.6 s. The volume is temporary and must be deleted at round cleanup. Avoids re-downloading weights on paid GPUs. |
| E018 | One-H100 BF16 graph/eager ablation on the original 7B pair | 25 tests pass. 18 measured requests per method. Native graph AR:108.89 decode TPS; graph SD:127.95; eager AR:60.96; eager SD:46.21. All speculative rows match shape8 reference, but native equality only6/18. Median paired graph SD/native AR E2E speedup1.158x; all18 timing pairs win. Exact-native-output speedup is not claimed for this variant. |
| E019 | Pack all KV layers into one allocation; capture whole draft proposals; enqueue scouts directly after target graph without a Python worker | 44 tests pass on two GPUs. Independent K/B calibration; 7B chooses SD K2, SSD K1/B1;32B chooses K6/B1. Complete18 requests per method/model. Median paired SSD E2E/native AR:1.441x on7B and2.993x on32B; versus faster SD:1.242x /1.178x. Native equality remains6/18 and12/18. These are development timings with explicit numerical differences. |
| E019 label repair | Found that SSD evaluation rows inherited the selected SD K in their `k` metadata field | Actual runtime used the correct selected SSD object. `selected.json` records the true SSD K/B. Raw evidence is unchanged; analysis uses that record. Fixed the row label before final verification. |
| E020 | Fused RMSNorm/SwiGLU, packed QKV/gate-up projections; optional fixed-tile BF16 GEMM and split-KV attention | 53 single-GPU tests pass,1 two-GPU case skipped. Both fused and invariant7B SD match native backend AR18/18. Fused AR125.39 /SD158.08 decode TPS; invariant AR108.70 /SD156.39. Fused AR is faster; invariant is retained for a stricter numerical contract. Kernel primitives and full-model closeness checked independently. |
| E021 | Freeze both variants and test8 new prompts,192-token cap,3 repetitions, real EOS policy, native/shape8 AR and colocated/split SD/SSD | In progress at the time this entry was written. Results and exact source snapshots are appended to `events.jsonl` and the final report after export. |
| E021 device repair | First attempt passed54 tests but failed before evaluation when a custom kernel saw a GPU1 pointer with GPU0 current | Added explicit device guards around all custom kernels and a two-GPU regression for each backend. Retry passed56 tests. No arithmetic, calibration or heldout prompt changed; no heldout evaluation ran before repair. Both attempts remain archived. |
| E022 | Targeted actual-model EOS and longer-prefix checks, because fixed192-token tasks may not terminate | Separate from performance ranking. Verify exact AR/SD/SSD equality with a one-word EOS prompt and a repeated-log prefix over1000 tokens, capacity2048, on7B and32B. Outcomes recorded after execution. |

### Interpretation boundaries

The original notebook's saved output, the full-FP32 first-round reference, the BF16 HF graph engine, and the fused/invariant backends are distinct numerical/runtime tracks. Different model/hardware/precision results are never labeled a code-only speedup. All native-AR equality counts refer to the same backend, weights and EOS policy. A custom invariant backend is not asserted bit-identical to HF's native kernels; representative logit-error checks are saved separately, not described as a model-quality benchmark.

The development suite was reused during implementation. The final eight prompts were defined before execution and not used for K/B tuning. The one device-context repair happened before any of their evaluation rows were produced. Once inspected, these prompts become public regression cases, not a reusable untouched test set.

The profile analysis uses unions/intersections of actual kernel time intervals, not GPU utilization or occupancy counters. New 48-token traces include prefill; the earlier full128-token trace measured a decode window. Their percentages have different denominators. The matched SD-versus-SSD profiles within each new run provide the useful concurrency comparison.

### E023: independent audit finds a self-consistency blind spot

The first invariant one-shot logit audit had relative L2 errors above1 and total-variation distance near1. Matching native AR was insufficient evidence that the model implementation was correct. Investigation traced the failure to reusing key-tensor strides for the value tensor in custom attention. RoPE can materialize a new K tensor while V remains a strided slice of a packed projection. Static KV storage has matching K/V strides, so that cached path did not exercise the assumption; the independent uncached audit did.

The fix passes independent V strides. New primitive tests deliberately use differing, non-contiguous K/V layouts at multiple query lengths, and full-model tests now check a relative-L2 bound as well as elementwise tolerances. The corrected kernel is applied to the not-yet-started32B invariant subprocess with a separately archived source update; the already-completed7B invariant verification is rerun in a fresh app. The earlier audit failure, original source snapshot, source update, and regression results are all retained. The eight prompts are therefore regression data after this repair, not an untouched final test.

### E024: final optional variant interrupted externally

The combined batch had1249seconds elapsed before its last32B invariant subprocess, too little for a full validation under its deadline. That subprocess was deliberately stopped, and the exported partial directory contains one unpaired SSD evaluation row (the stop happened after that row, rather than before all evaluation). The previous planning entry's “before evaluation” phrasing describes the intention, not the observed outcome. The row is excluded from aggregate comparisons. A separate1100-second function reran59tests successfully and began the corrected32B invariant validation.

Modal then returned `ConflictError: workspace is disabled` during evaluation and stopped the app. At that point the console had nine evaluation observations for the first prompt; the invocation did not return its raw-token archive or final summary. The reason for workspace disable is not established. The additional round's recorded resource usage remained below the user's$10 cap; that does not identify Modal's workspace-level policy or credit state. No payment, subscription or account-limit setting was changed.

The complete fused7B and32B benchmarks and corrected invariant7B regression had already been downloaded. They support the final report. Optional32B invariant performance remains incomplete and is not presented as a complete benchmark. Driver logs, local exact code, the test output, the combined batch's partial structured files and available billing receipts are preserved. All remaining work is local analysis, validation, packaging and resource cleanup.

## Final local handoff and resource receipt

E025 verified eight new-round apps stopped, zero active containers, and deletion of the temporary model-weight volume. Recorded new-round app resource usage is$6.39190550 of the additional$10 authorization; earlier usage$3.99307232 remains separate. The app report does not separately itemize volume storage or egress and is not a payment receipt. `../analysis/shutdown-and-cost.json` and the raw billing/resource lists record the scope.

Three complete audited configurations support the final report: fused7B, fused32B and corrected invariant7B. They contain360 evaluation rows and exact same-backend native-AR agreement in every24-request group. Corrected invariant32B remains incomplete following Modal's workspace disable. The original notebook's SHA256 is rechecked, a v1 notebook snapshot is preserved, and the new portable v2 notebook contains the current source, tests and an explicitly historical cloud-results snapshot.
