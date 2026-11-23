# GPU run protocol

## Authorization and meter

The initial request asked for a handoff before GPU testing. The later user message
explicitly authorizes testing on National Compute using **at most $40 total** of
credits, and requires stopping compute after every test batch. The visible account
balance is larger; it does not enlarge this authorization. No paid top-up, recurring
payment, billing-setting change, or spending beyond $40 is authorized.

Live Grid inspection: 8× B300 nodes at $4/GPU-hour ($32/node-hour), or 8× MI355X at
$3/GPU-hour. Use B300 for the CUDA implementation. A request is prorated from grant
until release, including setup time; the nominal lease is four hours, not a reason
to leave it running. Request confirmation does not itself prove assignment.

National Compute has release rather than a non-billing pause for this pool. Save
all logs, source, structured results and receipts to the persistent workspace and
locally before releasing. Node NVMe is disposable. Verify `ended/released` and no
active node after each batch; a finished subprocess does not stop the meter.

Start with a 15-minute maximum batch ($8 at the quoted node rate), stop earlier on
the first actionable failure, export, release, then edit locally. Track lease grant
and release times plus ledger charges; model-assistant usage also spends credits.
Do not create an unattended queue request while doing local implementation work.
Do not run the service's unrelated hour-long starter training job.

## Staging without a GPU lease

1. Freeze a Git commit and upload a small source-only archive into the existing
   private workspace. Preserve a SHA256 receipt and source manifest.
2. Prepare a batch script with a hard subprocess timeout, command log and result
   export. No edits while billed compute sits idle.
3. Identify the stock B300-compatible PyTorch/CUDA container, preferably already
   cached. Inspect actual torch, Triton, CUDA, driver and compute capability on
   grant. The old H100 stack was torch2.8/cu128 + Triton3.4; do not silently assume
   that is the right B300 stack. Pin HF4.57.1 for the adapter and record any stack
   change. Do not replace host drivers or change machine security settings.

## Batch A: correctness, then release

```bash
python -m pytest kernel_lab/tests/test_config.py kernel_lab/tests/test_kernels.py kernel_lab/tests/test_runtime.py -q -x --junitxml=results-unit.xml
```

Use two GPUs for cross-device and SSD tests. The remaining devices need not run
unrelated jobs. Stop at a failure, save the full traceback and JUnit file, export
them, and release. Kernel execution, JIT compilation and tests are not considered
successful merely because Python AST parsing passed.

Actual attempts: unitA (`332d24d0`) stopped at32passes on the ranking oracle API;
unitB (`b97186dd`) stopped at54passes on an unindexed CUDA device guard. Both
leases are ended/released and raw evidence is preserved. The next `unit-tune`
batch reruns all checks before any microbenchmark, with a660-second outer
timeout and the same15-minute lease deadline. Do not interpret this batch ID as
the phase lettering below.

## Batch B: microbenchmarks and plan selection, then release

```bash
python -m kernel_lab.benchmarks.microbench --output kernel_lab/results/qkv-m1-s4 --model 7b --role qkv --queries 1
python -m kernel_lab.benchmarks.microbench --output kernel_lab/results/down-norm-m3 --model 7b --op out-norm --role down --queries 3
python -m kernel_lab.benchmarks.microbench --output kernel_lab/results/gate-m3 --model 7b --op gate-up --role gate-up --queries 3
python -m kernel_lab.benchmarks.microbench --output kernel_lab/results/head-m3 --model 7b --op head --role head --queries 3
python -m kernel_lab.benchmarks.microbench --output kernel_lab/results/gqa-m3 --model 7b --op gqa --queries 3
```

Compare frozen MMA S1/S2/S4/S8, SIMT and fixed-M16 vendor plans; vary BN/BK and
attention chunks within supported settings. Cover real 0.5B/7B/32B shapes and
query widths 1,3,7,8. Timing alone does not select a numerically failing plan.
Regenerate full-model sequence gates after choosing a plan. Record losing
candidates, compiler failures, spills, scratch bytes and timing distributions.

