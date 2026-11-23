# B300 batch C: correctness and component tuning

Source `cfef55f8c1c1c766e477981439b1b29b7328625b`; archive SHA256 `f1045ccfead65d743ea34e171656c41e4b043107a33b6a8e25e520f6ad01a438`.

74 tests passed in33.37 seconds: 11 CPU configuration/oracle/selection cases and 63 CUDA cases. This includes independent tiny-HF numerical checks, projection/head query invariance, both target ranking widths, early EOS, request reuse, rejection/full-acceptance state transitions, and two-GPU SSD mirrors. It does not establish pretrained 7B/32B accuracy or throughput.

All 164 microbenchmark cases passed their numerical gates and completed in42.88 seconds. Each uses7 CUDA-event samples, 32 or more operations per graph, and 512 MB or more of distinct rotated weights when the target was met. Timing is isolated component execution, not model generation.

| Model | Role | Selected candidate | M1 candidate us | M1 PyTorch reference us | Component ratio |
| --- | --- | --- | ---: | ---: | ---: |
| 0.5B | qkv | vector-n8-k256-s4 | 3.246 | 5.664 | 1.745x |
| 0.5B | output | vector-n8-k256-s4 | 3.748 | 20.249 | 5.403x |
| 0.5B | down | vector-n8-k256-s4 | 8.189 | 22.041 | 2.692x |
| 0.5B | gate-up | mma-n64-k64-s4 | 6.755 | 9.691 | 1.435x |
| 0.5B | head | mma-n128-k128-s1 | 47.618 | 93.488 | 1.963x |
| 7B | qkv | mma-n64-k128-s4 | 9.198 | 8.641 | 0.939x |
| 7B | output | mma-n64-k128-s4 | 10.586 | 24.383 | 2.303x |
| 7B | down | mma-n64-k128-s4 | 30.910 | 43.048 | 1.393x |
| 7B | gate-up | mma-n64-k64-s1 | 46.009 | 49.845 | 1.083x |
| 7B | head | mma-n128-k128-s1 | 160.464 | 211.699 | 1.319x |

The reference includes the matching materialized operation: linear; linear+residual/RMSNorm; interleaved SwiGLU; or linear+top-k. The target head uses top-one, the draft head top-two. This reference is not the complete preserved v2 engine. The 7B QKV component loses slightly to plain `F.linear` at M1; retain this losing result.

Selection sums QKV/output/down latency for one shared projection plan and weights query widths1 and 3 equally. For 7B, changing default BK64 to BK128 at split 4 reduces that sum from 66.42 to 50.69 us; head BK128 reduces the corresponding head mean from 193.60 to 160.53 us. The draft selects a per-query SIMT projection and split 4 gate/up. These are frozen hypotheses for full-model validation, not default replacements proven fastest for every workload.

Large-working-set calibration used 1 GiB of BF16 ones, with exact block-sum/copy checks. Read useful bandwidth was7.03–7.29 TB/s; copy read+write bandwidth 6.88–6.90 TB/s. Constant input data and analytical useful-byte counts do not establish actual DRAM traffic, a physical ceiling or inference SOL. Hardware counters and model critical-path measurements remain necessary.

Export finished 05:44:44 UTC and release was verified 05:46:19 UTC on2026-10-21, with no active node. The 95-second cleanup gap included a browser-window/control-index problem. An unintended checkpoint-delete prompt was canceled without deleting data. Later controls are resolved from the current named pane, and the next wrapper includes model transfer in its whole-job deadline.

The separate CPU cache finished in154.25 seconds, with 16 GB of public model assets at immutable revisions and per-file SHA256 digests. No model code executed there. The next evaluation verifies these files after staging, reuses the saved compiler cache, and compares AR/SD/SSD with v2-fused on the same B300 stack. K2/B1 remain fixed in that first comparison; independent K/B tuning is still pending.
