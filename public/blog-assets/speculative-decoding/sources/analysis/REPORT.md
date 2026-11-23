# Measured outcome and numerical validation

SD and SSD both beat the native graph AR baseline on this recorded workload. The source notebook is preserved separately. The final comparisons use BF16 model weights, activations and logits, with FP32 reductions/accumulators; no full-FP32 target or FP32 output-head workaround is used.

The two supported numerical backends are distinct implementations. **Fused** packs projections and fuses RMSNorm/SwiGLU while keeping cuBLAS/SDPA. **Invariant** also uses fixed-tile BF16 linear/attention kernels. Exact output claims refer to native AR of the same backend, not bitwise equivalence to unmodified Hugging Face or another backend.

## Performance

H100 80 GB; Qwen2.5 verifier with 0.5B draft. Eight verification prompts × three repeats, maximum 192 output tokens, EOS stopping enabled. These prompts began as a reserved verification set and were reused after a K/V-stride repair, so they are now regression data. Warm model-generation E2E means cache reset + prefill + decode; it excludes tokenization, loading, compilation/capture, final detokenization and network serving. Throughput is total emitted tokens divided by total measured time.

### Fused backend

| Verifier | AR,1GPU | SD,1GPU | SD,2GPUs | SSD,2GPUs | Native equality |
|---|---:|---:|---:|---:|---|
| 7B | 126.23 | 156.82 | 157.55 | 228.77 |24/24 per method|
| 32B | 34.73 | 89.36 | 88.88 | 101.70 |24/24 per method|

Rates are generated tokens/second, including prefill.

![fused throughput](../figures/heldout-fused.png)

### Invariant backend

| Verifier | AR,1GPU | SD,1GPU | SD,2GPUs | SSD,2GPUs | Native equality |
|---|---:|---:|---:|---:|---|
| 7B | 108.69 | 158.33 | 158.53 | 219.73 |24/24 per method|

Rates are generated tokens/second, including prefill.

![invariant throughput](../figures/heldout-invariant.png)

### Paired completion latency

| Backend / verifier | SD / AR | SSD / AR | SSD / measured faster SD | SSD wins vs SD | Prompt-median SSD/SD spread |
|---|---:|---:|---:|---:|---|
|fused/7B|1.262×|1.841×|1.458×|24/24|1.205–1.881×|
|fused/32B|2.387×|2.579×|1.077×|24/24|1.018–1.542×|
|invariant/7B|1.485×|2.102×|1.412×|24/24|1.180–1.680×|

Ratios are medians of matched prompt/repetition latency ratios. The SD comparator for each SSD pair is the faster measured colocated or split SD result; both inherit K selected on split-SD calibration. Colocated SD was not independently retuned. Observed prompt spread is not a confidence interval. A wider serving baseline may be faster than this custom runtime.

The optional 32B invariant run was interrupted when Modal disabled the workspace. Its console log and failure receipt are retained; its final raw archive and full summary were not exported. That variant is not included in headline performance. The workspace-disable reason is unconfirmed; no payment/account setting was changed.

## Correctness and BF16

All 360 primary evaluation rows have verified token hashes and agree with their same-backend native AR and shape8 reference (24 groups ×5methods ×3configurations). The speed denominator is native width1 AR, never just the padded shape8 reference. The independent analyzer recomputed rates from raw tokens/times, checked timing reconciliation and duplicate groups, and reconciled complete saved summaries.

The corrected source passed 59 tests on two H100s, including independent HF tiny-model comparisons, every contiguous rejection-prefix pattern, rollback, stale KV masking, repeated requests, EOS, CUDA replay, two-GPU handoffs, kernel device guards, query-row invariance and differing K/V strides. The notebook was executed locally top-to-bottom with GPU execution explicitly skipped; its embedded source is checked against the separately GPU-executed scripts.

### Independent model logit audit

| Backend / verifier | Max relative L2 | Max softmax TV | First-token agreement |
|---|---:|---:|---|
|fused/7B|0.01852|0.016035|2/2|
|fused/32B|0.00909|0.061019|2/2|
|invariant/7B|0.02657|0.000321|2/2|