Microbenchmarks capture 32+ operations per graph to amortize host enqueue gaps.
Rotating weight banks target 512 MB, and results explicitly say if that target was
not met. Hot KV/table tests make no HBM claim. Useful bytes/second is not measured
DRAM bandwidth. Cache policy, L2 hit rates, actual DRAM bytes and achieved clocks
need counters.

`benchmarks.sweep` performs a bounded bundled sweep in one process and excludes
any incomplete or numerically failing role/width combination from selection.
`benchmarks.bandwidth` measures large-working-set read-with-reduction and copy
kernels, checks their outputs, and records clocks/power before and after. Its
achieved useful bandwidth describes that SIMT path; it is not a physical ceiling
or a measured inference SOL score. These two new commands are not GPU-tested at
the unitB checkpoint.

## Batch C: pretrained audit and throughput, then release

```bash
python -m kernel_lab.benchmarks.end_to_end --output kernel_lab/results/7b-kernel-ar --backend kernel --method ar --suite calibration
python -m kernel_lab.benchmarks.end_to_end --output kernel_lab/results/7b-kernel-sd --backend kernel --method sd --k 2 --suite calibration
python -m kernel_lab.benchmarks.end_to_end --output kernel_lab/results/7b-kernel-ssd --backend kernel --method ssd --draft-device cuda:1 --k 2 --branches 1 --suite calibration
```

Capture HF oracles before conversion; require independent numerical gates and
exact native-AR output. Run v2-fused and v2-invariant on the SAME B300/container,
then the selected new plans. Balance backend/process order and repeat sufficiently;
do not compare new B300 numbers directly with historical H100 numbers as a code
speedup. Retune K/B only on calibration and freeze before verification/reserved.
Compare SSD with the faster independently tuned colocated/split SD, not only one
SD setting. Record AR chunk size and unused final-chunk work, true EOS length,
prefill, decode, return serialization, graph setup and total paid time separately.

Existing eight HELDOUT prompts are now `verification` regression cases because
v2 repairs used them. New `RESERVED` cases are frozen before plan selection and
must stay out of tuning. A failure invalidates an untouched-final claim if they
are subsequently used for repairs. Long-context and actual early-EOS tests are
separate from the 192-token throughput workload.

The stricter new numerical gate may reject a legacy configuration (v2 fused32B
previously showed TV around .061 at one checkpoint). Save this as evidence and
investigate; do not quietly relax the threshold or erase the historical result.

## Batch D: counters, only if credit remains

Use Nsight Systems for host launch gaps, P2P/event dependencies, graph launches,
draft/target overlap and critical path. Use Nsight Compute on representative
isolated kernels for SpeedOfLight, LaunchStats, Occupancy and MemoryWorkloadAnalysis.
Discover section/metric names with the installed version. Inspect register spills,
SM activity, tensor-pipe use, DRAM/L2 throughput, actual bytes and achieved clocks.
Keep profiler timing separate from unprofiled end-to-end timing.

For each hardware family, build the appropriate bandwidth/compute model. H100 SXM
specs are 3.35 TB/s and about989 TFLOPS dense BF16 (the1979 figure is sparse).
These are optimistic reference assumptions, not measured sustained rates and not
B300 specs. The roofline helper excludes input-embedding matrix streaming, accounts
for full output-head streaming, and reports omitted traffic. Its KV-from-HBM
scenario is not an absolute physical lower bound: KV can be served from cache.

References: [National Compute Public Research](https://docs.nationalcompute.com/public-research/),
[H100 specs and sparsity footnote](https://www.nvidia.com/en-us/data-center/h100/),
[Nsight profiling/roofline guide](https://docs.nvidia.com/nsight-compute/ProfilingGuide/index.html),
[NVIDIA container release notes](https://docs.nvidia.com/deeplearning/frameworks/pytorch-release-notes/rel-26-03.html).
