# N5/N6 package and free CPU staging receipt

Prepared source commit `09bfc458372cfb6e68f0d687f774ddc918242ee7` on `kernel-sol`.
Source ZIP: `../ssd-kernel-source-trainedN6-prepared.zip`,895551bytes.
SHA256: `e36309457bee13dc175bce0cb771f03f08025846f72aec6f71a31b8b723a8456`.

The authenticated CPU workspace reconstructed this archive from the immutable
N4 source and verified all360manifest files on disk
at2026-10-22T07:54:33.297637+00:00. A second independent manifest pass verified the same commit,
360files, required SSH/SCP/timeout/Docker commands and compiler seed, emitting
`N6_LAUNCH_READY 09bfc458372cfb6e68f0d687f774ddc918242ee7 360 GPU_REQUESTED=false`.
No GPU was requested, queued, assigned or executed by staging.

CPU directory: `/data/workspace/ssd-kernel-09bfc458`.
[Stage receipt](../evidence/nativeN6-run-preflight/CPU_STAGE_VERIFICATION.json),
[launch-readiness output](../evidence/nativeN6-run-preflight/launch-ready.txt).
The launch package remains this exact commit even if a later bookkeeping commit
adds these staging receipts. The source archive is not silently rewritten.

After a fresh grant, run the staged `workspace_e2e.sh` with
`SSD_INNER_BATCH=trained_batch_n5.sh SSD_JOB_SECONDS=660`, the freshly observed
SSH destination and a new batch ID. Do not reuse nativeN4's released host.
The expected workload is N/N2 gates, one paired boundary micro, then pinned
asset verification and stage2/stage1 trained AR/EAGLE runs under the shared360s
allowance, provided the initial prefix took at most150s. Outer setup/work660s,
cleanup/export90s; external grant-to-release deadline900s/$8 at32USD/hour.
Shorten the job if launch is delayed. On failure/timeout, export what exists
and release immediately. Full default660s requires enough external time margin.

Account admission currently blocks another request: last ledger31.112547USD
before final settlement, minimum32USD. No credits bought and nothing queued.
The total120USD project cap is unchanged. Conservative project reservation
86.537535USD (33.462465remaining), using the minute-grant compute upper bound;
compute/control settlement is still pending. NativeN4 is released, with its
separate immutable evidence and report. Current local checks318passed/33skipped;
N5/N6 trained CUDA work remains unexecuted. Original v2 root/snapshot hashes
and both N4-tested native/fused kernel bodies were rechecked intact.
