# N: local native precision and EAGLE integration

User explicitly authorizes LOCAL work only. GPU testing/execution stays paused;
do not allocate a node, start a CUDA test on hosted compute, purchase credits,
or raise the80USD cap. CPU reference tests and static inspection are allowed.
M source779d58a and its archive remain immutable. No new speed claim without
actual resumed GPU execution and full-output qualification.

## Work recorded before implementation

1. Pin/read Triton3.7 dot/dot_scaled and Blackwell block scaling semantics.
   Implement native FP8 and FP4 projection candidates, deterministic per-row
   activation quantization, independent CPU encoders/decoders/scale layouts.
   Query rows cannot affect another row's scale. Fixed physical low-M tiles and
   K/split schedules preserve AR/verify arithmetic independence. No BF16-upcast
   fallback can receive a native-FP4 label. Emitted instruction proof is required
   after future GPU compilation; source usage of dot_scaled alone is insufficient.
2. Wire native projections into an opt-in target/draft adapter, fused activation
   and residual/RMS epilogues, with an independent quantized-operand reference.
   Keep original BF16 quality comparisons and within-precision greedy gates.
3. Implement a CPU EAGLE one-layer reference with the audited seven-KV-head ABI,
   three target features, separate token/feature norms, offset vocabulary map,
   target-token feature shift and explicit cache rollback. Use small synthetic
   tensors to validate semantics before obtaining/executing pretrained weights.
4. Implement target feature capture, a CUDA draft adapter and feature-aware SD
   orchestration. SSD needs self-conditioning while target features are pending;
   feature provenance, corrected committed caches and exact target verification
   must be explicit. Do not silently replace unavailable target features by zeros.
5. Add meaningful CPU integration/reference tests and PREPARED CUDA gates. Record
   failures, source-reading scope, implementation limitations and exact commits.
   Package a standalone local candidate without uploading or running any GPU job.

Native precision arithmetic and EAGLE's shifted hidden-state cache are separate
contracts. A dequantized BF16 dot is not an exact native low-precision reduction
oracle; compare decoded-operand algebra within tolerance, and require exact
width/full-greedy agreement within the native implementation before timing.
