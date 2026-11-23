# Fusion D: correct arithmetic, rejected broad fusion

Executed source **4f14981ab779644117d2ca7c9fb3d75f1143b504**. The
RoPE/append/attention fusion passed all its correctness gates, but lost14 of16
paired complete-path timings. **It is not promoted.** No pretrained generation,
new validated engine speedup, or hardware SOL measurement was produced.

## What completed, despite the outer timeout

*99 baseline checks passed in34.01s;25 experimental cases were excluded.
*9 fusion checks passed in16.76s. These include primitive poisoned-cache,
independent V-stride, exact materialized output/cache, query-width invariance,
changed-position graph replay, tiny-model AR/SD and two-GPU SSD reuse checks.
*16/16 paired micro cases completed;0 failed or skipped. All output/cache
comparisons are exact.32 emitted fusion PTX/IR/CUBIN variants were exported.
*The tiny software Systems probe started after those jobs, then the whole-job
230s timeout interrupted it. Its log is empty, no report exists, and the suite's
incremental summary remains `running`. **Software tracing remains unverified.**

The individual child exits/JUnit/rows establish the completed checks; an outer
exit124 does not erase them. Conversely, the container's EXIT receipt incorrectly
reports0 after termination. That receipt does not establish suite success. The
next source adds explicit TERM/INT exits143/130. Preserve the original false-green
receipt as an observed harness failure; do not edit it to match expectations.

## Paired timings, including every loss

Five CUDA-event samples per case,32 operations per captured graph. First variant
alternates by case. Baseline includes its separate RoPE/cache writer, partial
attention and merge; candidate includes fused RoPE/cache/attention plus a merge
for multiple physical splits. One physical split writes output directly.
Both use owned caches, identical BF16 inputs, unchanged reduction policy,
chunk256/tile64, model head geometry and positions. Caches are intentionally hot.

The percent column is **100*(fused_time/baseline_time -1)**: positive is slower.
There is no weighted model-level average and no confidence/heldout claim.

| Model geometry | Capacity | First position | Query width | Baseline us | Fusion us | Time change |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 7b | 256 | 64 | 1 | 6.125 | 7.820 | +27.67% |
| 7b | 256 | 64 | 3 | 6.280 | 7.801 | +24.22% |
| 7b | 256 | 248 | 1 | 8.324 | 12.347 | +48.33% |
| 7b | 256 | 248 | 3 | 8.574 | 12.321 | +43.70% |
| 7b | 2048 | 64 | 1 | 6.564 | 9.199 | +40.14% |
| 7b | 2048 | 64 | 3 | 6.778 | 9.301 | +37.22% |
| 7b | 2048 | 2040 | 1 | 9.174 | 13.229 | +44.20% |
| 7b | 2048 | 2040 | 3 | 9.321 | 13.510 | +44.94% |
| 0.5b | 256 | 64 | 1 | 4.991 | 4.852 | -2.79% |
| 0.5b | 256 | 64 | 3 | 5.470 | 4.995 | -8.68% |
| 0.5b | 256 | 248 | 1 | 6.511 | 7.529 | +15.64% |
| 0.5b | 256 | 248 | 3 | 6.976 | 7.679 | +10.08% |
| 0.5b | 2048 | 64 | 1 | 5.536 | 6.322 | +14.20% |
| 0.5b | 2048 | 64 | 3 | 5.733 | 6.468 | +12.82% |
| 0.5b | 2048 | 2040 | 1 | 7.165 | 8.902 | +24.24% |
| 0.5b | 2048 | 2040 | 3 | 7.420 | 9.258 | +24.77% |

The7B path loses all8 cases, with24.22–48.33% higher time. The0.5B path wins
only the2 short-context,capacity256 cases (2.79% and8.68% lower time) and loses
its other6 cases by10.08–24.77%. Those two isolated wins do not justify broad
runtime adoption. Full samples and ratios are in `fusionD-attention-pairs.csv`
and the immutable raw evidence. These micro timings cannot be compared directly
with Research C's pretrained tokens/s or presented as an engine speedup.

## What this teaches us, and what remains a hypothesis

Reducing launch count did not reduce elapsed time in most tested geometries.
The fusion performs packed-current-KV rotation inside attention tiles and may
repeat query rotation across active splits. That adds computation, loads,
intermediates and layout work to a previously smaller attention program.

