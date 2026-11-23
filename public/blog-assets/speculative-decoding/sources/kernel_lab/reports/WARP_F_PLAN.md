# F: matrix resources, cached attribution and short-request E controls

Prepared after E measured8 single-split wins and verified software capture.
Original notebook, frozen unit-C plans and all baseline/D/E JIT bodies remain
unchanged. Only explicit two-warp plan support is added; default warps stay4.
Sources R017–R020 and the earlier reading log record the actual inspiration.
No automatic tuning or default promotion is performed.

## Planned sequence

1. Full non-experimental correctness in the pinned container.
2. Software Nsight Systems AR/SD/SSD profiles using the tiny actual-kernel-row
   preflight. No Compute counters are retried. Per-kernel registers, block and
   shared-memory allocations are recorded; decode analysis requires verified
   prefill and synchronization boundaries. None is hardware utilization or SOL.
3. Experimental two-warp primitive, epilogue, stable head, query invariance,
   captured/eager AR/SD and two-GPU SSD reuse/rejection checks. Failed gates
   exclude the matrix timing candidate and retain raw failures.
4. Fresh independent HF checkpoints before packing. Native frozen/transposed4/
   transposed2 audits use unchanged .05 L2/.02 TV/identical-top1 thresholds.
   At cal-code forced step2, reset each variant to HF's own cache. Compare
   native/factored custom operators, vendor linears, vendor attention, vendor
   nonlinear operators and the combined vendor control. These diagnose current
   arithmetic versus propagated prefix/cache error; they are not timing results.
5. All five matrix roles at query widths1/3, frozen/transposed4/transposed2.
   Same tile/split groups between4 and2 warps, rotating512MB weight bank,
   seven samples, rotating first variant. New resources come from loaded
   CompiledKernel fields during warmup, outside graph replay timing. CUBINs
   are preserved with hashes; vendor cuobjdump inspects files if present.
   Missing resources stay missing, never fabricated0. No occupancy forecast.
6. 2GiB exact-read/copy streaming calibration, default clocks unchanged.
7. Fresh-process AR/SD/SSD calibration comparison: frozen capacity2048,
   frozen256, direct256. The directF-control plans change ONLY the E flag.
   They do not use E's earlier matrix hybrid. The two43/44-token prompts,
   output cap96 and scout reserve6 fit256; the runtime checks each request.
   Two repeats per prompt; all launched scouts are timed. Report sequence
   agreement, acceptance and independent HF failures along with every row.
   These are small calibration observations, not peak/heldout claims.

No two-warp model speed is claimed from F microbenchmarks. A later full-engine
comparison needs an eligible complete matrix result, numerical and sequence
gates, and separate unprofiled measurements. Automatic cache bucketing is not
implemented;256 is an explicit configuration for these bounded requests.

## Budget and lifecycle

Project authorization is60USD total, extra20 from the user. Before settlement,
retain the old4USD D and4.80USD E reserves; conservative remaining15.440644.
F reserves at most7.466667USD:840s allocation-to-release at32USD/node-hour.
The660s hard wrapper includes image/source/setup; cleanup/export<=90s, leaving
90s launch/control/release margin. Recompute the bound from the observed grant
and shorten before launch if necessary. Stage/checksum all source before lease.
Never inspect results, research or code while keeping the GPU idle. Export and
release immediately after the bounded batch, then download/verify/analyse.
No held/follow-up request, topups or billing/security/clock changes.

Expected cold setup is about156s, from D/E evidence. F suite has420s remaining-
budget child orchestration, with incremental logs, explicit skips/timeouts and
complete child receipts. A whole-shell0 is not a replacement for completed
profiles and passing gates. Local validation and actual GPU results remain
separate and will be appended after execution.

## Settled reconciliation before F

Read-only provider reconciliation: D3.014098USD and E3.047671USD; exact total
GPU41.721125USD plus Marshall0.10 gives41.821125USD spent. Remaining under the
explicit60USD cap is18.178875USD. No unsettled rows, active GPU or pending
request. Prior reserves/partial observations above remain historical evidence.
