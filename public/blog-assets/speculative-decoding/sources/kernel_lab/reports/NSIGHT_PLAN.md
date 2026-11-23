# Focused profiling protocol, prepared 2026-10-21

Status: prepared, CPU checks passed; no new GPU lease or profile yet. This is
the next step after batch H and replaces the unexecuted I comparison batch.
No GPU kernel changes are claimed from the profiling harness alone.

## Questions to measure

1. How much target time is actual CUDA activity, and where are the gaps?
2. How much of SD/SSD is target verification, draft/scout work, packet waits,
   cache copying, or host synchronization? Are scouts actually overlapping?
3. Which projection, gate, head, attention or reduction kernels dominate?
4. For the largest costs, do counters indicate DRAM traffic, instruction issue,
   insufficient occupancy, dependency stalls, redundant loads or split merges?

The C microbenchmarks show that target QKV still loses to Torch (9.198 vs
8.641 us) and gate gains little (46.009 vs 49.845 us). These are leads, not
proof of the full-engine critical path. A stream-read bandwidth estimate and
absence of newer MMA instructions do not establish measured engine SOL.

## Collection and gates

`cloud/workspace_nsight.sh` wraps the pinned B300 container with a 540-second
whole-job bound, then at most 90 seconds for stop/export. Release the provider
lease immediately after export, with a 12-minute hard operational limit
($6.40 at $32/node-hour). Keep the remaining authorized budget for the next
measured optimization attempt. No paid allocation during code preparation.

The run uses both pinned pretrained models, frozen C plans, BF16 with full
precision vendor reductions, calibration prompts only, K2/B1, split draft GPU1,
target GPU0, and AR chunk8. Full correctness tests precede capture. Independent
HF audits keep the original thresholds and every failed row. The explicit
diagnostic flag permits profiles despite that known failure; target width
invariance and exact same-backend native AR remain mandatory before timing
and before and after the captured request. No failed configuration becomes a
validated speedup result.

Nsight Systems launches AR, SD and SSD in separate processes. Each captures a
single warmed 32-output-cap request, bounded by cudaProfilerStart/Stop and an
explicit NVTX `capture/<method>` range. Per-node graph tracing exposes GPU
kernel activities. Temporary NVTX wrappers label prefill, target forwards,
draft/scout proposals, KV copies, verifier, packet staging/waits and device
synchronization; they are removed even after exceptions. Capture and profiler
overhead can alter scheduling. All rows from these launched processes are
marked instrumented and excluded from clean unprofiled performance claims.

Raw `.nsys-rep`, SQLite, stats logs and analyzed JSON are exported. Analysis
clips to the explicit NVTX window and takes the union of kernel/copy/memset
intervals separately on each device. The resulting activity fraction is NOT
SM occupancy, DRAM utilization or SOL. Overlapping kernel times are summed
only for ranking; nested NVTX inclusive times must not be added together.

Nsight Compute runs separate synthetic probes at actual Qwen geometries for
QKV, output+RMS, gate/SwiGLU, down+RMS, head ranking, GQA across three contexts,
residual RMS, RoPE writes, KV copying and verifier. Each probe checks and warms
before profiling. Head top-k has a same-plan materialized ranking check;
other matrix operations use independent Torch references. Exact state checks
or relative-L2 primitive checks retain their full numeric error metrics.
Failed probes are recorded and excluded, not profiled as correct operations.

The available section list selects SpeedOfLight, LaunchStats, Occupancy,
MemoryWorkloadAnalysis, SchedulerStats and WarpStateStats. At most64 launches
per probe group are profiled. Clock control is disabled. Matrix probes flush
cache between replays; state probes retain normal cache behavior. These
replay-based counter measurements are synthetic kernel diagnostics, not E2E
latency. Raw `.ncu-rep`, CSV, checks, policies and exact argv are preserved.

## Tools and failure handling

Discover installed profiler paths and versions first. If absent, download
the pinned official NVIDIA Ubuntu24.04 packages, check exact bytes/SHA256,
and extract into task-local storage. No host package configuration changes.
The package hashes and origins are in `cloud/nsight_tools.py`.

Record read-only driver parameters. If hardware counters are restricted,
retain the actual ERR_NVGPUCTRPERM output, stop repeated NCU attempts and
release the lease. Do not change profiling permissions, container privileges,
driver flags or security settings. Preserve partial reports after bounded
timeouts. Export all result artifacts; skip only the compiler seed already
archived in C. No source uploads, GPU captures or speed results are implied
by preparation or CPU tests.

## Next measured changes

After release, rank target/draft kernels and device gaps by contribution to
the request. Choose a concrete change from that evidence, document its
hypothesis before editing, keep a versioned baseline and rerun a bounded
same-stack A/B. A faster isolated kernel must improve request time without
breaking numerical, width, cache, EOS or native-AR gates to be retained.
If host gaps dominate, reduce synchronization/launch/packet work; if weight
traffic dominates, optimize the dominant GEMM/head shape and measured memory
traffic. Do not rewrite every kernel indiscriminately.

## Primary references

- [Nsight Systems focused capture and CLI](https://docs.nvidia.com/nsight-systems/UserGuide/index.html)
- [Nsight Systems statistical interpretation](https://docs.nvidia.com/nsight-systems/AnalysisGuide/index.html)
- [Nsight Compute CLI, replay and cache policies](https://docs.nvidia.com/nsight-compute/NsightComputeCli/index.html)
- [NVIDIA counter-permission explanation](https://developer.nvidia.com/ERR_NVGPUCTRPERM)
- [Official pinned-package metadata](https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/Packages.gz)
