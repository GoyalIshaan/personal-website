# N6 plan: measure the projection paths and pipeline depth

Plan recorded after N4's executed40/40 gates and0.51% complete-boundary gain,
before implementing the next experiment. No GPU allocated or queued. The
account's last ledger balance31.112547USD is below32USD admission; total project
cap120USD is unchanged. Do not buy credits or imply that a pending request exists.

N4's384-case CPU static sweep is the direct source of this experiment. For
actual target shapes, the default FP8 BN64/BK128/four-warps stage2 schedule uses
about90–91 static registers/thread; stage1 examples use32. This motivates a
stage1-versus-stage2 experiment. Register counts alone do not establish latency,
occupancy or an improvement. Raw matrix and compiler logs are archived.

Prepare a deployed audit of all four first-layer target projection roles at
their real checkpoint dimensions. For each selected schedule: execute, inspect
native PTX/IR, save actual driver resources, compare decoded-operand algebra,
require exact common-row results at widths1/4/8 and separate rows, and time
the full activation-pack plus linear/SwiGLU operation in a CUDA graph. Use
trained weight bytes; label isolated timings as warm resident-weight timings,
not full-layer latency, physical DRAM bandwidth or request throughput.

Integrate these audits into N5 before graph capture/request timings. Prepare
separate complete trained runs for stages2 and1, with all role schedules fixed
within a run and distinct target recipe hashes. AR and EAGLE use the same target
weights/arithmetic within each run. Retain full output IDs so any cross-schedule
change is visible; do not promote a faster schedule from partial/missing rows.
N5's originalBF16 comparison and unqualified trained EAGLE CUDA SSD remain clear.

The future cloud batch runs N/N2 first. If setup/gates leave budget, one shared
360s limit covers assets, both trained configurations, setup/qualification and
timings. The outer660s work/setup bound and90s export still supersede it. Failed
or timed-out stages retain evidence and trigger export/release, with no
inference that process timeout releases the provider lease.

Keep the existing kernels and defaults intact. Only the opt-in experiment uses
stage1. Selection and integration require real complete-request measurements.
