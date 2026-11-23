# K: single-request speed, short/medium contexts, batch cap32

The user replaced the active batch512/native-maximum-context request with a
batch32 cap, short/medium inputs, and priority on one-request tokens/sec.
The target remains1,000 output tokens/sec from one request on two GPUs.
K is prepared locally. It has **no CUDA compilation, execution or new timing**.
The last GPU survey remains I, whose independent HF audit failed.

## Active scope and execution priority

Active unique-request batches: **1,2,4,8,16,32**. Short inputs: **128,512tokens**;
medium inputs: **2048,4096tokens**. Each timed request generates128tokens with
three repetitions by default. Cache capacity includes generation and eight
reserve positions; a4096-token input is not a4096-position total allocation.
No RoPE extension or precision change was added. Worker CLIs reject batch>32
and input>4096 before CUDA work. Internal native-capacity helpers and historical
receipt readers retain their older supported limits.

[Model grid](K_CONTEXT_BATCH_GRID.json) contains80 planned rows, including
control AR1/TP2 AR/DP2 AR and B1 packed gate/up variants for AR1/TP2 AR.
DP2 still requires at least two requests; selected B1 DP rows are explicitly
unsupported. [Kernel grid](K_KERNEL_GRID.json) contains220 one-layer rows:
216 control shapes plus four B1 gate/up candidates. Zero predicted memory
non-fits at267GiB is an estimate, not observed capacity. All rows are unexecuted.

The earlier runner placed microbenchmarks before pretrained model cases.
K builds an explicit schedule: all selected B1 model cases, then B1 kernel
cases, secondary model batches, and secondary batched kernel cases. This
priority is enforced even if a selection override lists a large batch first.
CUDA correctness and tiny TP2 gates still precede any inference timings.
Time-limited cases remain visibly unrun; no complete sweep is claimed.

Default B1 order is TP2 control, one-GPU AR control, and packed TP2 at input128,
then the same three at2048. B1 micro cases target gate/up widths1/4 and attention
input4096. Secondary DP2 examples are B8/input512 and B32/input2048. A300-second
batch can leave many entries unexecuted, especially during initial compilation.
One-GPU AR controls and aggregate DP2 rates cannot validate the two-GPU B1 goal.

## Packed gate/up kernel candidate

I's saved Nsight attribution identified gate/up as the largest target kernel
category. I's previous packing covered QKV/output/down; its small provisional
E2E differences and failed lookahead are preserved. K applies a separately
gated packing experiment to gate/up rather than treating I packing as a win.

`optimized/kernels/gate_up_packed.py` reads one-time
`[tile,K-block,output-row,K-element]` storage. It keeps the unsplit, eight-query
transposed MMA, original K-block order, BF16 projection rounding, BF16 SiLU
rounding, and final BF16 product. Both control and candidate already fuse
SwiGLU. The hypothesis is improved weight access/layout; it is not a claim of
removing a launch from the existing fused control. The new packed path avoids
introducing the generic packed projection's partial/merge pass.

`BatchedQwen.prepare_gate_up_packing()` is explicit setup after TP sharding.
The control stays default. AR1 packs full gate/up weights; TP2 packs its local
FFN shard. Original weights remain for reference prefill. Setup time, extra
resident bytes and allocator peaks are recorded, and the fit estimator counts
the additional packed weights plus AR1/DP2 reference-prefill temporary cache.
The candidate supports up to256 query rows, corresponding to batch32/width8.

The model probe retains unchanged independent HF audits and full native-AR
references before constructing the candidate. It checks exact BF16 logits for
every sequence, complete warm/timed tokens, EOS and reuse in the tiny gate.
Variant flags must agree across summary, rank configuration and timed rows;
packing time and extra bytes are required for a packed receipt. Diagnostic HF
failures remain excluded from model-equivalent speed claims. No default is promoted.

