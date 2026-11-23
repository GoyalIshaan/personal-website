# N: native FP8/FP4 projections and feature-aware EAGLE

Status: implemented locally, CPU checked, CUDA uncompiled/unexecuted. GPU
testing remains paused by the user. No allocation, upload, pretrained weight
tensor download, GPU spend, speed measurement or default promotion occurred.
The $80 cap is unchanged. This candidate does not establish 1,000 tokens/s.

The pre-edit plan is [saved separately](N_NATIVE_PRECISION_AND_EAGLE_PLAN.md).
Events K139 onward, [work log](WORK_REPORT.md), and readings R050–R056 preserve
the order of hypotheses, implementation, checks and remaining uncertainty.
M source779d58a and its ZIP, original notebook, v1 and v2 remain available.

## What changed and why

| Component | Implementation | Evidence available here |
| --- | --- | --- |
| Native FP8 | E4M3 operands, FP32 accumulation, independent FP32 scale per activation/weight row | CPU format/algebra/row-independence checks; CUDA candidate only |
| Native FP4 | Packed E2M1 values, E4M3 scales per16 K values, independent FP32 row globals | CPU packing/swizzle/algebra checks; CUDA dot_scaled candidate only |
| Activation packing | Explicit two-pass and one-launch row-fused alternatives | Same CPU reference; prepared bitwise GPU comparisons, neither promoted |
| Projection epilogues | Ordered split merge, bias, BF16 boundaries, fused SwiGLU or residual/RMS | Prepared CUDA algebra and every-row exact-width gates |
| Target runtime | Opt-in NativeQwen and native projection hooks for standalone draft scouts | Prepared full tiny AR/SD/serial-SSD/parallel-SSD equality gates |
| EAGLE algebra | One-layer direct reference with separate norms,3H feature FC,2H QKV, GQA, raw-H recurrence, offset vocabulary | CPU tiny-Qwen and forced-state tests |
| EAGLE target capture | Raw residuals after explicitly selected layers; output buffers owned per graph width | CPU hook/prefill checks; CUDA wrapper unexecuted |
| EAGLE drafter | Captured K-step proposals and forced refresh, native role options, headless accepted-prefix repair | CUDA code and gates prepared; no trained checkpoint inference |
| EAGLE prefix prefill | FC/norm/K/V only; skip unused query, attention, MLP and head | Exact CPU KV comparison with full reference at1/7/19 tokens |
| EAGLE GPU SD | GPU verifier, one4-int64 packet/round, one final output serialization, queued feature transfer | Prepared two-device equality/EOS/reuse cases; unexecuted |
| EAGLE SSD | CPU forecast state-machine reference, token-only reuse, explicit refresh | CPU acceptance/rejection/hit/miss checks; CUDA overlap unfinished |

The existing BF16 kernels and measured model/runner/prefill/speculative source
files were preserved. New code lives under optimized/, with tests, reports and
research receipts in their existing separate directories. Existing defaults
do not select N. The native branch hooks require an explicit NativeQwen model.

## Native arithmetic contract

M's W8A16/W4A16 implementation reconstructs BF16 weight tiles before a BF16 dot.
N adds separate low-precision operand instructions. The language API alone
cannot establish native execution: a later real compilation must emit the
expected low-precision MMA and operand IR. The gate rejects BF16/f16 MMA in
the isolated native projection primitive and saves PTX/IR hashes and sources.

FP8 uses `alpha[row] = max(abs(row))/448`, clamped to FP32 minimum-normal, and
E4M3 nearest-even conversion. FP4 uses a row global `alpha = amax/(6*448)` and
an E4M3 scale for each16 values; packed values use nearest-even E2M1. Even K
occupies the low nibble. Weight scale storage can use the independently tested
row128/k4 layout. Every operand pads K to128, independent of query count.
The row-global FP4 recipe is our declared format; loading a ModelOpt NVFP4
checkpoint directly is not supported by this adapter.

