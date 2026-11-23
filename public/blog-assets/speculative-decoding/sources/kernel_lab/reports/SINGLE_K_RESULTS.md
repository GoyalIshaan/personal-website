# K: computation passed, TP process exit failed; no validated speedup

Immutable GPU source: `64129e5428cc559dd8ad9f1fff5c951eda25a311`.
This report records the completed run, separately from the later L repairs.
The one-request, two-application-GPU 1,000 output tokens/s goal is **not achieved**.
No default was promoted. No new SD or SSD full-model result was produced.

## What ran and what did not

The pinned B300 container exposed exactly two B300 SXM6 AC GPUs to the process:
Torch `2.13.0a0+8145d630e8.nv26.06`, Triton `3.7.0`, CUDA runtime `13.3`.
The provider billed the entire eight-GPU node at $32/hour. The source ZIP and
all 218 manifest entries were verified before execution. There were 160 baseline
pytest passes and 36 experimental gate passes, with no skips or failures.
These 196 executed tests include CPU tests as well as CUDA tests.

The TP2 random-tiny model passed the exact native logits, complete output,
EOS, request-reuse and ordered FP32 gather checks. It wrote computation
receipts but its torchrun process timed out after 80.763 seconds (exit 124).
Descendant cleanup was confirmed. A completed JSON file cannot override a
failed process exit. All four selected pretrained TP2 cases were therefore
`blocked_correctness_gate_unexecuted`. Tiny-model throughput is excluded from
the pretrained goal. Unselected batch/context cases are not measurements.

## One-GPU AR diagnostic controls

Qwen2.5-7B, batch one, 128 output tokens, three repeats per input length.
Throughput is total unique output tokens divided by total duration across
repeats. End-to-end includes the preserved HF adapter prefill; decode uses
custom kernels and CUDA graphs. Setup and output serialization are separate.
TTFT was not measured; the first-chunk bound is not TTFT.

| Input tokens | Decode tokens/s | End-to-end tokens/s | Independent HF audit |
| --- | ---: | ---: | --- |
| 128 | 325.907 | 313.753 | Failed; context max TV 0.012829, zero top-token mismatches; original calibration gate also fails |
| 2048 | 321.269 | 295.397 | Failed; context max TV 0.245209 and two top-token mismatches; calibration gate also fails |

All timed outputs and checked BF16 logits matched the preserved custom AR
reference exactly. That is separate from equivalence to HF. The medium-context
discrepancy is material and unresolved; it must not be described as only an old
calibration failure. The numerical gates and thresholds remain unchanged.
These AR1 numbers also do not directly compare to I's two-GPU SSD workload.

## Microbenchmarks: recorded differences are confounded

Seven alternating paired graph samples per case, finite bitwise BF16 output
checks before and after timing, and independent KV checks. The 512 MiB sweep
buffer is written outside the timed window. No hardware counters establish
actual HBM traffic, bandwidth utilization, occupancy or a speed-of-light bound.

| Chain | K frozen median us | K candidate median us | Frozen/candidate |
| --- | ---: | ---: | ---: |
| Gate/up, 7B, M=1 | 67.392 | 60.416 | 1.1155 |
| Gate/up, 7B, M=4 | 67.968 | 61.920 | 1.0977 |
| Attention, B=1, T=1, context 4096 | 21.088 | 19.552 | 1.0786 |

Post-run source review found a control defect. K's projection control calls
`torch.cat` even with a single part; its B1 attention control calls
`torch.stack`. The candidates return their kernel output directly. The packed
gate/up control also uses the older `linear` backend, whereas deployed unpacked
AR uses `linear_batched`. These chain ratios mix layout/backend and adapter-copy
effects. They are **not packing-only kernel speedups**, and no corresponding
full-model packed gain was measured. Preserve K's raw samples; L will use the
actual unpacked batched gate/up control and avoid single-part joins.

## TP shutdown investigation and reading lineage

K calls `destroy_process_group()` while `BatchedARDecoder.captured` still owns
NCCL graphs. Its stored body closure also retains the decoder/buffer mapping.
This is a concrete ownership hazard consistent with NVIDIA's documented
communicator-destruction hang. The run has no native stack proving the exact
stuck function, so this is a supported hypothesis, not a confirmed root cause.
[NVIDIA teardown guidance](https://docs.nvidia.com/dl-cuda-graph/troubleshooting/process-hang.html)
requires graph release before communicator destruction; the public
[CUDAGraph API](https://docs.pytorch.org/docs/main/generated/torch.cuda.CUDAGraph.html)
provides `reset()`. L will synchronize outstanding work, reset owned graphs,
break buffer/body ownership, then tear down the group. It will record teardown
checkpoints and watchdog traces outside measured inference. No timeout increase,
forced successful exit or disabled NCCL error handling is part of the repair.

## Evidence, reproduction, release and cost

- [Immutable downloaded archive](../evidence/singleK-64129e54.tar.gz): 9,316,667 bytes,
  SHA256 `c0a892f53200572f9a6e33c4e5d3047a8926ff48b3664a88d2083cff817b4b5b`.
- [Local extraction/hash receipt](../evidence/singleK-run-preflight/LOCAL_ARCHIVE_VERIFICATION.json).
- [Rebuilt audit](K_RESULTS_AUDIT.json), [six model samples](K_MODEL_SAMPLES.csv),
  [42 kernel samples](K_KERNEL_SAMPLES.csv). Rebuild with
  `python -m kernel_lab.benchmarks.audit_single_k --input kernel_lab/evidence/singleK-64129e54/node/kernel_lab/results/singleK-64129e54 --output kernel_lab/reports`.
- The archive was also saved as organization-only National Compute checkpoint
  `ad74ce55-abcb-4809-9275-b2b53e7b6152`.
- Run/export exit codes were both zero; individual case status remains decisive.
  Export finished at 03:52:53 UTC. Explicit release completed at
  **2026-10-22 03:54:11.239507 UTC**, **Oct 21, 10:54:11 PM Chicago**.
  [Release proof](../evidence/singleK-run-preflight/release-confirmed.png) and
  [structured transcription](../evidence/singleK-run-preflight/release-confirmed.json)
  show ended/released, stopped meter, no active/pending/held node and disarmed
  watch. No node was accessed after release. Export-to-release took 78.240 s.
- The minute-precision allocation start implies $4.366573–$4.899907 compute;
  this is an estimate, not a settled ledger charge. New control costs reserved:
  $1.086 in the original session plus $0.6809 in the fresh session.
  Conservative project reservation after K is $77.782034 of the $80 cap,
  leaving $2.217966. The earlier displayed account balance excluded unsettled
  GPU charges and is not a fresh availability/admission check.

Next steps: prepare and locally validate L's graph lifecycle and matched
microbenchmark controls; make the next GPU batch test TP process exit first,
then paired AR1 control/packed and TP2 control/packed at 128 and 2048 inputs.
Independent HF qualification remains required for any validated model-equivalent
performance claim. No additional GPU is requested by this report or its tools.


## Later inspection of the same saved numerical checkpoints

The measured prefill final-head distribution has TV=0 against HF at both128
and2048inputs. At C2048, cached step0 TV=0.011137 with matching top1;
steps1/2 reach TV=0.245209/0.160851 and both change top1. With frozen chunk256,
position2047 to2048 activates the ninth KV split. This localizes a useful
boundary experiment, without proving that split activation causes the drift.
Check per-step operations/cache evolution at fixed HF prefixes and compare
nearby split boundaries before changing any kernel. No new GPU execution.
[Per-step reinspection](K_NUMERICAL_STEP_RECHECK.json).
