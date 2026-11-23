# Direct-output E: prepared, not CUDA compiled or timed

D passed9 fusion gates but lost14/16 timings. This candidate keeps the original
materialized RoPE/cache writer and removes only the unnecessary single-physical-
split partial buffers and merge. It keeps one time query per CTA with the same
fixed16 grouped-head rows, BF16 dots, online exp2 softmax and FP32 accumulator.
With more than one physical split it calls the unchanged baseline.

The intended exactness argument is narrow: for one physical split, the old
merge has rescaling factor1 and a one-element reduction. Writing `acc/denom`
directly should preserve output bits for finite valid inputs. Compiler scheduling
could still change arithmetic, so the prepared GPU gates, not this argument,
determine eligibility. Independent K/V strides and future masking remain explicit.

`direct_one_split_attention` is an explicit bool, defaultsFalse, reads old plan
records asFalse and cannot be combined with `fuse_rope_attention`. No defaults
are promoted. `attention.py`, `attention_fused.py`, pointwise/linear JIT files,
the original notebook and frozen root sources remain byte-identical to D.
The E hybrid JSON files retain D's matrix plans but select only direct output.

## Scope limitation

It accelerates only the **capacity<=chunk** path if GPU timings confirm a win.
The default capacity2048/chunk256 path uses the original multi-split attention;
no engine speedup is forecast for that path. Short-request capacity buckets are
a separate future hypothesis. They require checking prompt length, committed
output, speculative/scout lookahead and graph replay reuse; no host read of
changing device positions or silent capacity reduction is introduced here.

## Prepared gates and commands

Six primitive/graph cases cover dimensions32/64/128, groups1/5/7, exact baseline
output, an independent SDPA oracle at unchanged tolerances, poisoned future KV,
independent V stride with unchanged backing storage, widths1..8, changed graph
positions, odd capacity and multi-split fallback. Three additional graph/eager
AR/SD/two-GPU-SSD runtime cases use the same shared checks as D. These9 cases
have not run on CUDA.

The dedicated suite supports `--candidate direct`; it selects the E primitive
and runtime cases, requires baseline/E gates before timing, and retains failures.
The micro CLI includes RoPE/cache writing on BOTH sides, retains all16 geometries
and the fallback control rows, alternates timing order and saves emitted code.

```bash
timeout 80 python -m kernel_lab.benchmarks.attention_ab \
  --candidate direct --output NEW_OUTPUT --seconds 60
```

`cloud/workspace_direct.sh` selects that mode within the existing pinned
container/export wrapper. Stage a new clean committed archive and check budget
before acquiring a fresh node.330s is the maximum prepared job, not permission
to consume credits or a substitute for assignment-to-release accounting.
No E source has been uploaded or executed on a GPU.

## Profiling and receipt repairs

The later D software preflight was interrupted. Isolate capture plumbing before
an expensive model profile:

```bash
timeout 55 python -m kernel_lab.benchmarks.nsight_suite \
  --preflight-only --skip-counters --seconds 45 \
  --tools /cache/nsight-tools/tools.json --cache /cache --output NEW_TRACE_OUTPUT
```

This path downloads no model, loads no pretrained model and never invokes
Compute counters. It succeeds only with actual CUDA kernel rows in SQLite.
Software trace flags remain vendor-supported; execution must still verify them.
The source adds explicit TERM/INT143/130 completion handling. The old interrupted
D receipt remains intact and is documented as false-green.

`benchmarks/cuda_binary_report.py` is a separate bounded CPU file inspector:

```bash
python -m kernel_lab.benchmarks.cuda_binary_report \
  --input SAVED_EMITTED_DIRECTORY --output NEW_RESOURCE_OUTPUT
```

It requires an existing official `cuobjdump`, preserves raw vendor output and
binary SHA256, and records unavailable/failure/timeout separately. It installs
nothing and uses no GPU/counters. Physical register/spill/occupancy claims remain
pending; a PTX virtual-register count is not a replacement. R014–R016 record the
source lineage and further compiled-resource/warp-scheduling ideas.

Local validation after E: **32 passed,5 CUDA-dependent modules skipped**;
66 Python ASTs and all cloud shell scripts parse. CPU checks do not establish
Triton compilation, GPU correctness, signal behavior inside the cloud container,
profiler capture or speed. Next paid execution needs a verified adequate budget.

The local CUBIN inspector's unavailable path was exercised:exit2, no existing
`cuobjdump` on this Mac. This is an availability receipt, not binary-resource
validation. No GPU allocation or paid execution followed.
