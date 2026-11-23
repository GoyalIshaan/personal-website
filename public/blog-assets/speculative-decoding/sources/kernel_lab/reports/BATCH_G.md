# B300 batch G: reduction policy falsified; decode operators closely match

Source `8d222d7b4794169e7d110223ff001fa89ea815bd`; **80 tests passed in41.39s**.
The controlled study completed in16.38s with diagnostic exit42. No plan for the
complete target/draft pair met the unchanged finite/L2<=0.05/TV<=0.02/same-top1
gates. No pretrained generation timing rows were accepted.

HF with full versus reduced BF16 vendor reductions produced **exactly identical
logits at every tested identical prefix**, for both models. Disabling the flag
did not repair the discrepancy. Seven decode plan alternatives per model also
failed. Best maximum TV was0.02456 for7B and0.03125 for0.5B; the selected draft
plan reached0.05828 and changed top1 at `cal-code` cached step2. These are
observed small-checkpoint failures, not measurements of general model quality.

Independent operator attribution fed every custom primitive the actual HF
inputs. Across layers, largest relative L2 stayed below0.001 for every tested
decode operation. The0.5B GQA and head were exact;7B gate/SwiGLU and both models'
RoPE were exact. Small local differences can still accumulate. This does not
establish full-model equivalence or rule out all decode issues.

The existing shared dense prefill remained unchanged across the failed plan
variants. Source inspection found that it supplies an explicit boolean mask
with GQA, whereas pinned HF uses causal SDPA without that mask. It also packs
Q/K/V and gate/up projections and prefills `prompt[:-1]`, giving different
GEMM shapes from the independent full-prompt HF reference. These are the next
controlled factors, not established causes.

The prepared repair preserves HF dense arithmetic and native token-major
attention views, copying the computed K/V into the owned cache. Gate/up weights
are unpacked one layer at a time; this incurs extra prefill memory traffic,
which will be included in end-to-end latency. Decode kernels remain packed.
Full-prompt prefill retains HF's GEMM batch shape; the last slot is overwritten
on the first decode. The cursor and all subsequent cache/rollback rules remain
the same. The next study compares legacy-prefix, causal-prefix, HF-prefix and
HF-full policies, each with three frozen decode plans. Only strict passes under
the default HF-full policy can proceed to width tests and timing.

Four independent CPU cases (FP32/BF16, lengths1/17) match original HF exactly
at every captured layer and cache entry, with untouched future-cache sentinels.
The complete local suite passes16 tests and skips3 CUDA-only modules. This is
preparation evidence; pretrained B300 validation remains pending.

Export completed07:20:56UTC; provider release verified07:21:32UTC, a36-second
cleanup gap. Lease ended/released, no active node, meter stopped. The exact69MB
archive was downloaded and SHA-verified:
`18c43afa5f71d603f435f60743768fbba0950598a16a5d322c1b9eaccf75c369`.
Organization-only checkpoint `fe5bcf10-b981-4114-a6a6-ac53c28175e3` and readable
JSON summaries are preserved in `../evidence/evalG-8d222d7b/`.

Billing currently shows a partial G row$3.13 ending07:20:26, before release.
The budget reserves$4.10 for G until final settlement, leaving a conservative
**$16.92 of the authorized$40**. Displayed account credits do not expand that cap.
