# Nsight A: prepared and staged; no GPU execution

**Capacity blocked the run.** On2026-10-21 the only suitable CUDA pool placed
the request seventh, estimating2h25min. It was canceled before grant at
19:49:33UTC. The provider verified no pending request, no active GPU, stopped
meter and disarmed background watch. GPU cost for this attempt: **$0**.

A subsequent position4 queue event was stale. The provider rechecked and
confirmed the request remained canceled. No profile, CUDA correctness rerun,
hardware counter or new speedup was produced. Do not mistake the earlier
batch-H terminal output for a test of the new code.

## Completed preparation

- Source commit `19c9584762ca0b897570009399f1915dc7947021`, branch `kernel-sol`.
- Immutable archive `../../../ssd-kernel-source-nsightA.zip`:173586bytes,
  SHA256 `c7a681182386c3204a0704a75eb61b595f1d131dcf0a6da2334f1b4d3e187a19`.
- Exact source staged on the persistent CPU workspace at
  `/data/workspace/ssd-kernel-19c95847`. It reconstructed from the existing H
  archive after verifying both the old and new SHA256, and printed an actual
  `SSD_STAGE_OK` receipt. No paid node was used for staging.
- Local checks:21 tests passed,3 CUDA-only modules skipped; Python AST, cloud
  shell syntax and profiler CLI imports/help passed. Original notebook and
  measured root sources still match their saved SHA256s.
- Recoverable complete Git history through the code commit is in
  `../../../ssd-kernel-history-19c95847.bundle`; `git bundle verify` passed.

[The profiling protocol](NSIGHT_PLAN.md) describes the Systems timelines,
Compute counters, NVTX annotations, numerical gates, cache/replay policy,
raw exports and budget bounds. All profiler-process timings are explicitly
excluded from clean unprofiled or validated speedup comparisons.

## Execution recovery and accounting

The persistent CPU daemon had restarted; terminal11 showed a detached shell.
Restarting only that shell restored input. A real preflight printed
`/data/workspace` and the exact H archive SHA before transfer. Terminal11 now
has shell PID1959; the temporary tail monitor in terminal2 was interrupted
after cancellation and returned to its shell prompt. PIDs can change; locate
live panes again rather than trusting these historical identifiers.

Multiple console tabs exposed stale native accessibility state. Closing the
duplicate task tab and rebinding the app allowed the final receipt to be read.
The final cancellation and disarmed-watch receipt controls the resource state.

Live billing settled H at$3.48 for02:34:39–02:41:10CDT (07:34:39–07:41:10UTC),
6m31s on8GPUs. Total settled GPU spend is$26.07 plus historical Marshall$0.10,
leaving$13.83 under the user's$40 cap at the last check. No credits were
purchased or billing/security settings changed. The exported billing CSV and
structured cancellation transcription are under `../evidence/`.

## Next execution

When capacity is available, request one node and obtain its **fresh** endpoint.
The already staged command is:

```bash
bash /data/workspace/ssd-kernel-19c95847/kernel_lab/cloud/workspace_nsight.sh \
  ubuntu@FRESH_ASSIGNED_HOST nsightA-19c95847
```

The wrapper bounds the whole job to540seconds plus at most90seconds for
stop/export. Release immediately on the `SSD_EXPORT_DONE` marker;12minutes
from assignment is the operational ceiling ($6.40 at the quoted node rate).
The marker means evidence export finished; it **does not release the lease**.
Confirm ended/released and no active node before analysis. Retain raw reports
and actual permission/version errors. Then choose a concrete optimization
from the measured critical path, document the hypothesis, and compare it
against an unprofiled same-stack baseline with the existing hard gates.
