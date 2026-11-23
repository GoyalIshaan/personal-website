# Hugging Face boundary and the remaining prefill cost

Checked against executed source17e7b468. Using Hugging Face does not by itself
identify a bottleneck; the relevant question is which operations run per token
and whether their time is included in the metric.

| Component | Where it runs | Included in warm generation E2E? |
| --- | --- | --- |
| Hub download, checkpoint/config loading, tokenizer construction | Fresh-node/process setup | No; these still cost billed node time |
| Independent original HF cached forwards and audit | Before graph capture/timing | No |
| Packing weights, RoPE-table setup, graph warmup/capture | Setup | No |
| Tokenization | Before generation | No |
| Prompt prefill | Each measured request, our dense adapter | Yes |
| Target/draft token verification and proposals | Custom Triton kernels and CUDA graphs | Yes |
| KV updates, graph dispatch, control packets and scouts | Our runtime | Yes, including launched unused scouts |
| Token-list serialization | After measured generation | Reported separately; excluded for frozen-v2 metric compatibility |

`KernelQwen` consumes the original HF model during setup; its original decoder
layers are replaced with Identity after packing and the original head/embedding
references are released. Our custom path does not call HF `generate()` or full
model `forward()` per decode token. PyTorch still provides tensors, allocations,
copies, CUDA graph replay and device synchronization. Removing an import would
not remove that work or improve tensor-core utilization automatically.

`optimized/runtime/prefill.py` implements the HF-compatible dense computation
with `F.linear`, causal `F.scaled_dot_product_attention`, PyTorch normalization/
SiLU and the HF `apply_rotary_pos_emb` helper. It populates our owned cache.
This path remains because it reproduced HF dense outputs, intermediate values
and cache entries exactly in prior numerical diagnostics. Its helper provenance
does not make it a remote call: the tensor operations execute locally on CUDA.
Public model downloads are finished and offline mode is set before timing.

There is a concrete avoidable cost in our adapter: each request materializes
contiguous de-interleaved gate and up weights in every layer. This was necessary
to preserve the original GEMM layout when diagnosing numerical drift. The next
prefill candidate should create those contiguous views once during packing and
reuse them, preserving shapes/dtypes/layouts. It costs extra persistent weight
storage and requires GPU numerical/sequence checks before promotion. Simply
dropping `.contiguous()` changes GEMM leading dimensions and may change vendor
dispatch/arithmetic; that would repeat a known correctness problem.

In H's selected reserved SSD measurement, prefill accounts for10.67% of total
generation time, computed as `1 - aggregate_e2e_tps / aggregate_decode_tps`.
That includes all prefill work, not just weight copies or the HF RoPE helper.
It does not imply10.67% can be removed. Remaining decode work is dominated by
matrix kernels and runtime scheduling in F's actual software timeline. Neither
this fraction nor a synthetic streaming rate establishes hardware SOL.

The independent HF reference is essential for the remaining arithmetic issue:
custom cached decode still exceeds the unchanged TV threshold. Its audit is
outside throughput timing. F's vendor-all control matched HF exactly, while
replacing only cache state did not. Prioritize an isolated operator combination
that repairs this drift, then repeat a matched backend comparison and profile
the accepted implementation. Keep H's same-backend gain labelled provisional.

This note records a code-inspection finding, not an executed prefill-copy fix.
