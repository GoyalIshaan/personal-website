# Systems I: live control incident (not a result report)

Source: fe96e2002cf38c25aef66f3ae98aa8cda1176218. Batch: systemsI-fe96e200.

- One8xB300 provider node, host204.52.22.122,32USD/hour whole-node rate.
- Assignment displayed01:03UTC22October2026. Conservative provider release deadline01:17UTC.
- Supervisor visibly started01:04:31UTC, with600second whole-work timeout. After work it attempts bounded stop/export (20+70seconds). This does **not** release the provider lease.
- Confirmed before control loss:135baseline tests passed,84deselected,35.92seconds;10packed GPU tests passed,16.12seconds. H/K3 Nsight subprocess exited0in68.683seconds; raw CUDA trace validation is pending local archive inspection. Native/adaptive/matrix/pretrained timing outcomes were not yet observed.
- At01:11UTC native AX observation timed out; native app inventory then explicitly reported Mac locked, automatic unlock failed. User was immediately asked to unlock or manually release. Native retry still reported locked. Existing browser3 setup succeeded but the user-tab inventory timed out; there is no separate National Compute connector. No unsupported API or credential extraction was attempted.
- Do not label the lease released, download complete, native compilation passed, or any new speedup established without an observable receipt.

## Recovery order

1. Unlock and leave National Compute in Helium available. Prioritize provider release of204.52.22.122; no further node request or replacement. The provider meter persists after the shell stops.
2. If export is already finished, release immediately; if release deadline is at risk, release regardless and preserve any CPU-workspace evidence already copied. No additional GPU work.
3. Verify ended/released, no active/pending request, stopped meter; save proof. Then organization-only checkpoint/download of the existing CPU archive (no new GPU allocation).
4. CPU archive expected: `/data/workspace/ssd-kernel-fe96e200/evidence/systemsI-fe96e200.tar.gz`, SHA sidecar adjacent. Actual existence, finalization and hash remain to verify.
5. Hash-check archive locally, inspect run/export exits and nested receipts, then analyze all passing/failing/incomplete candidates. Preserve this incident in history.

## Operational change required before another allocation

The work timeout protected execution duration but did not independently protect billing after a Mac lock. Future paid runs need a provider-side or provider-agent release workflow independent of this Mac UI, verified before requesting compute. Do not describe a pool watcher or an SSH/container timeout as automatic lease release.

## Recovery outcome

The user unlocked; explicit release completed01:20:34.232UTC. No active/pending GPU, meter stopped, watch disarmed. Export had succeeded01:13:03UTC, before recovery. Archive downloaded and SHA-verified; all155pytest gates,24timed SSD rows and eight exact pretrained logit checkpoints rechecked locally. The planned14minute lease bound was missed; actual17m01.633s implies9.081182USD. Full results: PACKED_ADAPTIVE_NATIVE_I_RESULTS.md.
