# Project chronology and claim ledger

This appendix accompanies the blog. It reconstructs the completed history from two fixed repository snapshots through P018, rather than continuing the main thread's experiments. It includes unsuccessful attempts. **prepared**, **compiled**, **GPU-tested**, **timed**, and **promoted** are different states. Early E001–E015 entries were reconstructed after the fact in the original log, not preregistered.

## Notebook and first correctness-first rewrite

| Stage | Work or finding | Result / status |
|---|---|---|
| Original notebook | Qwen2.5-7B / 0.5B, requested 128 outputs | Saved AR/SD/SSD times 5.8759/3.9746/12.5391 s. output mismatch and incomplete environment identity prevent a validated speed claim |
| E001 | Audit positions, inference mode, tie handling, branch copying | Several defects/risk points identified. original mismatch not fully attributed |
| E002–003 | Reusable KV slabs, rollback cursors, incremental branches, independent benchmark protocol | Original retained. CPU validation. no GPU result from local tests alone |
| E004–006 | Modal notebook setup. corrected resource parameters. A100 request queued then canceled | Switched to H100. startup and cleanup receipts retained |
| E007–008 | 32B BF16 test. native/custom cache replay of first mismatch | Both cache implementations agree within serial/block schedules. serial/block logits differ near a tie |
| E009–010 | FP32 head and then FP16 transformer with FP32 head | First tie repaired, later divergence remained. diagnostic wrapper also exposed a dtype failure |
| E011 | Full FP32, TF32 disabled, 7B/0.5B, 2×H100 | Complete 200-row experiment. 90 evaluation rows agree. SD and SSD lose to AR |
| E012 | Analyze actual kernel overlap | 2.644 ms concurrent kernels in 5706.435 ms decode window, 325,497 kernels. not occupancy |
| E013 | Submit Python scout earlier | Six matched requests regress. discard candidate |
| E014 | Larger 32B FP32 target on 2×H200 | Partial correct run, deadline hit. no complete result. larger target not a general fix |
| E015 | Preserve originals, outputs, bills and cleanup | First-round recorded resource usage approximately $3.99. no lingering containers in saved receipts |

[Detailed E001–E015 record](sources/history/PROJECT_HISTORY.md).

## Static graphs and measured H100 release

| Stage | Work or finding | Result / status |
|---|---|---|
| E016–017 | Read numerical and SSD sources. fixed buffers and captured forwards | Numerical contracts separated. fixture inference-mode bug repaired |
| E018 | Graph/eager BF16 ablation | AR 60.96→108.89 and SD 46.21→127.95 decode tok/s. shape-reference equality only, native equality 6/18 |
| E019 | Whole-draft capture, packed KV, direct scout graphs | Measured development gains, still disclosed native-output differences |
| E019 metadata repair | SSD row inherited SD's selected K | Actual executed SSD configuration recovered from selection record. raw rows retained |
| E020 | Fused projections/pointwise operations. invariant alternative | Same-backend AR/SD equality passed tested cases. separate arithmetic implementations preserved |
| E021 | Eight-prompt verification and multi-GPU device-context repair | Corrected explicit device guards before initial evaluation. reran checks |
| E022 | Real EOS and 1089-token prefix checks | AR/SD/SSD complete output equality. not a long-context timing study |
| E023 | Independent audit catches wrong V stride | Fix independent K/V addressing, add non-contiguous cases, rerun affected verification |
| E024–025 / release | Optional 32B invariant run interrupted. complete configurations audited and frozen | 360 primary rows retained. incomplete optional variant excluded. measured release tagged separately |

[H100 release](sources/analysis/REPORT.md). Fused 7B: AR1 126.23, SD1 156.82, SD2 157.55, SSD2 228.77 warm request tok/s. Fused 32B: 34.73, 89.36, 88.88, 101.70. Invariant 7B: 108.69, 158.33, 158.53, 219.73. Eight prompts × three repetitions. same-backend equality does not establish universal equality to HF or model quality.

## New B300 kernel laboratory

The initial infrastructure batches A–H and the later named kernel candidates C–H are separate labels in the logs. they should not be conflated.

