# L plan, recorded before implementation

K's immutable source and downloaded results remain the baseline. L addresses
two observed blockers before attempting another kernel performance claim.
The existing HF numerical discrepancy is unresolved and its gates stay intact.
No further GPU is allocated or requested; this is local preparation.

## Hypotheses and intended changes

1. TP teardown: K destroys the NCCL group while captured decode graphs remain
   alive. Explicitly synchronize, reset all owned graphs, break body/buffer
   references, then destroy the group. Track in-progress captures so failures
   cannot leave an unowned graph. Reset the isolated gather graph as well.
   Add append-only per-rank lifecycle checkpoints and an untimed teardown
   watchdog stack dump. Publish success only after cleanup, and require both
   lifecycle receipts plus a zero process exit for new sweep results. Do not
   increase the 80-second tiny gate limit or disable NCCL error handling.
2. Micro controls: packed gate/up must compare against the deployed unpacked
   `linear_batched` fused SwiGLU with the same plan, input/output shape and
   rounding boundaries. Eliminate single-part concat and B1 stack copies from
   other legacy-chain controls. Record backend identities and adapter operations
   in a versioned comparison contract; future audit rejects missing or altered
   contracts. Historical K receipts remain readable with their explicit confound.
3. Next bounded GPU selection: exact tiny TP computation AND normal exit first;
   then B1 AR1 control/packed and TP2 control/packed at 128 and 2048 inputs.
   This supplies an AR1 fallback and full-model packing attribution even if TP2
   fails. Every case retains its independent HF audit, exact native logits,
   complete tokens and numerical status. Batch work remains secondary, <=32.

## Validation before any GPU request

Use CPU test doubles to exercise graph ownership, partial-failure retention,
cleanup order, idempotence and refusal to destroy a group after reset failure.
Test versioned receipt rejection of missing/failed cleanup and unfair baselines.
Add CUDA graph close/reopen guards to existing GPU model tests, but label them
unexecuted on this Mac. Parse sources/shells, replay K's evidence audit to retain
historical compatibility, and create a new immutable source package after commit.
CPU checks cannot establish that the GPU hang is fixed or packing is faster.

The next GPU run also needs funding/admission and reliable explicit release
control. The conservative project reserve has about $2.22 remaining under $80;
this document does not authorize exceeding it. No remote run is part of L's
local preparation. A medium-context HF localization remains a subsequent
correctness investigation, rather than a threshold relaxation.

## Reading and attribution

R033: [NVIDIA graph/NCCL teardown guidance](https://docs.nvidia.com/dl-cuda-graph/troubleshooting/process-hang.html),
teardown section. Applied ownership order; K has no native stack confirming the
hang location. The sample's environment overrides are not adopted.

R034: [PyTorch CUDAGraph API](https://docs.pytorch.org/docs/main/generated/torch.cuda.CUDAGraph.html),
public reset and replay lifetime sections. Use `reset()` and explicit device
synchronization, without new graph hooks/private APIs or hot-path diagnostics.
No external kernel source is copied. These are lifecycle repairs, not measured
kernel speedups; measured outcomes will be appended after actual execution.

## Implemented locally

`throughput/lifecycle.py` owns synchronization/reset/buffer release ordering.
`BatchedARDecoder.close()` is explicit and idempotent after success; failed
retirement forbids further decode while keeping ownership for cleanup. Graphs
are registered before capture and graph-mode body closures are not retained.
The temporary gather graph registers with the probe's cleanup owners until its
own close succeeds. No successful group destruction is attempted after a failed
owner close. Failure evidence and the outer process/job limits remain active.

The probe writes rank-specific JSONL stage journals and periodic Python stacks
if untimed teardown stalls. Success summaries are written after explicit graph
and process-group cleanup. New sweep receipts require lifecycle version 1 and
ordered reset/teardown journals on every rank, plus normal worker exit. These
prove the observed cleanup stages, not immunity from all possible native hangs.

Packed gate/up now compares against unpacked `linear_batched` using the same
schedule and fused SwiGLU. A one-part projection returns its original tensor or
tuple; B1 attention adds a view. Wider legacy comparisons still expose required
concat/stack assembly in the comparison contract. New sweep micro receipts
require that contract, while K's original data remains auditable separately.

The eight default B1 cases pair control/packed for both AR1 and TP2 at 128/2048
input tokens. The tiny TP gate still has its original 80-second limit. If TP
fails, the AR1 pairs can still run within the external batch budget; no failed
TP measurement becomes a result. Unrun cases remain explicit in the ledger.

## Local outcome and pending GPU check

- **113 CPU tests passed, 13 CUDA modules skipped**, zero failures. Receipt:
  [L_LOCAL_TESTS.xml](L_LOCAL_TESTS.xml). Fault injection covers failed resets,
  synchronization failures, partial-capture ownership, alias handles, cycles,
  group destruction order and invalid/missing lifecycle receipts. Copy tests
  verify that single-part adapters retain tensor storage.
- All 123 current Python files and 21 shell scripts parse. The 12 kernel source
  files from K, all 10 pre-J kernel files, original notebook, v1 and measured v2
  remain unchanged. [Static receipt](L_STATIC_VALIDATION.json).
- [Dry-run plan](L_SWEEP_DRYRUN/ledger.json) records eight selected B1 cases out
  of 80 model cases, three selected micro cases out of 220; no GPU work started.
  K's six model and 42 micro raw samples still pass the historical evidence audit.
- CUDA compilation, real graph retirement/NCCL process exit, corrected micro
  timings and full-model packed speed are **unexecuted for L**. No new performance
  gain or numerical correction is claimed. Exact gates and HF thresholds did not
  change; GPU test assertions for close/idempotence/reuse rejection are prepared.

Re-reading F's saved numerical attribution also showed that a previous short
calibration failure survived substituting HF's exact KV, while the all-vendor
control reproduced HF. That historical result points toward operation/reduction
differences; it does not establish the cause of K's 2048-token failure. Extend
that teacher-forced layer/operator diagnosis to the failing K context before
promoting any performance result. A cache-only repair must not be assumed.
