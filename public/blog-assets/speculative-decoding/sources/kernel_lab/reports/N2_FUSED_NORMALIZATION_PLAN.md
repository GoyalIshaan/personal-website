# N2: fuse normalization and native activation packing

Status: planned locally; no N/N2 CUDA compilation or speed result. User keeps
one B300 request queued and authorizes work while waiting. Total cap: $120.
The original N source201d193d remains immutable and ready to launch.

Observed source cost: native output/down projections finish in an ordered
split merge + residual/RMS kernel. The next native qkv/gate-up projection then
launches row-global reduction and activation packing (or a separate row-fused
packer). Every layer repeats both boundaries. CUDA graph capture removes
Python launch dispatch but does not remove the graph's GPU kernel nodes.

Hypothesis: append exactly the existing BF16 rounding and native packing to
residual/RMS, pass a NativeOperand to the next projection, and eliminate one
or two packing launches per eligible boundary. This is a latency hypothesis,
not a measured bottleneck or speedup. One-CTA row packing can increase register
pressure or become slower; no default promotion without paired GPU evidence.

Implementation scope:
1. New standalone fused residual/RMS + FP8/FP4 pack and ordered split-merge +
   residual/RMS + pack kernels. Retain flat RMS reduction topology, division,
   explicit BF16 conversion boundaries, row independence, scale ABI and nibble
   rounding. Restrict eligible widths to multiples128,128..16384 initially.
2. New prequantized projection entry points consume already encoded operands;
   existing entry points continue to perform their own quantization.
3. Opt-in adapter derived from NativeQwen. Fused normalized values feed native
   qkv/gate-up; final head and unsupported boundaries retain BF16. Preserve raw
   residual capture for EAGLE. Keep original N paths and tests unchanged.
4. Independent CPU composition oracle, prepared CUDA byte/equality tests and
   paired CUDA-graph timing of the complete boundary. Count all quantization,
   merges and copies; report compile resources. No timing of kernel fragments
   presented as request tokens/sec. A separate full-output gate is mandatory.

Failure criteria: activation bytes/scales/globals differ; width dependence;
new AR/SD/SSD or EAGLE output mismatch; fallback to BF16 MMA; compile failure;
spill/occupancy regression or paired graph latency loss. Log failures intact.

Sources read before editing: R057 Triton normalization tutorial (flat reduction
and fused pointwise stages), R058 block-scaled tutorial (scale layout and
packing), R059 NVIDIA PTX scaling/type reference. Current docs are broader than
the pinned3.7 toolchain; source choices must still compile on that exact stack.
No external kernel implementation is copied; build on the project's N kernels.