| Stage | Work or finding | Result / status |
|---|---|---|
| Initial prepared lab | Fixed plans, split-K projections, split-KV attention, device verification, graph runners | Frozen measured release retained. new code initially untested on GPU |
| Infrastructure A | First B300 primitive checks | Ranking oracle API failed after 32 passes. harness repair |
| Infrastructure B | Numerical checks then symbolic runtime | 54 passes, concrete `cuda:0` versus `cuda` alias validation bug. repair ownership identity |
| Infrastructure C | Component suite and plan sweep | 74 tests and 164 micro cases. component qualification does not establish pretrained speed |
| Infrastructure D–H | Bulk staging failure, direct download, HF RoPE device guard, pretrained audits | Exact prefill eventually recovered. custom cached decode audit still fails |
| Nsight A/B | Trace/counter attempts | Capacity and capture failures. counter permission denial. provisional model timings are not qualified speedups |
| Research C | Transposed query-axis MMA, activity fallback | Primitive/row tests pass. modest diagnostic model changes, HF audit still fails |
| Fusion D | Combine RoPE/cache append/attention | Exact outputs. 14/16 boundary timing losses. broad fusion rejected |
| Direct E | Bypass merge for one physical KV split | 16–24% boundary time reductions in supported single-split cases. valid software trace smoke |
| Warp F | Capacity controls, complete timelines, fewer warps | Real kernel rankings obtained. blanket two-warp projection policy loses |
| Role G | Per-role narrower tiles and more splits | Faster selected timing changes target outputs. reject preserved-output claim |
| Exact H | Preserve BK/splits, change narrower tiles. K sweep | Exact control outputs. small schedule gains. reserved prompt gain diagnostic because independent HF gate still fails |
| Systems I | Packed weights, lookahead, native launch, adaptive depth | Packing/native model deltas small. lookahead and adaptive policy regress. no default promotion |
| Systems I operations | Mac lock blocks explicit provider release | Deadline missed despite finished subprocess. recorded cost overrun. release subsequently verified |
| J | Ordered FP32 TP2 exchange, independent batch/context support, broad sweep preparation | Prepared does not imply swept. batches initially extended to 512 at user's request |
| K | User narrows to batch≤32 and single-request priority. two-device and AR tests | Tiny TP arithmetic checks pass, process teardown times out. pretrained TP blocked. AR diagnostics at128/2048 preserve custom reference but fail HF audit |
| K control audit | Single-part cat/stack and different linear backends contaminate controls | Kernel ratios not attributable solely to packing. retain failures, prepare matched controls |
| L | Graph lifecycle repair and matched control preparation | Separate prepared changes. no qualified pretrained TP speedup established in reviewed result set |
| M | Weight-only low precision, parallel scout/precision design | Format/architecture preparation. BF16 reconstruction is not native FP4/FP8 execution |
| N/N2 | Native formats, trained EAGLE adapter and normalization-to-pack fusion | Numerical/native gates prepared. first runtime environment attempt failed before usable qualification |
| N3 | CPU explicit-target compiler preflight while queued | FP8 masked fill fixed, FP16 fallback discovered. physical M16 tile yields native tcgen05 emission |
| N4 | GPU native tests and boundary fusion | 40 CUDA passes, eight native proofs. synthetic boundary55.619→55.336μs. trained model not loaded |
| N5/N6 | Trained EAGLE and real-role audit preparation | Pinned payload, mapping, features, cache repair, exact sequence and real-weight gates prepared |

