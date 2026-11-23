# G: separate projection roles after measuring F

F confirms matrix work dominates the target. Blanket two-warps BN64 loses
most target cases; the head is already near the separate streaming-byte proxy.
Current QKV/output/down share one schedule despite different N/K and grid size.
G tests explicit role-specific static schedules, retaining fixed arithmetic
per query width. Original/frozen/D/E kernels and plans remain unchanged.

Plan before implementation:

1. Optional QKV/output/down LinearPlan overrides fall back to the old shared
   projection plan. JSON is backward compatible; defaults are unchanged.
2. Target7B projection roles compare frozen/transpose4, narrower BN32 with2
   warps, split8 with4 warps, narrow+split8, and2-stage control. Every candidate
   includes q1/q3, independent numerical checks and raw rotating-weight timings.
   Narrower output tiles or more splits increase CTA count for small-N roles;
   that is a hypothesis, not evidence of higher occupancy or speed.
3. Select by mean q1/q3 device time only from complete passing bundles for
   each role. Freeze one plan per role, never dispatch on query count. Keep
   target gate/head transposed4 and draft frozen projection initially.
4. Validate mixed-role native AR/chunk/SD/SSD, width invariance, stable heads,
   poisoned future cache and request reuse. Existing HF thresholds remain.
5. Fresh-process control versus selected roles on explicit short256 requests,
   same model pair/prompts/output/K/B. Keep draft unchanged for this pair.
   A separate optional hybrid can test the measured draft gate/head schedules,
   with changed proposals/acceptance explicitly reported.

Collect constexpr identity with each loaded binary resource record so token-only
head and materialized-head oracle variants are unambiguous. Convenience Nsight
stats timestamp repair is documented separately; do not rerun paid profiles just
to replace CSV formatting. G does not assume teacher-cache reset repairs
numerics: F disproved that. Current-step operator precision remains open.

Budget before final F settlement: reserve F7.466667, leaving10.712208 under
the authorized60USD total. G may reserve at most7.466667 (840s at32USD/hour),
with600s whole work/setup and<=90s export, retaining150s launch/control margin.
Stage/verify before requesting one fresh node. Export/release immediately after
the bounded batch. No idle GPU during analysis, held requests, topups or
billing/security/clock changes. Results and failed attempts will be appended.

## Prepared execution details

Six schedules times3roles times2query widths yield36 paired geometry rows,
nine samples each with512MB rotating weight target.15 experimental GPU gates
cover biased/unbiased projection, fused residual/RMS, exact first-row width
invariance, and mixed-role eager/captured AR/SD/SSD reuse. Baseline checks run
first. The suite freezes only complete passing candidates and runs8 generation
jobs: control/roles for AR, control/roles/hybrid for SD and SSD. A hybrid AR job
is omitted because it has no draft. No changed-draft rows are folded into the
target-only kernel comparison. Every fresh process reruns native/HF gates.

Local validation:38 passed,7 CUDA modules skipped;72 Python ASTs and16 shell
scripts parse. All JIT bodies and original/frozen sources are unchanged. G has
not yet been CUDA compiled or executed. The optional stats flag repair is
prepared only; G does not allocate GPU merely for convenience CSV generation.
