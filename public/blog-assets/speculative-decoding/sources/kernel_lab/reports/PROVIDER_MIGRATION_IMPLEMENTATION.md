# Provider migration implementation — P001/P002

## Outcome and limits

The reproducibility foundation and bounded qualification runners are implemented locally. No new GPU allocation, CUDA test, trained EAGLE result, kernel speedup or default promotion occurred. The research plan is not complete.

The immutable registry separates eight prepared native schedules and eight mixed execution recipes. Each native schedule retains exact source hashes and precision/launch details. Recipe target/drafter revisions are derived from the existing pinned asset receipts. Old source and evidence remain intact; the former current-state page is archived instead of deleted. FP32, BF16, native FP8/FP4, mixed, TF32 and emulation have separate lane definitions; only the eight native schedules were registered as concrete new manifest objects, not as new implementations.

## Changes and consequences

- `experiments/registry.py`: immutable objects, artifact rehashing, append-only events, paired bootstrap confidence intervals, workload-specific promotion and rollback. Ineligible partial, skipped, profiled or mismatched runs cannot be promoted by the CLI. Performance receipts still depend on faithful benchmark instrumentation; this is provenance and gating, not a cryptographic proof that measurements are truthful.
- `experiments/budget.py`: provider/phase caps, file-locked reservations before launch, no refund inferred from process exit. Reconciliation remains conservative until a real settled billing receipt exists.
- `cloud/provider_qualification.py`: one-device primitive scope is explicitly separate from unchanged two-device N gate. Checks B200 identity, SM100, Triton3.7.0, CUDA events, bidirectional P2P copies and native artifacts. Profiler binary checks do not yet establish counter permission; report that limitation explicitly.
- `cloud/modal_qualification.py`: pinned NGC image and dependencies, exactly two B200, CPU/RAM limits, max one container, min zero, no retry, single-use,420s function timeout/120s startup timeout. No persistent volume or deployment. Image integration is only locally constructed, not built remotely yet.
- `cloud/launch_modal_qualification.py`: reserves before image build,650s outer execution deadline within720s allowance, exports checksummed results, stops observed app IDs and saves provider app/container readbacks. Human/agent reconciliation of readbacks remains required; it never marks release solely from exit.
- `plans/benchmark_matrix.json`: primary batch1 contexts128/512/2048/4096; secondary batch2..32 only after primary improvement; explicit prompts/splits/output accounting and missing-result statuses.

## Verification

Final full `kernel_lab/tests` run:289passed18skipped. Focused registry suite:15passed. Modal SDK constructed the function/image objects locally with no remote call. Python parsing passed for the new runners. None of this establishes CUDA compatibility, profiler access, numerical equivalence or performance.

Promotion tests cover corrupted objects, altered artifacts, incomplete runs, paired sample identity, different environments, profiler timing, runtime token equality, minimum repeats, noise/small gains, stale winner updates, rollback history, strict FP32/explicit mixed contracts and conservative budget reservations. Tests use synthetic fixtures; these are not benchmark results.

## Provider evidence and stop conditions

Beam MCP connected successfully. `whoami`:1999cents; capabilities:B200 inventory0. No reservation requested; no substitute architecture selected. Live VM check confirms prior quickstart stopped/auto_resume=false; apps empty. Retained50GiB root snapshot still exists; no assumption that storage is free. Account credit debit since setup is1cent, not attributed solely to this implementation round.

Modal CLI profile authenticates; app/container lists empty; billing usage list empty. Available credit balance is not exposed by the inspected CLI report. Browser inventory timed out; requested the observed balance from the user and continued local preparation. No GPU or build requested while verification is pending. This is a verification blocker, not evidence of inadequate credit or unavailable B200 capacity.

Official pricing inspected this turn:2×B200 at0.001736USD/s each,2CPU at0.0000131USD/s/core,32GiB at0.00000222USD/s/GiB. Sum12.849264USD/hour, conservatively12.85;720s reservation2.57USD below qualification cap3. Refresh before launch. CPU builds/storage/egress and actual invoice need reconciliation; no account funds beyond approved caps are authorized.

## Next sequence

1. Verify available Modal credits and refresh rate; commit clean source; run bounded two-B200 qualification.
2. Inspect exported gate failures and independent termination. If qualification fails, retain diagnostics and stop provider compute; do not burn credits in relaunch loops.
3. On success, prepare the separate bounded N2/N6 real-shape and trained N5 phase using the remaining Modal experimental allowance. Preserve native instruction proof and full-token equality before timing. Existing trained worker needs at least5paired repetitions for promotion, rather than its older3-repeat exploration default.
4. Diagnose original-HF mismatch and collect real bottleneck traces before changing kernels. Current synthetic0.51% fusion gain is not promoted. Trained SSD scheduler remains deferred until synchronous EAGLE is numerically valid and profitable.

No unsupported claim of SOL proximity or progress toward1,000tokens/s is made by this infrastructure change.