Activation scaling depends only on that query row. A huge unrelated verify row
must not alter another row's codes, scales, reduction order or output. Plans
fix the physical query tile at8 for FP8 and32 for FP4, with no query-count
dispatch. Split-K partials combine in an explicit order, followed by weight
global, activation global, optional bias and BF16 rounding. SwiGLU and RMS
retain declared BF16 intermediate boundaries. The head, KV and common dense
prefill remain BF16. Label results as low-precision projections with BF16
head/KV/prefill, rather than claiming every operator uses FP4.

The one-launch row-fused quantizer computes amax, globals, block scales and
packed data in one CTA per query. The two-pass quantizer uses a row reduction
followed by parallel packing CTAs. Fusion saves one launch but can lose to
register pressure, spills or low B1 occupancy. The plan records this choice;
neither version has a GPU result.

The independent algebra oracle decodes operands and evaluates an FP64 dot.
This checks format/scaling with tolerance. Native FP32 accumulation is a
different exact contract from a dot over materialized BF16 weights. A separate
exact gate compares every corresponding query row, and complete greedy tokens
against the same native target's width-one AR. Original BF16/HF numerical and
quality comparisons remain separate. K's failed HF audit is unchanged.

## EAGLE alignment and cache repair

The pinned checkpoint is thoughtworks/Qwen2.5-7B-Instruct-Eagle3 at
ff17dda64a036cf5bd7bc56c0ab728325f1c0d0b. Actual tensor geometry has28 query
heads and7 KV heads; the older model-card4-KV value is incompatible. Features
are ordered raw residuals AFTER decoder layers1,13,24, before final RMSNorm.
HF's nonfinal hidden_states slots correspond to layer+1. The new CUDA wrapper
captures raw residuals directly, including a raw final-layer slot if explicitly
requested by a diagnostic contract. Per-width graph buffers keep feature
ownership stable across prefill and mixed-width replay.

Feature position i pairs with token i+1. Initial shifted prefill consumes
prompt[1:] with features[:-1]. Generation first performs the exact target
width-one decode of the last prompt token and emits its AR token; using dense
prefill logits here could change the numerical path. That initial step counts
in decode time and output length, including EOS or a one-token request.

For a target verification beginning at token position b, the draft feature
cursor is b-1. The first proposal uses actual target3H features at b-1;
subsequent proposals feed back predicted raw H. After a accepts, keep the first
true-feature row, discard the predicted suffix, and rebuild a rows using real
target features. The new draft cursor is b+a, exactly one below the next target
base b+a+1. The next seed feature is the actual target feature at b+a.

Example: target base8, draft feature cursor7, K3, a2. Keep draft row7, rebuild
rows8/9 with actual F8/F9 paired with accepted tokens9/10. The next target base
is11 and draft cursor10; actual F10 conditions pending token11. Accepting the
tokens alone does not make previously predicted feature KV authoritative.

GPU SD preserves this rule with a headless repair graph. Decoder workspaces are
allocated once and reused across requests, with a per-request bounded output
view. Its normal loop uses
one compact metadata packet and no per-round output tensor serialization.
It queues all K+1 features to the draft GPU while the packet is staged; this
includes rejected features and their full logical payload is reported. Copy
ordering, actual overlap and the bandwidth/latency tradeoff require future
CUDA execution and profiling. Initial AR, tail overshoot, all repairs and both
devices are included in synchronized decode time. Final token serialization
is recorded separately. Host metadata emission still costs one round trip.

The CPU SSD oracle forks private forecast states using predicted H, checks
outcome plus seed, reuses TOKENS only and forces a refresh from true features.
Every forecast/miss/refresh is counted. Its CPU cache clones and serial schedule
are reference machinery. There is no EAGLE CUDA SSD overlap implementation or
EAGLE forecast-KV adoption in this revision. Existing standalone-Qwen SSD is
separate and receives its own native-target prepared gates.

## Local checks and preserved limits

