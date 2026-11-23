> Execution update: source4f14981a ran.99 baseline+9 fusion checks passed;
> all16 pairs completed but14 were slower. Broad fusion is not promoted.
> The pre-execution protocol below is retained; see [actual D results](FUSION_D_RESULTS.md).

# Fusion D: prepared after the actual CUDA trace

**Status: code, explicit plans, adversarial tests and a paired microbenchmark
are prepared. No CUDA compilation, test, timing or upload of this candidate has
completed.** Local validation passes29 tests;4 CUDA-dependent modules skip.
Research C's successful GPU tests do not validate these new kernel lines.

## Mechanism and correctness obligations

`optimized/kernels/attention_fused.py` combines packed QKV's NeoX RoPE, KV append
and split-KV GQA. With one physical KV split it writes normalized output
directly and allocates no partial scratch. With multiple splits it retains
the existing merge kernel. Inactive future splits do not rotate the query.
The physical cache capacity and mask still bound every request.

Each `(query row,KV head)` has exactly one writer, in split0. All CTAs read
historical cache slots strictly below the first current position. Current-block
keys/values are loaded directly from packed QKV and rotated locally. Therefore
no attention CTA reads a slot that another CTA is concurrently writing; no
grid-wide barrier, atomics or cooperative-residency assumption is needed.
The caller supplies in-bounds consecutive positions on device, as KernelRunner
already does. Independent K/V strides and the existing BF16 product/add
materializations are retained. No quantization or approximate new softmax is used.

Prepared gates cover poisoned current/future cache, cache-byte equality, odd
capacity tails, a current block crossing a KV-chunk boundary, GQA groups1/5/7,
dimensions32/64/128, width invariance including all widths1..8, independent V
stride, unchanged memory holes, SDPA reference tolerances, graph replay with
changed positions, tiny-model logit/cache/native-AR equality, SD and two-GPU SSD
reuse. Baseline comparisons demand exact output/cache equality; tolerances were
not relaxed to admit a fusion. Failure keeps the candidate out of generation.

## Explicit hybrid plans, no default promotion

`b300-7b-fusionD-candidate.json` uses the measured target transpose plus fusion.
`b300-0.5b-fusionD-candidate.json` keeps the frozen draft SIMT projection and
uses transposed gate/head plus fusion. This avoids C's measured q1 projection
regressions. A full-model comparison must distinguish the hybrid's schedule
change from attention fusion: compare hybrid with fusion disabled against the
same hybrid with fusion enabled before attributing an engine change to fusion.

All existing C plan files and defaults are unchanged. An old serialized plan
without `fuse_rope_attention` still selects the baseline. The new flag accepts
only an explicit bool. Baseline attention/RoPE/linear JIT functions are untouched.

## Next GPU sequence

Do this only with a fresh assigned node, verified remaining project budget and
reliable release controls. No node is currently allocated. Existing source-C
archives continue to run C; they do not contain this new candidate.

1. Commit/package the new source; stage and hash-check it on CPU workspace.
2. Run baseline checks separately from `-m experimental` gates in the pinned
   B300 container. A candidate failure must not suppress baseline evidence.
3. Use the software Systems flags from R013, starting with the tiny actual-kernel
   preflight. Preserve a missing/denied trace and use Torch activity fallback.
   Do not retry the known-denied Compute counter path or alter permissions.
4. Run the paired attention microbenchmark with a hard parent timeout:

```bash
timeout 80 python -m kernel_lab.benchmarks.attention_ab \
  --output kernel_lab/results/fusionD-attention --seconds 60
```

It uses both model geometries, queries1/3, capacities256/2048 and short/near-end
positions:16 planned pairs, five device-time samples, alternating first variant.
It includes the complete materialized RoPE+append+attention path in the baseline,
requires exact output/cache equality, retains failures/losses and saves generated
PTX/IR/cubins. Its cache is intentionally hot; no DRAM or engine-throughput claim
may be inferred. The soft case deadline alone does not bound a compiling kernel;
the parent timeout is required.

5. If all gates pass, run unprofiled AR/SD/SSD with identical capacity, model
   revisions, prompts, EOS policy, dtype/reduction mode, K/B and graph policies.
   Use separate processes and output directories. Measure hybrid-no-fusion and
   hybrid-fusion independently. The existing end-to-end CLI accepts the explicit
   candidate JSON files through `--plan` and `--draft-plan`.
6. Every row must match native AR, and cross-plan native tokens must match.
   Independent HF audits still gate validated speedups. A diagnostic run may
   explicitly record the existing audit failure; it cannot weaken thresholds
   or become a publishable speedup by relabeling.
7. Export all logs/traces/stats, release immediately, verify no node/request and
   stopped billing, then download/verify/analyze. Record outcomes before choosing
   another candidate. Do not spend unverified or additional account credits.

The current goal is a measured reduction in small-kernel overhead. The trace
still identifies matrix work as the larger target cost; fusion is not a promise
of a large end-to-end gain or hardware SOL.

Attribution: [FlashAttention KV-cache API](https://github.com/Dao-AILab/flash-attention/blob/main/README.md?plain=1)
motivated fusing RoPE, append and attention. [FlashInfer's fused append API](https://docs.flashinfer.ai/generated/flashinfer.rope.rope_quantize_fp8_append_paged_kv_cache.html)
reinforced explicit layout/numerical boundaries; its FP8 path is not adopted.
This is original code built on this project's earlier BF16 kernels.

## Focused execution protocol after C billing settled

The final budget is$4.240644. Use `cloud/workspace_fusion.sh`, not the C
research wrapper. Whole job330seconds; stop/export at most90seconds; reserve
30seconds for prompt launch/release. The absolute lease ceiling is450seconds
($4), including assignment-to-launch delay, with immediate release on export.
If launch/control delay cannot fit, interrupt/export/release earlier.

The dedicated container/suite runs baseline checks, the9 new fusion primitive
and runtime gates, paired complete attention timing only after both pass,
and one full tiny software Systems preflight. The suite has150seconds, with
child process-group timeouts and incremental exit/summary logs. It copies new
PTX/IR/cubins even on a candidate failure. It prepares only Systems, skips the
known-denied Compute counter path, downloads no pretrained assets and runs no
pretrained generation. This is a fusion latency experiment, not an E2E claim.
The original hybrid D plans remain explicit and unpromoted.

Local runner validation:31 tests pass,4 CUDA modules skip,63 Python ASTs and
all cloud shell scripts parse. Both real child failure and timeout receipts
are tested. These CPU checks do not establish that a Triton candidate compiles.
