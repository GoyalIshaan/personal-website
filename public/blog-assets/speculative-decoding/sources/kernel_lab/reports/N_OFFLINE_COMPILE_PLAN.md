# CPU-only native compiler preflight while queued

Plan before implementation: install the official pinned Triton3.7.0 wheel in a
new CPU-workspace virtual environment, extract only our decorated kernel
functions (unchanged source text, full hashes), and compile explicit signatures
with ASTSource and GPUTarget(cuda,103,32). No CUDA driver or launch is needed
for the explicit-target compiler path, subject to testing this hypothesis.

First check the CPU workspace toolchain without contacting a GPU. Do not
allocate, launch a kernel, use a released node, or modify provider settings.
Use a task-specific cache and keep generated source/TTIR/TTGIR/PTX/cubin or
failure traceback. Compile first original FP8/FP4 projections and activation
packers, then N2 fused epilogues. Stop each subprocess on a bounded timeout.

This wheel is not proven byte-identical to the pinned NGC vendor compiler.
An offline success establishes only static lowering on that wheel, never a
CUDA execution, exact numerical result, native instruction runtime proof,
occupancy or speed. Real two-GPU gates remain mandatory. Offline failures
can still identify shape/type/API problems before paid compute begins.

Source read R060: pinned v3.7 compiler.py ASTSource/compile and explicit target
selection; official PyPI3.7.0 distribution metadata and Linux wheels. No new
external kernel implementation copied. No offline compilation performed yet.