Compiler metadata for the4 variants with7B packed-width/head constants reports
**69,632 bytes of shared memory per CTA**. Across all32 variants the range is
6,144–69,632 bytes. The saved baseline-C attention variants report11,264 or
20,480 bytes, but they are not a fully matched per-case resource ablation.
This supports investigating temporary lifetimes/shared-memory/layout costs.
It does not prove that occupancy, register spilling or bank conflicts caused
the timing loss. Actual allocated-register/spill counts and hardware counters
were not collected. Absence of PTX local operations cannot rule out spills
introduced later by the assembler; PTX register declarations are virtual.

Read after this outcome:
[NVIDIA binary utilities](https://docs.nvidia.com/cuda/cuda-binary-utilities/)
for actual binary resources, the
[Triton3.7 softmax tutorial](https://github.com/triton-lang/triton/blob/release/3.7.x/python/tutorials/02-fused-softmax.py)
for compiled register/shared-memory collection outside timing, and the
[warp-specialization design](https://pytorch.org/blog/warp-specialization-in-triton-design-and-roadmap/)
for buffer lifetime/layout/scheduling tradeoffs. Their techniques are leads,
not performance evidence for this kernel. R014–R016 record adopted/deferred use.

## Decision and next bounded experiment

Keep D as a versioned, numerically tested **performance rejection**. The next
candidate isolates the single-split normalization epilogue while retaining
materialized RoPE/cache writes and the original dot/online-softmax sequence.
See `DIRECT_E_PLAN.md`. It falls back to the baseline for multiple physical
splits and does not promise an improvement for the default2048-capacity path.
Static request-capacity bucketing would need a separate correctness/performance
experiment, including speculative lookahead, before extending that opportunity.

The prior full-model independent HF gates still fail, so resolving that drift
and comparing identical model/backend/schedules remains necessary before
publishable AR/SD/SSD gains. The C Torch activity trace still places target
matrix work ahead of attention in summed duration; attention fusion alone does
not establish proximity to peak model performance.

## Execution, release and provenance

The provider offered a whole8xB300 node at$32/node-hour. Source and105 manifest
entries were verified on CPU before request. The assignment UI reported only
21:52UTC, so earliest-minute accounting set a conservative21:59:30 release
ceiling. Launch at21:53:42 used a **shortened230s hard job** instead of330s to
retain cleanup/control margin. This conservative reduction interrupted the
profiler after the numerical/timing jobs completed; it was not a kernel failure.

Image pull began21:53:47, container phase21:55:47, fusion setup21:56:13 and gates
phase21:56:20. Setup consumed158s of the230s job. Child wall times were37.003s,
19.562s and13.648s for baseline gates, fusion gates and paired timings. Cold
setup and UI assignment/launch delay are project-cost problems, not kernel time.
Future work should prepare a reusable pinned environment before a short paid
measurement window when the provider permits it.

Outer exit124; export exit0. CPU checksum/exits were verified by21:57:52.
**Release confirmed21:58:15UTC**: ended/released, no node or pending request,
meter stopped, watch disarmed. The Mac locked afterward; inbound download later
completed, and the local checksum matches. No additional lease was requested.
Final billing reconciliation is recorded separately; account balance never
expands the user's$40 authorization.

Archive:3,732,986bytes, SHA256
`c0540877ae404b20d24b6cee1cb5aec27eb753ac072cf2e93ece4ed7d29eb42a`.
Organization-only checkpoint:`d19e79b8-4b2d-4782-8b9d-8218c2cad4ac`.
Raw archive, process logs, samples, compiler artifacts, JUnit and screenshot:
`../evidence/fusionD-4f14981a/`. The source4f14981a ZIP remains immutable.

## Reconciliation and file-tool follow-up

A later billing summary displaysGPU$38.68 and month$38.77, but the expanded
D row still shows a partial$1.78 from16:55:55CDT with no end. These are saved
observations, not a final D charge. Keep the$4 reserve until settlement; no
additional node is authorized by the larger account balance. Release proof is
independent of that delayed detail row.

The local bounded CUBIN inspector was invoked and exited2 because no vendor
`cuobjdump` is installed on this Mac. Its unavailable receipt is preserved.
This did not inspect registers/spills; the prepared Linux CPU-file path remains
a way to collect vendor resources without allocating a GPU.
