# N GPU attempt 1: capacity unavailable, no GPU execution

The $120 total project cap is recorded. NativeN source `201d193d` is staged at
`/data/workspace/ssd-kernel-201d193d`; all 304 manifest entries and ZIP checksum
were verified. CPU terminal input and both shell launchers were checked.

Exactly one B300 request was approved. It entered queue position 5, with an
estimated 1 h 55 m wait. A read-only check found no immediately available compatible
NVIDIA alternative at or below 32 USD/node-hour. The queued request was cancelled
before assignment at 2026-10-22T06:24:58.017648UTC to prevent unattended billing.
Provider confirms no active/pending/queued/held node, billing hold or resource;
current burn 0 USD/hour and watch disarmed. No GPU worker was launched.

This is a provider-capacity block, not a CUDA/kernel test failure. There is no
new native FP8/FP4 compilation, instruction proof, numerical result, trained
EAGLE acceptance or throughput result. The prior K observations remain the last
GPU results. Original notebooks and previous source archives remain intact.

GPU compute cost for this attempt: 0 USD. Incremental Marshall control display:
0.9741 USD (1.6550 minus 0.6809). Conservative project reservation 78.756134 USD,
leaving 41.243866 USD under 120 USD; settlement pending. Provider-reported account
credit 38.197908 USD is separate and may lag control settlement. The sidebar
subsequently refreshed to $37.67.

Next: recheck compatible capacity, admission and release control, then run the
staged fail-fast 28-case native/EAGLE batch. Maximum 900 s grant-to-release,
660 s setup/work, 450 s inner gate, 90 s export/cleanup and 150 s control margin; 8 USD
compute ceiling at the observed 32 USD/hour rate. Explicit release is required.
Only after real gates pass may model acceptance and B1 throughput be measured.

Evidence: [machine-readable attempt](N_GPU_ATTEMPT_1.json),
[CPU staging](../evidence/nativeN-run-preflight/CPU_STAGE_VERIFICATION.json),
[provider log](../evidence/nativeN-run-preflight/queue-and-cancellation.txt),
[cleanup screenshot](../evidence/nativeN-run-preflight/cancelled-no-resource.png).
