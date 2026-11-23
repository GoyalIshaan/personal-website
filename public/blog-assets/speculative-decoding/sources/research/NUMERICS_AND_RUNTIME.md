# Numerical contract and runtime choices

Recorded before E017 implementation. We inspected local Transformers 4.57.1 and the authors' SSD source at commit d7eb8fa0edb77a6d0876af1903367b9bb82f54e7 (MIT, Tanishq Kumar). The new backend is a separate implementation around the existing Hugging Face Qwen2 model; it does not claim authorship of the SSD algorithm or the authors' optimized engine.

## Why equal BF16 dtypes can disagree

A serial query and a multi-token verification query use different matrix and attention shapes. Floating point reductions and kernel selection can change rounding. A small score change can flip a close greedy decision, after which subsequent contexts diverge. The first-round native-cache replay reproduces one such failure; that is specific evidence about that failure, not a blanket exemption from correctness checks.

PyTorch explicitly describes different arithmetic results for batched and sliced computations: https://github.com/pytorch/pytorch/blob/main/docs/source/notes/numerical_accuracy.md . vLLM separates speculative algorithm validation from hardware precision and discusses output/logprob variability: https://docs.vllm.ai/en/stable/features/speculative_decoding/ . Its batch-invariant feature addresses this with invariant kernels, rather than assuming dtype equality implies equality: https://docs.vllm.ai/en/stable/features/batch_invariance/ . These are primary references, retrieved 2026-10-20 local time.

## What we will test

1. Independent tiny-model HF references and exhaustive rejection-prefix tests for cache/algorithm semantics.
2. CUDA graph replay versus eager execution of the identical fixed-shape runner.
3. Exact greedy SD equality to a shape-matched target AR reference. The target verification width stays constant, including unused future queries; causal masking isolates each valid query. Rollback changes a logical cursor; stale future slots remain masked until overwritten.
4. Separately report agreement with the fastest native-width AR. Padding a reference must never be used to manufacture a speedup. Report speed against native-width graph AR even if the numerical contract differs, with the difference stated.
5. Timings include real wall-clock synchronization and prefill/decode separation; graph capture and model loading are setup costs, recorded separately.

## Runtime decision

The old active-prefix cache changed tensor shapes, preventing a reusable graph. StaticCache uses stable-address buffers with indexed in-place writes. Pass explicit positions and a fixed-size causal mask. Capture model forward plus token selection for native AR, verification and draft steps. Both AR and SD get graphs. No full-prefix KV clone is needed for ordinary SD. Start with one GPU and the original 7B/0.5B pair, then extend only after measurements.

Source/API references: https://github.com/huggingface/transformers/blob/v4.57.1/src/transformers/cache_utils.py ; https://github.com/huggingface/transformers/blob/v4.57.1/src/transformers/models/qwen2/modeling_qwen2.py ; https://github.com/tanishqkumar/ssd . Do not describe graph replay as operation fusion: it reduces host launch overhead; individual GPU operations still exist.
