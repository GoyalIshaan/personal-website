# Realistic route to 1,000 tokens/s from one request on two GPUs

This is a recommendation and quantitative plan, not new benchmark evidence or
authorization for paid work. L remains prepared, unexecuted on CUDA. Existing
numerical and process-exit failures must be resolved before validated claims.
Keep the BF16 target experiment and any quantized target as separate tracks.

## The measured gap

The older I short-context SSD control has 384 emitted tokens in 140 rounds,
0.628632289 s decode and 0.701564049 s end-to-end: 610.850 decode / 547.348 E2E
tokens/s. All outputs match the custom AR reference, but independent HF
qualification fails. This capacity256 calibration result does not establish
SSD performance at K's 2048-token inputs or across untouched workloads.

Mean useful output per round = 2.742857 tokens; mean decode round = 4.490231 ms.
This output count includes corrections/bonus tokens and final-request trimming;
it is not the draft acceptance fraction. Accepted/proposed is246/420; scout
hits/lookups48/136. Both rates are workload-specific and have different meanings.

Decode tokens/s = 1000 * useful emitted tokens per round / mean round time in ms.
At unchanged emission, 1,000 decode tokens/s requires 2.742857 ms/round, a38.9%
latency reduction. At unchanged round time it requires4.490231 emitted tokens
per round. The current K3 verifier can emit at most4 per complete round, so
acceptance improvement alone cannot reach1,000 at the old4.490231ms cost.
The necessary throughput gains are1.637x decode and1.827x end-to-end. A purely
illustrative4tokens/3.5ms round would yield1143decode tokens/s; this has not
been achieved, and prefill still reduces the E2E number.

## Ranked engineering bets for the existing BF16 target

### 1. Real parallel SSD fan-out, with bounded shared-prefix branch storage

The current `SpeculativeDecoder` loops through scout slots and launches each
slot's full proposal on the draft stream. Increasing the Python branch count
therefore adds serialized proposal work. The I control used one scout and reused
it in only48/136 eligible rounds. Simply increasing K already lost in H.

Prepare an experimental branch-batched drafter: test4and8 outcome branches on
the second GPU in the same draft forwards, sharing the verified trunk and
owning separate branch suffixes/positions. This is still ONE user request.
Use bounded page/block maps or equivalent graph-stable indirection to avoid
copying the whole trunk per branch. Existing batched projection/RoPE/GQA code
is a starting point, not an already functioning branch-cache runtime.

Select likely rejection positions/correction tokens using calibration, rather
than spending equal compute everywhere. Preserve exact outcome/token matching
before suffix adoption, EOS, rollback and request-reuse checks. Choose fan-out
by total round latency and emitted tokens, with the GPU work for missed branches
included. More cache hits alone are not success. Keep fixed K3 as a control.