This audit compares one-shot last-prompt-token logits with unmodified HF on two calibration contexts. It is a numerical error check, not a benchmark of model quality or equality across all contexts. BF16 floating point can change close argmax decisions with different shapes; [PyTorch describes batched/sliced numerical differences](https://github.com/pytorch/pytorch/blob/main/docs/source/notes/numerical_accuracy.md), and [vLLM implements batch-invariant kernels for reproducibility](https://docs.vllm.ai/en/stable/features/batch_invariance/). The invariant backend addresses reduction consistency; the fused backend does not promise it on arbitrary future prompts.

The main 192-token suite exercised zero real EOS endings. Separate actual-model checks on both 7B and 32B did exercise EOS: a one-word reply stopped after 2 tokens, and a 1089-token repeated-log prefix ended after 26/31 tokens. AR/SD/SSD matched exactly in all four cases. Capacity 2048 was used. Source snapshots identify the pre-stride-fix cached-path validation; the stride fix changes the differing-layout uncached path, and full cached-path regression results are retained.

## Why performance improved

The original rewrite was dominated by eager dispatch and coordination. In a matched BF16 graph/eager ablation, SD decode throughput rose from 46.21 to 127.95 tokens/s; AR rose from 60.96 to 108.89. That isolates graph replay in the static-cache backend, not every difference from the original notebook. Moving the old Python worker earlier had regressed performance and remains rejected.

The new runtime captures complete draft proposals, packs KV storage for one-operation fork/adoption, and launches scout graphs directly while the target graph runs. Fused projections and pointwise kernels reduce GPU work. The larger 32B verifier makes verification amortization more valuable even with lower proposal acceptance. More branches often lose because forecast work exceeds the target window.

| Backend / verifier | SD proposal acceptance | SSD proposal acceptance | SSD branch hit rate |
|---|---:|---:|---:|
|fused/7B|76.8%|76.8%|60.8%|
|fused/32B|54.3%|54.3%|33.7%|
|invariant/7B|78.8%|78.8%|63.3%|

Acceptance counts include verified lookahead beyond the last emitted chunk; emitted throughput always uses actual output length. Calibration selected K and branch count using two separate 48-token prompts, one repetition. These small calibration/evaluation suites do not establish general optimality.

Profile evidence in `kernel-overlap.json` uses unions/intersections of actual kernel intervals. The48-token profile windows include prefill and exclude memcpy/memset; profiling changes absolute timing. Development SSD traces overlapped about 64–66% of target kernel time. This is kernel-time overlap, not occupancy. Do not directly equate its denominator with the older128-token decode-only trace.

## Problems, repairs and limits

- Same-dtype BF16 schedules originally disagreed on greedy ties; a FP32 head fixed one case but not the general problem. Full-FP32 reference execution was correct and slow. Both failed precision tracks remain saved.

- The first custom multi-GPU run used the wrong current device for Triton inputs. Explicit device guards and two-GPU regressions fixed it before evaluation.

- Self-consistent AR/SD output concealed a wrong uncached-attention path. An independent logit audit caught catastrophic errors from reusing K strides for V after RoPE. Independent V strides and non-contiguous-layout tests fixed it; the 7B invariant verification was rerun. The failure and original audit are retained.

- One combined final batch had too little time left for its last 32B invariant evaluation. It was deliberately stopped after one unpaired evaluation row and exported. A separate bounded app was then interrupted by the workspace disable, so this optional variant remains incomplete. Partial rows are excluded from headline comparisons.

- Final scope is greedy batch 1, this Qwen pair, short-to-moderate performance contexts, three warm repetitions, default GPU clocks and no production scheduler. Longer-prefix checks validate correctness, not sustained long-context speed. No sampling, training, vLLM superiority, hardware occupancy or broad model-quality claim is made.

## Cost and cleanup

Recorded additional-round resource usage before credits: **$6.3919 of the authorized $10**. Prior round: $3.9931, tracked separately. Active containers:0. All task apps stopped:True. Temporary weight volume deleted:True. These are recorded resource usage costs, not a credit-card payment receipt. See shutdown and billing JSON for scope and billing delay.

### GPU-only cost estimate for dedicated deployment

Using [Modal's H100 price](https://modal.com/pricing) of $0.001097/GPU-second, the estimate is GPUs ×price ÷measured E2E TPS. It excludes CPU, RAM, storage, loading and idle time, and is not the experimental billing receipt.

| Backend / verifier | AR $/M output tokens | Colocated SD $/M | SSD $/M |
|---|---:|---:|---:|
|fused/7B|8.69|7.00|9.59|
|fused/32B|31.59|12.28|21.57|
|invariant/7B|10.09|6.93|9.98|

One-GPU SD is the measured cost-efficient choice; two-GPU SSD buys lower latency. The latency win should not be presented as a proportional cost win.

## Reproduce and next work

Run `ssd-optimized-v2.ipynb` or the commands in `../README.md`. Raw data/source snapshots/versions/calibration/logs/failures are in `../runs/`; full traces are also preserved inside cloud ZIPs. `primary-summary.json` specifies exactly which complete audited runs support this report. Historical and rejected runs remain in `verified-summary.json` and the project history.

Next useful steps are a matched production vLLM baseline, more independently reserved prompts and longer-context measurements, independent colocated-SD calibration, and profiling fixed-reduction GEMMs/branch misses before further tuning. Fixed-order split-K GEMM and fused RoPE/KV writes are candidate kernel experiments, not measured wins.

A resume claim can accurately describe building a CUDA-graph greedy SD/SSD engine with packed KV management, custom BF16 kernels and independent numerical validation, with scoped H100 results from these tables. Credit the published SSD algorithm and HF/Triton dependencies; do not claim the algorithm is new. See `../history/PROJECT_HISTORY.md` for the full successful and failed sequence.