[Complete work log](sources/kernel_lab/reports/WORK_REPORT.md), [reading lineage](sources/kernel_lab/reports/READING_LOG.md), [K's detailed failure](sources/kernel_lab/reports/SINGLE_K_RESULTS.md), [native qualification](sources/kernel_lab/reports/N4_GPU_RESULTS.md).

## Beam/Modal migration and trained native result

| Stage | Work or finding | Result / status |
|---|---|---|
| Beam setup | Authenticate and CPU hello-world | CPU VM executed and stopped. does not qualify B200/B300 |
| Provider plan / registry | Kernel identities, recipe identities, run evidence and promotion rules | Per-precision/architecture/workload comparison and rollback, no universal winner |
| P002–005 | Modal setup and two-B200 qualification attempts | Dependency/path/setup work. request timed out without worker evidence. stopped explicitly |
| P007 | B300 fallback | Container entrypoint assumed wrong filesystem depth. startup failure |
| P008 | Fix remote root. qualify 2×B300 | 28 CUDA tests, eight native receipts, peer-copy smoke. topology command failed, no confirmed NVLink claim |
| P009 | First trained request | Canceled before final export. cause unknown. no recovered trained result |
| P010 | Stream bounded hash-checked text snapshots | Local recovery path added. binary artifacts still require archive |
| P011 | Trained FP8 target/BF16 EAGLE baseline | 30 timing rows recovered. full greedy gates pass. pre-1980 ZIP timestamp failure loses binary profile exports |
| P012 | Fixed-length AR queue | Correct. −0.06%..+0.21% paired changes, no promotion |
| P013 | One-stage and row-fused packing candidates. archive fix | Six exact candidates, all slower. complete exports and Nsight smoke probes now work |
| P014 | Versioned target-only native overrides | Preparation enabling controlled full-model comparison |
| P015 | Deeper pipelines/larger tiles and depth sweep | Seven exact candidates, three numerical rejects. gate/up1.3338× and down1.5971× boundary winners |
| P016 | Independent incumbent/candidate models, five interleaved repeats | 80 rows/161 gates. AR≈21%, SD≈17% faster within same recipe. eight workload-specific promotions |
| Latest inventory | Beam B2000/B3000 in saved read-only check | No new Beam GPU allocation. availability is a point-in-time observation |
| Latest authorization | User authorizes15USD additional Modal spend | Round cap25USD. authorization is not actual usage or wallet verification |
| P017 attempt 1 | Static YaRN4, 131072 cache slots, full-history AR | 119968 outputs in587.54s,204.19tok/s. Planned deadline, no OOM. Checkpoints preserved |
| P017 attempt 2 | Fresh request with a longer bounded allowance | 128000 outputs after128 prompt tokens in631.966s,202.54tok/s. Final window174.70tok/s, decode-phase peak27.52GiB allocated. Full KV retained, EOS ignored |
| P017 repeatability | Compare complete shared output prefix across allocations | All119968 shared token IDs match. AR repeatability only, no long-context SD/SSD or text-quality claim |
| P018 | Split attention-merge head channels into32/64/128wide tiles | 18 synthetic cases,10exact/8nonexact.32wide at capacity131072/position127 gives6.402x complete-attention speedup with zero reported merge spills, but fails exact checks at longer positions. No promotion |
| P019 | Further warp and normalizer experiments | Prepared after this article's completed-results cutoff. No results included |

[Provider chronology](sources/kernel_lab/reports/EXPERIMENT_COMPARISON.md), [P016](sources/kernel_lab/reports/P016_FULL_MODEL_RESULTS.md), [P017](sources-p017-p018/kernel_lab/reports/P017_LONG_CONTEXT_STRESS.md), and [P018](sources-p017-p018/kernel_lab/reports/P018_ATTENTION_MERGE.md).

## Claims that are supported and claims to avoid

| Supported wording | Unsupported shortcut |
|---|---|
| Built and evaluated custom greedy AR/SD/SSD paths with independent numerical gates | Invented speculative speculative decoding |
| Scoped H100 SSD latency wins against the project's measured AR/SD controls | SSD always beats SD or is the cheapest approach |
| Native FP8/FP4 primitive qualification on B300 | Trained FP4 model performance/quality is established |
| P016 schedules improve AR about21% and SD about17% in the paired development cases | Entire project is a notebook-to-B300 code-only speedup |
| Best tested trained SD case696.64decode /642.80request tok/s | 1,000tok/s achieved. 697tok/s from trained SSD |
| Exact full greedy outputs within the tested target recipe | Bitwise equivalence to HF on all prompts or no quality loss from FP8 |
| Valid software timelines and later profiler smoke probes | Complete latest native-model bottleneck profile or measured near-SOL efficiency |
| One full-history AR request generated128000outputs at202.54tok/s average | Long-context SD/SSD equivalence or coherent128k text established |
| P018 short-position attention primitive improved6.402x in its exact case | Full-model or long-context generation became6.4x faster |
| Batch/context machinery prepared, with limited executed cases | Batch32/512 sweep completed |
| Failed ideas, binaries, recipes, source hashes and cleanup receipts retained | Every planned experiment ran, every saved report is final billing, or local passes are CUDA passes |

## Publication checklist specific to this draft

- Keep the hardware, precision, prompt count, output length, and timing scope next to each headline number.
- Preserve the visible AI-assistance and prior-art credits. adjust the personal voice before publishing if it does not match your experience.
- Review prose for your own technical understanding, especially the three numerical contracts, FP8 lowering, EAGLE feature/mapping ABI, and exact split grouping.
- If publishing to a public repository/site, replace local source-bundle links with stable public commit links or publish the included bundle. Nothing has been published by this side conversation.
- Completed P017/P018 evidence is included from commit d97a5dc. Keep later experiments separate until their results are checked. The earlier P016 source snapshot remains unchanged.