The microbenchmark captures both control and candidate as CUDA graphs, checks
finite bitwise output equality before and after seven alternating A/B samples,
and reports packing separately. Existing cache-sweep limitations and absence
of hardware-counter/SOL evidence remain explicit. Emitted packed-kernel compiler
artifacts are included in the cloud export allowlist.

## Validation and preserved history

[CPU JUnit](K_LOCAL_TESTS.xml): **92passed,13CUDA modules skipped** on the Mac.
[Static/hash receipt](K_STATIC_VALIDATION.json): **117current Python files** and
**21shell scripts** parse; all10pre-J kernel source files are unchanged.
Original notebook, baseline-v1 and measured v2 sources match their hashes.
An initial recursive AST count included4576historical evidence copies; K116
records its correction from4693 to117current files. CPU test outcomes did not change.

There are36 prepared CUDA cases:23 narrowed batching cases and13 new packed
gate/up cases. They cover padding/tails, rows1/4/8/32/128/256, full and half 7B
gate/up geometry, graph capture, and tiny single-request logits/tokens/EOS/reuse.
The TP2 tiny worker uses the candidate when it is selected and still requires
its ordered collective payload test. Every pretrained variant has separate
exact checks. None of these CUDA gates ran locally.

J's original batch512/context32K grids, source ZIP, source/staging history
bundles, CPU-stage proof and reports remain preserved. They do not define K's
active run. The pre-implementation plan is
[SINGLE_REQUEST_FOCUS_K_PLAN.md](SINGLE_REQUEST_FOCUS_K_PLAN.md); append-only
history continues through K116. R032 in [READING_LOG.md](READING_LOG.md) records
the reviewed Triton/NVIDIA sources and applied/deferred ideas. No external
kernel was copied and no tutorial benchmark is project performance evidence.

## Commands and current blocker

Planning only, without allocation or CUDA work:

```sh
python -m kernel_lab.throughput.sweep --output kernel_lab/results/k-plan
```

With two already allocated, exclusive CUDA GPUs, a bounded first B1 pass:

```sh
python -m kernel_lab.throughput.sweep --execute --seconds 300 \
  --output kernel_lab/results/k-short-b1 --cache /cache \
  --select tp2_ar:b1:c128,ar1:b1:c128,tp2_ar:b1:c128:packed_gate_up \
  --micro-select '' --diagnostic-allow-hf-audit-failure
```

The explicit diagnostic flag permits useful timings after an HF audit failure;
it does not relax qualification. Use fresh output directories. The cloud
`workspace_throughput.sh` still bounds setup/work to600seconds plus stop/export
up to90seconds, and requires separate observable provider release.

Refreshed National Compute Grid shows **30.03USD**, no active node and no waiting
session. B300 is eight GPUs at4USD/GPU-hour. The provider requires the first
whole-node hour available, **32USD**, so admission is blocked by **1.97USD**.
[Admission rule](https://docs.nationalcompute.com/public-research/#asking-marshall).
[Saved live proof](../evidence/singleK-preflight/provider-preflight.json) links
the raw UI text/screenshot hashes. No request, top-up or settings change was made;
new GPU compute spend is zero. The existing80USD project cap is unchanged.
Only two application GPUs would execute, but the provider bills the whole node.

Next, obtain actual CUDA/collective and B1 timings; compare packed/control with
complete receipts and then choose further MLP, communication or attention work.
Fix independent HF drift before promoting a pretrained speedup. Extend TP2 to
SD/SSD after the AR path is numerically sound and useful. Batched SD/SSD and
fast batched prefill remain unfinished;1,000tokens/sec is not achieved.


## Package checkpoint

Source64129e5 is committed and its218-file immutable package passed local
verification. CPU staging was attempted but no K receipt was observed after
browser input/window changes. K remains locally packaged, not confirmed uploaded.
The old J success marker is not K proof. See [package receipt](K_PACKAGE_RECEIPT.md).
No GPU was requested.
