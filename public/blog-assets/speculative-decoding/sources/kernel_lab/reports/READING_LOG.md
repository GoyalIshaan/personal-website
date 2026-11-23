# Reading and implementation lineage

Read on2026-10-21. Machine-readable entries are appended to
`../history/research.jsonl`; experiment events are in `../history/events.jsonl`.
These are primary-author papers/writeups or official vendor/compiler sources.
Reported speedups in external work are not predictions for this project.

| ID | Source and section read | Idea used or evaluated here | Current status |
| --- | --- | --- | --- |
| R001 | [FlashDecoding++, sections4–5](https://arxiv.org/html/2311.01282v3) | Narrow query padding, latency hiding and shape-dependent tensor/SIMT choices. Inspired the fixed8-query transposed GEMM candidate. | C passed16 experimental gates and20 paired cases. Small target gains, draft projection losses and provisional1.5–1.9% engine changes retained. Unified-max heuristic deferred. |
| R002 | [Flash-Decoding engineering post](https://pytorch.org/blog/flash-decoding/) | Parallel KV splits and a rescaled merge, with attention to low batch occupancy. | Existing split-KV design follows this mechanism. Further split/merge changes await actual timelines; long-context claims do not transfer to short prompts. |
| R003 | [FlashInfer attention engineering](https://flashinfer.ai/2024/02/02/introduce-flashinfer.html), decode/append and GQA | Operational intensity and useful parallelism depend on the actual query/head/context geometry. | Guides shape-specific experiments. More splits or active SMs are not assumed to mean higher bandwidth. |
| R004 | [Cascade Inference](https://flashinfer.ai/2024/02/02/cascade-inference.html), attention-state merge and prefix reuse | Share common-prefix attention reads and merge independent suffix states. | Deferred until branch attention is measured as important. Mathematical reassociation alone does not preserve BF16 bits. |
| R005 | [CUTLASS Blackwell SM100 GEMMs](https://docs.nvidia.com/cutlass/latest/media/docs/cpp/blackwell_functionality.html) | Native Blackwell MMA pipelines are worth testing, with shape and data movement constraints. | Inspect generated PTX for `tcgen05`; presence of a newer instruction is not proof of an engine speedup. |
| R006 | [NVIDIA PTX ISA](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html#warp-level-matrix-fragment-mma-16816-float), BF16 m16n8k16 fragments | The hardware eight-column query axis motivated transposing W and X. | Considered manual lane assembly, then chose the compiler-supported dot candidate below. No external kernel copied. |
| R007 | [Triton3.7 NVIDIA backend](https://github.com/triton-lang/triton/blob/release/3.7.x/third_party/nvidia/backend/compiler.py), `min_dot_size` | BF16 dot permits narrow logical axes before hardware lowering. Use `tl.dot(W, X.T)` with fixed query extent8. | C compiled76 saved candidate variants, all using legacy MMA, with no tcgen05/WGMMA/TMA. Static instruction observations do not establish hardware SOL. |
| R008 | [Speculative Speculative Decoding](https://arxiv.org/html/2603.03251v1), appendixB.1 andC | Batch forecast branches with a sparse shared-trunk mask; communicate compact results rather than model KV across devices. | Informs a future branch-batched runner. Current per-scout copies are local draft-device copies, not target-to-draft KV transfer. We do not claim to reproduce Saguaro or its published hardware/results. |
| R009 | [Triton grouped GEMM tutorial](https://triton-lang.org/main/getting-started/tutorials/08-grouped-gemm.html), static device scheduling | Group independent work to amortize launches. | Read but not adopted: dependency-linked model layers cannot be fused into a group of independent GEMMs. |
| R010 | [Nsight Systems guide](https://docs.nvidia.com/nsight-systems/UserGuide/index.html), focused NVTX capture | Explicit NVTX trigger, string matching setting and primary-process wait. | Repair for B's missing reports; tiny GPU capture preflight and real-kernel-row checks precede expensive model capture. |
| R011 | [FlashAttention KV-cache API](https://github.com/Dao-AILab/flash-attention/blob/main/README.md?plain=1), RoPE, in-place append, GQA and causal alignment | Fuse this project's RoPE/append/attention boundary while reading the current block from packed QKV to avoid cache races. | Original opt-in fusion D and adversarial gates written; CUDA compilation/execution pending. No external kernel code copied. |
| R012 | [FlashInfer fused RoPE/cache append API](https://docs.flashinfer.ai/generated/flashinfer.rope.rope_quantize_fp8_append_paged_kv_cache.html), layout and materialization | Fuse at a concrete dataflow boundary and retain explicit layout/numerical contracts. | API studied; its FP8/paged-cache path is not adopted. D retains the project's BF16 flat caches and existing softmax. |
| R013 | [Nsight Systems CUDA trace methods](https://docs.nvidia.com/nsight-systems/UserGuide/index.html), cross-checked with C's installed2026.3.1 help | Blackwell defaults to hardware HES. Select `cuda-sw` and host-only graph nodes after the actual privilege denial. | Source repair and CPU policy checks complete; GPU software preflight pending. No permission, capability, driver or security changes. |

## Candidate boundary

`mma_t` changes the orientation of the matrix product: weights become the left
operand and eight query slots become the right operand's columns. It retains
the materialized BF16 boundaries, deterministic split merge, fused residual
normalization and stable low-ID top-k rules. Its arithmetic is fixed across
query widths1..8. The frozen baseline JIT function is preserved byte-for-byte
in `linear.py`; no measured-root implementation or frozen C plan is edited.

This transformation may enable a better hardware instruction shape, or lose
because of layout conversion, shared memory, registers or launch overhead.
The GPU experiment must retain failures and losses as well as wins. Tiny-model
primitive/sequence gates, pretrained HF audits and cross-plan native sequence
comparisons control interpretation. [C results](RESEARCH_BATCH_C.md) retain the
small observed changes, regressions and failed independent audits. They do not
establish a validated speedup. [D](FUSION_D_PLAN.md) is a new unexecuted candidate.

## Follow-up after D's measured performance rejection

D passed9 correctness gates and all16 exact-output/cache pairs, but14 timings
lost. R011/R012 motivated a valid fusion boundary, not a universal speedup.
R013's software activity probe was interrupted by the outer cap; no repaired
Systems trace is claimed. See [D measured outcome](FUSION_D_RESULTS.md).

| ID | Source read | Applied or deferred idea | Status |
| --- | --- | --- | --- |
| R014 | [NVIDIA CUDA binary utilities](https://docs.nvidia.com/cuda/cuda-binary-utilities/), resource/SASS output | Inspect saved CUBIN resources with vendor tools; distinguish counts and bytes. | Bounded CPU inspector prepared. No vendor binary inspection or physical-register result yet. |
| R015 | [Triton3.7 fused softmax](https://github.com/triton-lang/triton/blob/release/3.7.x/python/tutorials/02-fused-softmax.py), warmup/resource collection | Collect compiled `n_regs` and shared bytes outside timed regions in a future GPU run. | Measurement follow-up planned; theoretical residency does not establish measured occupancy. |
| R016 | [Warp specialization design](https://pytorch.org/blog/warp-specialization-in-triton-design-and-roadmap/), buffer lifetime and scheduling | Investigate the enlarged temporary/shared-memory footprint; isolate the small epilogue first. | Direct-output E prepared. Blind warp-specialization adoption deferred; no WS speedup claimed. |

No external kernel implementation was copied for D or E. Saved D compiler
metadata supports a resource-growth investigation, but does not prove register
spills, occupancy limits or bank conflicts. Those remain explicit hypotheses.

## R017: Triton maintained matmul I O-bound configurations

Source: [Triton maintained matmul I O-bound configurations](https://github.com/triton-lang/kernels/blob/main/kernels/matmul.py). Read 2026-10-21T22:47:36.249634+00:00.

Read: Small output tiles use two warps; stages, split-K and arithmetic shape are separate scheduling choices.

Applied: Test two-warps with the same frozen tile and split structure, alternating paired geometry timings. Do not copy the autotuner or use runtime query-dependent dispatch.

Status: F prepared; no GPU result or new speed claim yet. No external kernel source copied.

## R018: PyTorch numerical accuracy

Source: [PyTorch numerical accuracy](https://docs.pytorch.org/docs/main/notes/numerical_accuracy.html). Read 2026-10-21T22:47:36.249634+00:00.

Read: Floating-point operations are not associative; batching and slicing can produce different results even at equal dtype.

Applied: Separate HF teacher-cache and full native-cache experiments, keeping the original strict gate. BF16 dtype equality is not a promise of bit-identical algorithms.

Status: F prepared; no GPU result or new speed claim yet. No external kernel source copied.

## R019: Pinned Triton3.7 CompiledKernel resource loading

Source: [Pinned Triton3.7 CompiledKernel resource loading](https://raw.githubusercontent.com/triton-lang/triton/release/3.7.x/python/triton/compiler/compiler.py). Read 2026-10-21T22:47:36.249634+00:00.

Read: CompiledKernel hash, asm, n_regs, n_spills and metadata.shared after _init_handles; fields come from loaded binary.

Applied: Collect per-case physical compiled resources only during warmup in isolated benchmarks; save CUBIN hashes and optional vendor static resource output. Do not call PTX virtual registers physical occupancy.

Status: F prepared; no GPU result or new speed claim yet. No external kernel source copied.

## R020: NVIDIA cuBLAS reproducibility and numerical behavior

Source: [NVIDIA cuBLAS reproducibility and numerical behavior](https://docs.nvidia.com/cuda/cublas/index.html). Read 2026-10-21T22:47:36.249634+00:00.

Read: Reproducibility has toolkit architecture SM-count and stream/workspace scope; different split reductions can produce different floating-point results.

Applied: Retain pinned stack, full reduction policy and fixed split schedules; no forced security or workspace-setting change and no unsupported BF16 equality claim.

Status: F prepared; no GPU result or new speed claim yet. No external kernel source copied.

## I: R021–R023, executable ownership and load scheduling

Read 2026-10-22 during local preparation, before I GPU execution. Previous
prepared statuses above remain historical; later result reports/events record
which experiments actually executed.

| ID | Source and scope | How it influenced I | Boundary |
| --- | --- | --- | --- |
| R021 | [PyTorch public CUDAGraph API](https://docs.pytorch.org/docs/stable/generated/torch.cuda.CUDAGraph.html), plus installed Torch2.10 `graphs.py` source | Borrow `raw_cuda_graph_exec()` only after capture; retain its owning graph for the full native-call lifetime. Fail explicitly if the deployed Torch build lacks the public API. | Remote2.13 documentation was unavailable. The local API exists, but the deployed2.13 build still needs its gate. No owning object is destroyed or reinstantiated while its handle is borrowed. |
| R022 | [CUDA Runtime graph management](https://docs.nvidia.com/cuda/cuda-runtime-api/group__CUDART__GRAPH.html), launch and lifetime APIs | Original extension uses the current Torch stream under a device guard, with one int64 preparation kernel followed by graph submission. Keep the early scout-seed packet before the scout graph. | No CUDA floating-point implementation or external kernel source copied. Submission overhead and device/stream semantics still need measured tests. |
| R023 | [Triton `range` pipelining](https://triton-lang.org/main/python-api/generated/triton.language.range.html), loop staging versus kernel staging and supported scheduling scope | Isolate tile-major weight storage from a separate one-block lookahead load candidate. Retain dot order and capture loaded compiler resources before considering deeper pipelines. | Lookahead can increase register liveness or compile to no useful overlap. No warp specialization or performance gain is claimed. |

Build dependency check: the project's [Ninja1.11.1.4 PyPI release](https://pypi.org/project/ninja/1.11.1.4/)
exists and provides Linux wheels. Pin it for the extension build rather than
silently depending on whichever build executable is installed. This is build
setup, not a kernel technique or evidence of faster inference.

I was prepared with67 passing CPU tests and11 skipped CUDA modules. The user
deferred GPU testing after transport timeouts. New code, apparent fixes and
research inspiration are not recorded as GPU-validated improvements.

## R024: provider release semantics and I outcome

Read [National Compute Public Research](https://docs.nationalcompute.com/public-research/) during the control incident. Job exit, an SSH/container timeout, and a pool watch do not stop provider lease billing; explicit release confirmation is required. This is operational evidence, not a kernel optimization. The missed deadline is preserved in the result report. R021/R022native code compiled and passed its GPU gate; R023lookahead lost despite zero raw spills and remains disabled. No external kernel source was copied.


## J: R025-R029, TP layout and independent batch/context ownership

R025-R027 were read before J implementation; R028/R029 were read during static
review. GPU compilation and performance remain pending. No external kernel
source was copied and no new vendor-library dependency was added.

| ID | Source read | Applied idea and boundary |
| --- | --- | --- |
| R025 | [Megatron-LM](https://arxiv.org/abs/1909.08053) | Partition attention heads and FFN features. J preserves original partial groups through an ordered FP32 exchange; the paper's training results are not inference evidence. |
| R026 | [NCCL CUDA graph rules](https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/cudagraph.html) | Rank-matched collective capture/replay on one communicator. Add an isolated payload/timing probe and bound the process group. Support does not prove low latency. |
| R027 | [PyTorch distributed API](https://docs.pytorch.org/docs/stable/distributed.html) | One exclusive GPU per process; explicit all-gather output ordering. Newer symmetric-memory features are not assumed in pinned Torch2.13. |
| R028 | [FlashInfer attention API](https://docs.flashinfer.ai/api/attention.html) | Reviewed fixed split grouping and graph-shape stability against J's existing design. Do not adopt silent batch-dependent backend/partition changes or claim FlashInfer speed. |
| R029 | [NVIDIA HGX B300 components](https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html) and the saved I CUDA receipt | Product memory units and peak bandwidth do not establish allocator capacity or observed HBM use. Replaced 288GiB planning assumption with 267GiB after checking 274113MiB exposed in I. Execution reads fresh actual capacities. |

The local pinned Qwen2 forward signature was also inspected before using its
`logits_to_keep=1` argument for long-context checkpoints. Pretrained qualification
still reruns the original full-head calibration audit; a new prompt/head shape
cannot erase the known numerical failure. See BATCH_CONTEXT_TP2_J_PREPARATION.md.


R030: inspected installed Torch2.10 elastic `SubprocessHandler._popen/close` and
psutil7.2.2 `Process.terminate/_send_signal`. Elastic uses separate sessions;
psutil checks PID identity before signalling. This motivated descendant tracking
and the detached-child cleanup regression. This local source inspection is not
a claim about a new GPU run or every detail of the deployed Torch2.13 launcher.

R031: re-read [National Compute admission and billing rules](https://docs.nationalcompute.com/public-research/#asking-marshall).
Requests require the first whole-node hour in available credits. Live B300 quote
is8x4USD/hour and the balance30.03USD, below32USD admission. Job duration and the
remaining project authorization do not waive this rule. No request/top-up made.


## R032: K scope and packed gate/up candidate

Read the [official Triton matmul tutorial](https://triton-lang.org/main/getting-started/tutorials/03-matrix-multiplication.html), opening layout/pointer/grouping discussion, and [NVIDIA Best Practices](https://docs.nvidia.com/cuda/cuda-c-best-practices-guide/index.html), APOD assessment/optimization sections. Applied the principle of testing layout changes on an observed hotspot: gate/up dominated the saved I target timeline, while I packing excluded gate/up. The new candidate will keep the existing MMA/K-block and BF16 activation boundaries, prepare storage once, and fuse its output. Large-GEMM autotuning and arithmetic changes are deferred. No external kernel was copied; tutorial timings are not project evidence. GPU compilation, exactness, resource and speed checks remain pending.


## R033-R034: K teardown hypothesis and L ownership plan

Read/re-read [NVIDIA teardown guidance](https://docs.nvidia.com/dl-cuda-graph/troubleshooting/process-hang.html)
and [PyTorch CUDAGraph API](https://docs.pytorch.org/docs/main/generated/torch.cuda.CUDAGraph.html),
including public reset and asynchronous replay lifetime. K retains decode graphs
when destroying NCCL, matching a documented ownership hazard; the native hang
location is not yet proven. L will synchronize, reset graphs and break buffer
ownership before destroying the group, with untimed lifecycle checkpoints and
watchdog traces. No environment overrides, new graph hooks or copied external
kernels are adopted. Fix and speed remain unvalidated on CUDA. See L's plan.


## R035-R042: evidence-ranked route to one-request1,000tokens/s

- R035: [https://arxiv.org/html/2603.03251v3](https://arxiv.org/html/2603.03251v3). Read: SSD abstract,4.1outcome fan-out,4.3fallback,implementation branch batching andAppendixE EAGLE conditioning. Plan: Branch-batch4/8outcomes on GPU1; profile total cycle including misses. EAGLE SSD requires self-conditioning when target features are unavailable. Boundary: Main paper uses4targetGPUs+1draft; no transfer of reported speedups, no stochastic sampler implementation.
- R036: [https://arxiv.org/abs/2503.01840](https://arxiv.org/abs/2503.01840). Read: EAGLE-3 abstract; official SafeAILab/EAGLE README overview. Plan: Evaluate a shallow target-conditioned draft before further standalone0.5B tuning. Boundary: No claim that reported paper speedups hold for our target, hardware or runtime; code not copied.
- R037: [https://huggingface.co/thoughtworks/Qwen2.5-7B-Instruct-Eagle3](https://huggingface.co/thoughtworks/Qwen2.5-7B-Instruct-Eagle3). Read: Authored model card usage patch,training,acceptance,architecture and limitations; generic Hub templates excluded as evidence. Plan: Available Qwen2.5 candidate to audit for feature-layer capture and low draft latency. Boundary: V1 modest acceptance and different acceptance definitions cannot prove an improvement; no integration/download/training executed.
- R038: [https://z-lab.ai/projects/dflash/](https://z-lab.ai/projects/dflash/). Read: Author blog parallel-draft mechanism and example; paper abstract2602.06036; current z-lab/dflash README model support list. Plan: Consider parallel-block target-conditioned drafting as an alternative experiment. Boundary: No Qwen2.5 checkpoint in inspected list; separate model/training choice, not a drop-in or measured gain.
- R039: [https://developer.nvidia.com/blog/blackwell-breaks-the-1000-tps-user-barrier-with-metas-llama-4-maverick/](https://developer.nvidia.com/blog/blackwell-breaks-the-1000-tps-user-barrier-with-metas-llama-4-maverick/). Read: Kernel optimization/fusion,warp specialization,tensor memory,PDL and8GPU model context. Plan: Benchmark low-M projection pipelines on profiled MLP hotspots; do not repeat already implemented fusions. Boundary: Eight-GPU FP8 Maverick result is not two-GPU Qwen evidence. No external kernel copied.
- R040: [https://developer.nvidia.com/blog/optimizing-llms-for-performance-and-accuracy-with-post-training-quantization/](https://developer.nvidia.com/blog/optimizing-llms-for-performance-and-accuracy-with-post-training-quantization/). Read: Precision/quantization introduction,ModelOpt formats and calibration discussion. Plan: Draft quantization first; targetFP8/NVFP4 as a separate numerically qualified track. Boundary: Quantized target changes model outputs; not exact BF16 equivalence. No conversion, dependency upgrade or quality claim.
- R041: [https://arxiv.org/abs/2512.22219](https://arxiv.org/abs/2512.22219). Read: MPK abstract and primary repository summary only. Plan: Treat persistent multi-operator kernels as a later benchmark-driven research option. Boundary: Paper1.7x is not project evidence; no full paper/source audit or megakernel implementation claimed.
- R042: [https://docs.flashinfer.ai/generated/flashinfer.gemm.mm_fp8.html](https://docs.flashinfer.ai/generated/flashinfer.gemm.mm_fp8.html). Read: Current API signature,weight preprocessing and backend constraints:SM100/103,M<=8,K%128=0. Plan: Concrete low-MFP8 comparison candidate for B300 after a separate precision contract. Boundary: Current docs do not establish compatibility/performance in pinnedTorch2.13/Triton3.7 environment; no installation.

All proposals remain unexecuted. Own raw I rows were recomputed:384outputs/140rounds,2.742857useful tokens/4.490231ms round,610.850decode/547.348E2Etokens/s; independentHFqualification fails. Source/code inspection found existing scouts are enqueued serially per slot. Full decision record:THOUSAND_TPS_STRATEGY.md.

## R043-R045: M compressed-weight implementation references

- R043: Re-read the [FlashInfer low-latency FP8 API](https://docs.flashinfer.ai/generated/flashinfer.gemm.mm_fp8.html): signature, SM100/103 support, M<=8, K multiple128, and backend-specific weight preparation. The inspected alpha description does not establish per-row scale broadcasting. Native W8A8 is therefore a separate unimplemented candidate; the first custom kernels keep BF16 activations and reconstruct BF16 weight tiles. No package installation or compatibility/performance claim.
- R044: Read the [NVIDIA NVFP4 feature specification](https://docs.nvidia.com/deeplearning/transformer-engine/features/low_precision_training/nvfp4/nvfp4.html), format/scaling/packing sections: E2M1 magnitudes,16-element E4M3 block scales and global FP32 scale. Used as a format reference only. Our W4A16 uses one-dimensional row groups, deterministic nearest-even rounding and even-K low nibbles; it is not NVIDIA's swizzled native NVFP4 execution ABI. No training stochastic rounding, random Hadamard transform, external kernel code or native FP4 throughput claim. Older user-guide fp8_primer URLs returned404; the feature page supersedes them.
- R045: The connected HF metadata query for `thoughtworks/Qwen2.5-7B-Instruct-Eagle3` returned repository/model metadata but no actual README/config, despite include_readme. This does not qualify a checkpoint or implement its feature/vocabulary adapter. R037's authored model card remains the inspected architectural source; pinning the real config/revision and integration gates are pending.

M CPU format tests:14 passed, no CUDA compilation/execution. W8A16/W4A16 storage reductions alone do not prove a latency gain; dequantization can cost more than the saved traffic.


## R046-R048: pinned EAGLE3 metadata and actual adapter shape

- R046: Read pinned config and Safetensors header from [thoughtworks checkpoint ff17dda64a036cf5bd7bc56c0ab728325f1c0d0b](https://huggingface.co/thoughtworks/Qwen2.5-7B-Instruct-Eagle3/tree/ff17dda64a036cf5bd7bc56c0ab728325f1c0d0b). HF connector supplies metadata, not tensor headers; public HTTP range reads fetched exactly8+1472header bytes, zero weight payload. Saved config/header/hash/Content-Range receipts under research/eagle3-m. Config and K/V projection896rows/128head_dim establish7KVheads, contradicting the model card's4. No entire checkpoint downloaded.
- R047: Read the [SpecJAX inference guide](https://github.com/tails-mpt/SpecJAX/blob/main/inference/README.md), Qwen2 target feature patch and current TPU performance caveats. This is an integration reference, not evidence that our CUDA runtime supports the model or gains speed.
- R048: Inspected author [EAGLE cnets.py](https://github.com/SafeAILab/EAGLE/blob/main/eagle/model/cnets.py), LlamaDecoderLayeremb, Model initialization/forward and draft vocabulary mapping. Its separate feature/token norms, concatenated2H QKV input,3H-to-H feature projection and32K head agree with inspected header shapes. cnets1.py was initially checked, but its2H-to-H older architecture does not match this checkpoint and is not our reference. Source is Apache2.0; no kernel implementation copied. Correct token/feature shifts, d2t representation and SSD self-conditioning need explicit qualification, not generic AutoModel loading.

## R049: actual vocabulary-offset payload verification

Read the author's `cnets.py` target-ID conversion and fetched only the integer
`d2t` and boolean `t2d` byte ranges from the pinned checkpoint. Exactly280064
index bytes, zero BF16 tensor bytes. Adding draft index to stored offset yields
32000 distinct increasing IDs matching membership; treating raw offsets as
absolute IDs fails. Saved payloads/ranges/hashes and CPU ABI tests. Token/feature
shift, trained inference and self-conditioning remain unqualified. An attempted
SpecJAX `specjax/export.py` URL returned404 and supplied no evidence or code.


## R050-R053: N native execution and EAGLE reference contracts

- R050: Read pinned [Triton3.7 dot/dot_scaled core](https://github.com/triton-lang/triton/blob/v3.7.0/python/triton/language/core.py) and semantic shape checks, including E4M3 block16 scale support and RHS scale orientation. The generated API prose describes E8M0 but omits these NVFP4 details; pinned implementation is the more complete source. FP8 requests max_num_imprecise_acc=0; FP4 requests fast_math=False. No compiler/GPU result inferred from source API usage.
- R051: Read pinned [block-scaled tutorial](https://github.com/triton-lang/triton/blob/v3.7.0/python/tutorials/10-block-scaled-matmul.py), scale swizzle, low-even nibble packing, NVFP4 E4M3 scales and column-major RHS. Implemented independent scalar layout oracle and own pointer-load candidate; no tutorial kernel copied. Tutorial8192x8192 timing is not a low-M performance estimate.
- R052: Read [NVIDIA PTX block scaling](https://docs.nvidia.com/cuda/parallel-thread-execution/#tcgen05-mma), legal scale/type combinations and SM103 support. E2M1/E4M3 block16 needs native mxf4nvf4/block scaling; software BF16 emulation cannot pass native proof. A guessed AccelerateMatmul.cpp source path returned404; no conclusions/code from it.
- R053: Re-read author [EAGLE cnets.py](https://github.com/SafeAILab/EAGLE/blob/main/eagle/model/cnets.py), one-layer separate norms/feature fusion/raw residual recurrence and shifted draft vocabulary convention; read ea_model generation initialization to reason about initial exact target seed. Feature-capture index semantics require inspecting the Qwen implementation, not assuming final RMS output equals target features. No pretrained tensor download or trained acceptance claim.


## R054-R056: EAGLE feature indices, recurrence and pinned payload identity

- R054: Read [Qwen2 capture implementation](https://github.com/tails-mpt/sglang-jax/blob/main/python/sgl_jax/srt/models/qwen2.py), layer loop and set_eagle3_layers_to_capture. Capture BEFORE layers2/14/25 corresponds to raw outputs AFTER layers1/13/24 for this28-layer target; explicit indices are shifted+1 by that implementation. Our wrapper captures raw residuals directly after named layers. CPU hook tests confirm index/order on a tiny4-layer model, not trained7B CUDA equivalence. Web find initially returned no match for set_eagle3; opening the relevant source region exposed it.
- R055: Read [SpecJAX draft recurrence](https://github.com/tails-mpt/SpecJAX/blob/main/specjax/models/draft/eagle3.py), eagle3_forward and feature feedback; re-read [author topK_genrate](https://github.com/SafeAILab/EAGLE/blob/main/eagle/model/cnets.py), input_ids[:,1:], initial exact sample and subsequent raw-H feedback. Used to design target-feature i/token i+1 alignment, distinct3H/H routes, offset mapping, explicit committed-prefix repair and CPU-only forecast oracle. SpecJAX has different mapping representations in some paths; actual pinned d2t/t2d payloads from M remain authoritative for our loader. No external kernel copied and no trained acceptance extrapolation.
- R056: Read [pinned Hub tree metadata](https://huggingface.co/api/models/thoughtworks/Qwen2.5-7B-Instruct-Eagle3/tree/ff17dda64a036cf5bd7bc56c0ab728325f1c0d0b?recursive=false&expand=false). Saved model.safetensors LFS size717798344/SHA256f77665495c620c17d05d6672444094844866e2a27e545d6837e8b107465ddfd8. Only JSON metadata fetched, zero BF16 tensor bytes. Loader verifies full local payload, header, config, tensor ABI and actual vocabulary offsets before using a user-supplied checkpoint. No file has been loaded or executed from this checkpoint here.

## R057-R059: N2 normalization-to-native packing fusion

Read2026-10-22 before N2 edits while the user-requested B300 queue remains armed.
- R057: [Triton normalization tutorial](https://triton-lang.org/main/getting-started/tutorials/05-layer-norm.html), forward flat row reduction and fused pointwise stages. Applied reduction/fusion structure to our existing RMS arithmetic, retaining explicit BF16 rounding. LayerNorm tutorial results do not predict this RMS/native-pack candidate.
- R058: Re-read [block-scaled matmul tutorial](https://triton-lang.org/main/getting-started/tutorials/10-block-scaled-matmul.html), scale preshuffling and logical per-row/K-vector interpretation. Preserve N's independent ABI and separate low-M performance gates. Current main docs cover more architectures/APIs than pinned3.7; no assumption of current main compatibility.
- R059: Read [NVIDIA PTX block-scaled MMA section](https://docs.nvidia.com/cuda/parallel-thread-execution/index.html#tcgen05-mma), type/scale-factor reference. N2 fusion changes activation production, not the native MMA ABI or proof requirements. No instruction/performance result from reading documentation.

No external implementation copied. Planned N2 is opt-in and CUDA-unexecuted.

## R060: CPU-only explicit-target compiler preflight

Read [pinned Triton3.7 compiler.py](https://github.com/triton-lang/triton/blob/v3.7.0/python/triton/compiler/compiler.py), ASTSource/compile target selection, and [official3.7.0 PyPI metadata](https://pypi.org/project/triton/3.7.0/). Plan an explicit SM103 offline compile on the CPU workspace while the paid request queues. Wheel-vendor equivalence is not assumed; offline lowering is not GPU execution, numerical equivalence, occupancy or speed. No external kernel code copied.

## R061: actual FP8 emulation and legal Blackwell tile geometry

Read pinned [AccelerateMatmul.cpp](https://github.com/triton-lang/triton/blob/v3.7.0/lib/Dialect/TritonGPU/Transforms/AccelerateMatmul.cpp), getMMAVersionSafe and mmav2SupportsFp8Operands; read pinned [Analysis/Utility.cpp](https://github.com/triton-lang/triton/blob/v3.7.0/lib/Analysis/Utility.cpp), supportMMA. The actual3.7 source requires result CTA dimensions divisible64 and16 for MMA-v5, and explains that FP8 MMA-v2 on SM90/100 is emulated with FP16. Our offline PTX indeed contains f16.f16 for the physical-query8 path. Plan a fixed16-query physical tile and forbid BN32 for this SM100/103 candidate. Keep max_num_imprecise_acc=0; no accuracy relaxation proposed. Native FP8 proof for these devices must require tcgen05 kind::f8f6f4 and reject half-precision and virtual FP8-v2 fallbacks. Real GPU correctness/performance still required. Search surfaced a third-party gist; it was not used as evidence. Raw compiler source is saved outside implementation code for reading/provenance only.