The complete local suite passes202 CPU tests;17 CUDA modules skip. The37 new
N CPU cases cover formats/layouts, unrelated rows, zero/tiny/large rows,
instruction-auditor rejection fixtures, local payload corruption, exact
prefill/KV preservation, seven-KV-head reference geometry, alignment,
teacher-forced repair, complete tiny-Qwen greedy SD, forecast rejection/hit/miss,
EOS, one-token requests and unrelated-request reuse. PTX strings used by CPU
auditor tests are synthetic fixtures. They are not emitted GPU instructions.
No numerical/compile/timing failure has been observed on N CUDA because it has
not run. Remaining compile risks are recorded as untested risks, not passes.

The gate plan prepares28 CUDA cases and eight format/split/quantizer instruction
proof slots. It requires two visible SM100/103 GPUs, Triton3.7.0, complete
unskipped cases, exact source hashes and matching saved emitted code. It cannot
certify trained7B EAGLE acceptance, original BF16 quality, CUDA EAGLE SSD or
performance. A real N CUDA receipt has not been produced. No older M certificate
can be reused for N's changed implementation.

Only public checkpoint metadata/index payloads from M and new LFS metadata were
read. No BF16 checkpoint tensor was downloaded. The local loader verifies the
complete717798344-byte file against SHA256
f77665495c620c17d05d6672444094844866e2a27e545d6837e8b107465ddfd8,
then config/header, tensor ABI, mapping and device/dtype before inference.
This file digest is independently saved in research/eagle3-n metadata. The
full pretrained loader has not been exercised without that file; synthetic
file corruption checks exercise only its streaming size/hash primitive.

## Entry points and future validation order

Local CPU-only plan (safe during the pause):

```sh
python -m kernel_lab.benchmarks.native_gate_n
python -m pytest -q kernel_lab/tests/test_native_formats_n.py kernel_lab/tests/test_native_protocol_n.py kernel_lab/tests/test_eagle_reference_n.py
```

Code entry points: native_formats.py; kernels/native_precision.py;
runtime/native_precision.py; eagle_checkpoint.py; eagle_reference.py;
eagle_prefill.py; runtime/eagle_target.py; runtime/eagle.py;
runtime/eagle_decode.py. All are under kernel_lab/optimized/.

After explicit GPU resume and a fresh budget/admission/release check, the
prepared gate can run on already provided GPUs with
`python -m kernel_lab.benchmarks.native_gate_n --execute-gpu --output NEW_DIR`.
It has a600s default child-process timeout and preserves logs, JUnit, PTX/IR and
receipt. This command never allocates/releases a provider node; a finished or
terminated subprocess does not establish stopped billing.

1. Establish native compilation/instruction proof, byte-exact activation
   conversion, algebra tolerance and exact every-row widths. Inspect FP4's
   physical32-query tile lowering and spills. Stop on fallback/unsupported code.
2. Run synthetic complete AR/SD/standalone SSD and EAGLE SD gates, including the
   packet controller, poisoned tails, EOS/reuse and explicit graph cleanup.
3. On the pinned7B target and real EAGLE weights, verify selected raw feature
   alignment and full outputs. Measure trained acceptance at K1..7; changing
   target or draft precision can reduce it. Include a separate BF16 quality audit.
4. Profile/timestamp B1 at128/512/2048/4096 prompt tokens. Compare each quantizer,
   projection schedule, draft precision and controller against fastest matching
   AR/SD on identical hardware. Count prefill, initial seed, repair, feature
   copies, setup/memory and all discarded work. No speed forecast replaces this.
5. Use measured draft/repair/copy costs to build an actual overlapped EAGLE SSD
   scheduler. Consider a native token-only head, further launch/control fusion
   or a persistent kernel only after the dominant cost is measured. Secondary
   batches stay at32 or below; they do not replace the single-request objective.

The outstanding issue is obtaining GPU evidence under the explicit pause.
Local syntax, CPU algebra and state-machine tests cannot answer whether these
native tiles compile efficiently or whether the trained drafter accepts enough
tokens to amortize verification and cache repair.
