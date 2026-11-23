# B300 batch F: 79 tests pass; one pretrained TV gate fails

Source `1887ab682f7c8900a7326031b15a6db4dcb12f8e`. Archive SHA256 `3f01a8b59765c279b66d7a053d319f0a854def1af5c1a588a2db19070dcf6bc2`; organization-only checkpoint `f16d56cf-4854-4a65-8fa6-1233ec75173a`.

**79 tests passed in 40.84 seconds.** This verifies the new foreign-current-device RoPE repair, both selected-plan tiny-model numerical/width/chunk tests and two-GPU SD/SSD, together with the original kernel/state suite. The pretrained assets then downloaded and passed all SHA256s in 26.83 seconds.

The first full 7B target audit produced ten finite checkpoints. All ten kept the same top token as the independent HF oracle and passed relative L2 <= 0.05. Maximum relative L2 was 0.02994. One point, `cal-code`, cached width-one step2, had TV **0.0245623**, above the unchanged **0.02** limit. The other nine passed TV. Maximum absolute logit difference across the audit was 0.375. No generation timing rows were accepted or headline speedup produced.

The largest-TV point is a distribution difference with the same argmax; it is not evidence of a greedy-token mismatch. Conversely, ten matching argmaxes do not establish model-wide equivalence or validate SD/SSD on pretrained weights. We retain the failure and investigate before continuing.

The pinned torch build recorded `allow_bf16_reduced_precision_reduction=True`. Our custom projection reductions use FP32 partials. The next controlled study compares HF's full and reduced vendor reduction policies at identical forced prefixes, evaluates fixed tile/vendor plan alternatives under the same strict gate, and attributes local errors by feeding each custom operator the actual HF intermediate inputs. It does not relax tolerances. Full versus reduced changes vendor reduction policy while retaining BF16 weights and activations; all later comparators must record and share the selected policy.

Only strictly passing candidates with exact first-row logits across widths1/3/5/7 may enter device-forward calibration. That calibration uses seven CUDA-event samples of32 fixed-position full-model graph replays per sample. The target score averages widths1/3, while the draft uses width1. It measures device-forward latency, not generation throughput. Frozen passing plans may then enter a separate AR/SD/SSD evaluation with exact native-AR sequence gates. A legacy comparator failure may be retained and excluded while independent configurations continue; a new-backend failure still stops the batch.

A CPU regression verifies that the diagnostic hooks and cache correspond exactly to the independent teacher-forced HF checkpoint, preventing a mismatched-prefix attribution. The next diagnostic source has12 local CPU tests passing; it has not been CUDA-executed at this checkpoint.

Export finished06:41:57 UTC and release was verified06:43:31 UTC on2026-10-21. The lease is ended/released, no GPU is active, and meter stopped. The94-second cleanup gap is a process problem: future paid batches should be watched at short intervals, with source analysis deferred until release and no independent work between a release request and its confirmation.
