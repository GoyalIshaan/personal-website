# N6 local implementation checkpoint

Following the [recorded plan](N6_PROJECTION_PIPELINE_PLAN.md), added
`benchmarks/native_role_audit_n6.py`. It receives an already loaded native
target and audits all four first-layer roles at actual target7B dimensions.
Every selected schedule must pass decoded-operand algebra tolerances, exact
common/separate-row checks at widths1/4/8, finite outputs, native PTX/IR checks
and zero deployed spills. It preserves instruction artifacts and actual driver
resources separately for each width. Timing includes activation packing plus
linear/SwiGLU, seven samples of16operations/graph. The resident first-layer
weight timings exclude residual/RMS, attention, head and whole-request work.
The algebra tolerance follows the original N primitive gate and is not a
quality certificate. No GPU execution of this new audit has occurred.

N5 now accepts an opt-in native pipeline depth1 or2, recorded in every role
plan and target recipe hash. It writes progress markers around cache verification,
source loading, quantization, projection audits, graph capture, correctness and
request timing. It runs N6 audits before capturing the full target/EAGLE graphs.
The future cloud worker prepares stage2 first, then stage1, using the same pinned
target and trained EAGLE checkpoint, development input recipes and measurement
protocol. Each run independently checks AR/EAGLE complete outputs, every-row
logits/raw features, EOS and unrelated reuse before timed repeats. No cross-plan
bitwise equivalence is assumed; output IDs and per-plan identities are retained.

N/N2 gates precede the trained phase. A150s prefix cutoff avoids entering model
work after a slow setup. One360s budget covers asset fetching/hash verification
and both complete trained configurations. The660s whole-work bound supersedes
it; export remains bounded90s and the provider lease needs explicit release.
If the candidate or the second run is incomplete, retain partial evidence and
report no paired whole-request improvement. Graph/process cleanup is recorded
separately from lease release. Existing measured kernels/defaults are preserved.

Local verification:318passed,33GPU-dependent skips in the broader kernel_lab
plus root suite.172maintained Python sources parse;25cloud shell scripts pass
syntax checks. Default N5/fetch commands perform no downloads or CUDA work.
Tests reject missing roles, drafter geometry substituted for target, wrong plan,
missing widths, bad instruction/spill receipts, row mismatch and corrupted timing.
[Validation receipt](N6_LOCAL_VALIDATION.json), [pytest](N6_LOCAL_TESTS.xml).

No GPU is allocated or queued. Last account ledger31.112547USD precedes the
last nativeN4 settlement interval and is below32USD admission. NativeN4 was
explicitly released; a stale ledger resource entry is not a live lease. The
120USD total authorization remains; no credits were bought. Code/source can be
staged on the free CPU workspace while a future paid test awaits admission.
