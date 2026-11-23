# Direct-output E: exact microbench wins and a working software trace

Executed source **ebb4b6457d012367d9add2c02623bc2067ffced7**. All113 source
manifest hashes were checked before allocation. The original notebook, frozen
baseline JIT files and D experiment remain unchanged.

100 baseline checks passed in34.296s;9 E checks passed in17.222s. All16 paired
complete RoPE+append+attention cases completed with exact baseline output and
cache contents. Five CUDA-event samples per side,32 operations per graph,
alternating first variant. These are same-cache hot timings, not HBM counters
or full-engine speedups. No defaults are promoted.

The8 single-physical-split cases improve16.0–24.3% in elapsed time. The8
capacity2048 controls call the unchanged baseline and differ by about-0.93% to
+0.59% in time reduction; those small changes are timing variation, not a new
multi-split kernel. Physical capacity, not just current context, selects E.

| Model | Capacity | Start | Queries | Baseline us | E us | Time reduction |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 7b | 256 | 64 | 1 | 6.193 | 4.687 | +24.32% |
| 7b | 256 | 64 | 3 | 6.339 | 5.022 | +20.78% |
| 7b | 256 | 248 | 1 | 8.432 | 6.883 | +18.37% |
| 7b | 256 | 248 | 3 | 8.716 | 7.052 | +19.09% |
| 7b | 2048 | 64 | 1 | 6.542 | 6.603 | -0.93% |
| 7b | 2048 | 64 | 3 | 6.783 | 6.792 | -0.13% |
| 7b | 2048 | 2040 | 1 | 9.137 | 9.100 | +0.40% |
| 7b | 2048 | 2040 | 3 | 9.229 | 9.295 | -0.72% |
| 0.5b | 256 | 64 | 1 | 5.296 | 4.085 | +22.87% |
| 0.5b | 256 | 64 | 3 | 5.329 | 4.155 | +22.03% |
| 0.5b | 256 | 248 | 1 | 6.761 | 5.681 | +15.97% |
| 0.5b | 256 | 248 | 3 | 6.876 | 5.768 | +16.11% |
| 0.5b | 2048 | 64 | 1 | 5.500 | 5.518 | -0.33% |
| 0.5b | 2048 | 64 | 3 | 5.638 | 5.664 | -0.46% |
| 0.5b | 2048 | 2040 | 1 | 7.132 | 7.147 | -0.21% |
| 0.5b | 2048 | 2040 | 3 | 7.441 | 7.397 | +0.59% |

## Software profiling repair verified

The supported cuda-sw and node:host-only flags produced a valid .nsys-rep and
SQLite with **22 actual CUDA kernel rows**. Capture17.400s and export0.016s
finished normally. This verifies only the tiny plumbing probe. No full model
Systems timeline has yet been collected with the repaired flags; Compute
counters remain unavailable and were not retried. The kernel table includes
registersPerThread and shared-memory fields, useful for the next model profile;
these are resources and activity, not measured hardware occupancy or SOL.

39 E compiler variants are preserved. Independent HF model gates were not run
in this no-model batch. Research C remains the latest pretrained timing.

## Resource lifecycle

Assignment UI22:33UTC (minute precision). One malformed partial terminal
command failed before launching a job; the correct wrapper launched once at
22:34:34UTC. Image pull22:34:38→22:36:41; container setup to22:37:10 consumed
156s before gates. Baseline child37.298s, E child19.961s, paired timing10.134s,
software probe17.400s. Inner completed22:38:37UTC; outer0/export0. Provider
release22:39:29UTC, before the22:42 earliest-minute deadline. No active GPU,
pending request or watch; meter stopped. The52s completion-to-release interval
includes export and the provider confirmation path, not analysis.

The2,546,105-byte archive downloaded through its authenticated UI file link
matches SHA256 e67117296b452d3c67b87c9021fafdc2d7eead15f1df04bb6c402ba1846e77f1.
Checkpoint3ce57a7d-13e1-433b-9d49-d770d200d09b is organization-only. Raw archive,
logs, JUnit, samples, binaries, trace and release screenshot remain in
../evidence/directE-ebb4b645/. Keep the4.80USD lease reserve until billing settles.
The user explicitly raised the project cap to60USD; account balance grants no
further authorization. No topups or billing/security changes.

## Next experiment

Test a fixed capacity256 request configuration with its existing lookahead
bounds, plus direct output, against both256 and2048 frozen controls. The two
calibration prompts have43/44 tokens;96 output tokens and the maximum6-slot
scout reserve fit256. This is an explicit short-request configuration, not an
automatic general-purpose bucket implementation. Also capture model timelines,
physical compiled resources, and investigate cached numerical drift before any
validated model speed claim. See WARP_F_PLAN.md.

## Settled reconciliation before F

Read-only provider reconciliation: D3.014098USD and E3.047671USD; exact total
GPU41.721125USD plus Marshall0.10 gives41.821125USD spent. Remaining under the
explicit60USD cap is18.178875USD. No unsettled rows, active GPU or pending
request. Prior reserves/partial observations above remain historical evidence.
