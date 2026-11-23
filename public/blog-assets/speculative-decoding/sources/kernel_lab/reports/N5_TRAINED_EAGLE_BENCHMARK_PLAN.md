# N5: trained EAGLE single-request qualification and timing

Plan before implementation. One B300 request is now queued first; N4 source
69318355 is already staged with343verified files and ready. Launch that bounded
qualification batch immediately if assignment happens during this preparation.
Do not delay assigned GPU work to finish optional code. Total cap remains$120.

Prepare a local-only-model worker for pinned Qwen2.5-7B target and pinned trained
EAGLE checkpoint. No implicit download, remote code, GPU allocation or release.
Full payload/hash/header/shape/mapping checks precede loading; a separately
bounded cloud download phase can supply public cached assets later. CPU-only
CLI/receipt tests do not qualify trained CUDA inference.

Use native FP8/FP4 target, optional N2 target fusion, and BF16 or native draft
roles. Same target weights and precision for AR and EAGLE. Require matching N
primitive/instruction receipt and N2 receipt when fusion is requested. Verify
resolved target7B geometry/revision. Keep original BF16 numerical comparison
separate from changed-precision greedy equality; no task-quality claim.

Capture width-one AR plus chunks8/32, and feature target widths needed by K1..7.
Use semantic development prompts windowed to explicit128/512/2048/4096 lengths;
record exact input IDs/hash and construction. Frozen final/held-out sets stay
untouched. Default first trained batch:128/512 contexts,K3,128 outputs,3 repeats.
Before timings: complete-output AR-chunk agreement; EAGLE exact reference
match; EOS and unrelated-request reuse; capture-width logits/feature checks.
Stop on first failure and preserve raw state evidence.

Report prefill, decode, serialization/return latency, setup, all output tokens,
acceptance, useful tokens per verification, repair work, feature-copy payload
and memory. Include all discarded/overshoot work in wall time. Both decode and
end-to-end/return-inclusive throughput must be explicit. Alternate method order
and preserve every repeat; no fastest-single-observation or synthetic-to-trained
relabeling. EAGLE CUDA SSD remains unfinished and must not be claimed here.

All graphs are synchronized/reset in finally blocks. Only a complete receipt
after exact greedy gates, rows and cleanup may support scoped performance.
Provider lease release is a separate explicit action immediately after export.


Local implementation checkpoint, 2026-10-22 07:32 UTC: the worker, pinned
asset fetcher and bounded cloud wrapper are implemented. Default CLI commands
perform no download/CUDA work. CPU protocol checks20passed; the broader
kernel_lab plus root suite300passed/33CUDA skips. Maintained170Python sources
parse and25cloud shell scripts pass bash-n. NativeN4 source69318355 is currently
running on the assigned node; the uncommitted N5 code is absent from that batch.
No trained payload, numerical gate, acceptance or throughput result exists yet.

The wrapper repeats N and N2 CUDA qualifications before the trained phase. If
that prefix takes more than150s it records a skip; otherwise a single240s bound
covers public asset download, byte verification, model setup, graph capture,
correctness and timings. Outer660s setup/work plus90s export remains enforced.
A child N2 completion marker does not end the whole batch; explicit lease release
follows only the parent export marker (or the external allocation deadline).