This follows the [SSD paper](https://arxiv.org/html/2603.03251v3), sections4.1,
4.3 and its implementation discussion: outcome branches are decoded together.
Its main experiments use more target GPUs; their speedups are not a prediction
for this project. Stochastic Saguaro sampling is outside the current greedy
decoder's supported contract.

### 2. A cheaper target-conditioned drafter

Benchmark an EAGLE-3 style shallow draft against the standalone0.5B model using
accepted output per millisecond as the selection metric. This can reduce serial
draft passes and improve proposal alignment, but neither benefit is guaranteed.
[EAGLE-3](https://arxiv.org/abs/2503.01840) conditions on multiple target layers.
A [Qwen2.5-7B candidate](https://huggingface.co/thoughtworks/Qwen2.5-7B-Instruct-Eagle3)
exists; its card requires a Qwen2 feature-capture integration patch and reports
modest v1 acceptance. It is a candidate to audit, not a measured upgrade. Do not
copy the Hub page's generic deployment template as a verified integration.

Measure ordinary SD with the candidate first. SSD integration cannot assume
fresh target features are available while verification is unfinished. SSD's
AppendixE describes self-conditioning and its acceptance degradation; retaining
the benefit may require suitable draft training. A new training run is not
included in the present budget or proposed as a quick free fix.

[DFlash](https://z-lab.ai/projects/dflash/) replaces sequential drafting with a
parallel draft block and target feature conditioning. It is an alternative
research track; the inspected support list does not list Qwen2.5. Using another
target family or training an adapter would be an explicit separate experiment,
not a silent replacement of the current Qwen2.5 comparison.

### 3. Optimize target MLP/projection kernels at the actual query widths

I's instrumented short-request target groups rank gate/up15.450ms and
output/down10.654ms above QKV2.535ms and attention1.124ms. These are summed
activities, not additive critical-path percentages. Optimize low-M query1,
verification4/8 kernels using the actual hidden/FFN shapes, measuring paired
complete graph chains and full-model requests after exact gates.

SwiGLU and residual/RMS fusion already exist. New work must improve weight
movement, reduction/scratch traffic or scheduling rather than reintroduce
existing fusions. Compare straightforward kernels with Blackwell-specific
warp-specialized/TMA/tensor-memory paths; newer instructions are not sufficient
evidence that a tiny-M kernel wins. Preserve the BF16 rounding/reduction contract
unless a separately qualified backend is introduced.

[NVIDIA's latency engineering example](https://developer.nvidia.com/blog/blackwell-breaks-the-1000-tps-user-barrier-with-metas-llama-4-maverick/)
combines low-latency matrices, fusion, PDL and a trained drafter. Its eight-GPU
Maverick result is not two-GPU Qwen evidence. A persistent full-model kernel
like [MPK](https://arxiv.org/abs/2512.22219) is a later research bet with significant
scheduling/synchronization risk; CUDA graphs already cover our normal decode
launches. First establish how much removable GPU boundary cost remains.

## Strong additional route if target quantization is allowed

Quantize the drafter first while keeping the verifier BF16; exact greedy target
verification can retain the target's output contract. A cheaper but less accurate
draft may nevertheless lose through rejection, so measure the complete cycle.

Then, separately, compare FP8 target linears and calibrated NVFP4 against their
own reference implementations and quality evaluations. This reduces weight
traffic/precision and can change outputs; it does not preserve the original
BF16 model exactly. [NVIDIA PTQ guidance](https://developer.nvidia.com/blog/optimizing-llms-for-performance-and-accuracy-with-post-training-quantization/)
documents calibration and low-bit formats. The current
[FlashInfer FP8 small-M API](https://docs.flashinfer.ai/generated/flashinfer.gemm.mm_fp8.html)
also lists an SM100/SM103 backend forM<=8andK divisible by128, making it a concrete
comparison candidate for our B300 shapes. Compatibility with our pinned stack,
quantization overhead, error and total latency are untested. No dependency
upgrade, model conversion or gate relaxation has been performed.

## Allocation and low-priority work

One GPU for the target and one for drafting is the first architectural bet.
Measure TP2 AR once after L passes, before investing in custom NVLink exchange.
Its56ordered gathers per decode step can offset weight sharding; a standard
all-reduce cannot silently replace the arithmetic-preserving exchange. TP2
target plus a drafter must still use at most two application GPUs and account
for contention. DP does not shorten this single request; the current target
has no MoE experts for EP to partition. A larger target may improve relative
speculative speedup while reducing absolute output rate.

Packing and C++ host submission alone have low demonstrated return: I measured
only+0.423% and+0.144% E2E on its calibration set. Avoid assigning all target
idle intervals to removable Python overhead: those intervals include dependent
drafting. Shared-prefix KV work is most useful for enabling branch fan-out,
not a claim that the existing one-scout copy bandwidth dominates.

Before new architecture work: validate L normal TP exit, resolve/localize K's
cached-decode numerical failure, and run the corrected paired controls. Then
qualify branch-batched SSD and a shallow drafter against the fastest measured
AR/SD/SSD and an established engine on the same two-GPU/workload/precision
budget. Short and medium contexts remain separate results; batch work remains
secondary and<=32. No1,000tokens/s, SOL or pretrained TP speed is promised.
