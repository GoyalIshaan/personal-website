> Historical preparation checkpoint. GPU execution and release are now complete; see [I results](PACKED_ADAPTIVE_NATIVE_I_RESULTS.md). Pending statements below describe the earlier preparation stage.

# I preparation: three independent performance candidates

Status: implemented locally, GPU compilation and execution pending. The user
explicitly chose “Finish preparation; GPU testing can wait” after computer
control continued timing out following reconnection. No I GPU was requested,
allocated or billed by this task. The last confirmed H GPU release remains
2026-10-21 23:37:51 UTC. There is no new throughput result.

The measured control is H's provisional narrow projection plan at K3. H's
four-prompt/two-repeat reserved comparison was534.841→562.624 tokens/s, +5.19%,
with complete custom-backend outputs matching. Its independent HF audit still
fails the unchanged2% TV threshold. None of I repairs or relaxes that gate.
See [H results](EXACT_H_RESULTS.md) and [the plan written before this work](PACKED_ADAPTIVE_NATIVE_I_PLAN.md).

## What is implemented

| Candidate | Concrete change | Tradeoff and remaining evidence |
| --- | --- | --- |
| Packed projections | Setup packs selected QKV/output/down matrices as `[split, output tile, K block, BN, BK]`. A new BF16 MMA kernel reads contiguous tiles while retaining H's fixed query axis, BK, split grouping and accumulator order. A separate lookahead variant loads the next block before the current dot. Both reuse the original merge/residual/RMS functions with their original launch geometry. | Retains original 2D matrices for prefill, so memory increases. Setup time and packed bytes are recorded. Compiler scheduling and bit equality require GPU checks; faster memory access is a hypothesis. |
| Cost-aware speculation | Pre-captures K2/K3/K4, measures setup-time verifier/proposer costs, and estimates conditional acceptance and useful scout reuse online. Hysteresis limits K changes. Each K owns a distinct scout cache. | Setup and Python policy work can outweigh saved drafting. The overlap model is approximate and labels its host-submit proxy. Complete outputs and actual end-to-end timing decide whether this is useful. |
| Native dispatch | Original C++/CUDA extension combines token/position preparation and submits the live PyTorch-owned graph executable on the current stream. Scout seed DMA is fenced before forecast launch. | Native code has not compiled on this Mac. It needs the deployed API/compiler, stream/device tests and fresh-process timings. It may yield a small gain because large host waits include real device work. AR already unrolls dependent tokens into a graph; this path does not replace that AR graph. |

All flags default off. Existing JIT bodies, original notebook and frozen v2
remain unchanged. Packed roles are explicit and cannot silently switch layout
after graph capture. Native mode errors if compilation/API support is missing;
there is no silent performance fallback.

Acceptance observations count accepted proposals and at most the first
rejection. The unexamined tail is not counted as several additional failures.
Already adopted matching scout work is consumed before changing K, so a
reported reuse saves a proposal. Every K's mirror is clamped on rollback and
reset at a new request. Final, missed and suppressed scout activity is accounted
for in timing and statistics; no model KV crosses target/draft devices.

## New analysis of existing evidence

`analyze_coordination.py` reads Nsight SQLite without changing it. It correlates
target packet stage API calls to tiny D2H copies and the next same-thread wait.
Missing correlations remain null. Applied locally to the earlier F traces:

| F SSD interval | Samples | Median | Sum |
| --- | --- | --- | --- |
| Packet DMA ready to CPU return |14|17.083 μs|243.049 μs|
| Host packet wait |14|2999.215 μs|39633.046 μs|
| CPU return to next submission span |13|24.559 μs|1387.240 μs|
| CPU return to next target-forward span |13|633.190 μs|5988.599 μs|

These are instrumented F/K2 measurements, not a new H/K3 or I GPU run. The
large packet wait mostly includes unfinished device work. The next-target gap
includes dependent draft work and preparation. Neither is all removable Python
time, and the interval sums are not disjoint wall-time components. Projection
and scheduling remain higher-priority hypotheses than deleting packet waits.
The first survey refreshes H/K3's actual timeline before candidate timing.

Raw local analysis: `systemsI-previousF-{ar,sd,ssd}-coordination.json` in this
directory. Source SQLite is in the hash-verified F evidence archive. An absent
next-submission span, including AR's unrolled graph, is retained as null.

## Verification completed locally

`python -m pytest kernel_lab/tests -q` passed67 tests;11 CUDA modules were
skipped. The Mac has CPU Torch2.10 and no CUDA/Triton runtime. CPU checks cover
packing bit patterns/padding, plan serialization, policy accounting/hysteresis,
SQLite correlation and evidence acceptance. JUnit is `systemsI-cpu-tests.xml`.
The final syntax/hash/source-preservation receipt is `systemsI-local-validation.json`.

CPU success does not establish CUDA compilation, correct speculative cache
behavior, native executable validity, resource use or a speedup. Prepared GPU
gates include10 packed projection/model tests,6 native stream/device/submission
tests, and2 adaptive cases each with native dispatch off/on. They cover actual
7B matrix shapes, padded shapes, widths1/3/4/5/8, BF16 bits, complete biased or
residual/RMS epilogues, prefix-sensitive rejection, K changes, EOS and request
reuse. Packed candidates additionally need same-weight pretrained forced-logit
and width-invariance checks before comparison.

The runner rejects missing, skipped, failed and too-small test receipts. It
also reads complete timed token lists and references, checks each prompt/repeat
grid and recomputes throughput from raw durations. A zero process exit or equal
reference hashes alone cannot qualify a comparison. Missing jobs, timeouts and
incomplete fresh pairs are explicitly excluded.

## Next GPU run, when resumed

1. Verify reliable control of release, no old active/pending request, live
   whole-node price, and the remaining budget. Stage the immutable source ZIP
   and verify its SHA and every manifest entry in the CPU workspace first.
   Never connect to an old released host. One node, no follow-up/held request.
2. Use `kernel_lab/cloud/workspace_systems.sh` from the staged source root,
   with the newly observed SSH destination and a fresh batch ID. It selects
   `systems_batch.sh`, survey phase, at most660 seconds for transfer/setup/work.
   Container digest and dependencies remain pinned; native compilation is
   outside timing with a task-owned build cache and two build jobs.
3. Survey: baseline regression gates, H/K3 software Nsight, independently gated
   candidates, rotating-bank exact projection pairs and real host dispatch
   loops, then pretrained checks and provisional SSD pilots as time permits.
   A failed candidate does not prevent the other independent paths from running.
   Any budget skip remains incomplete. Hardware counters are not retried after
   the verified permission denial. Keep traces, compiler resources and failures.
4. Export is bounded to another90 seconds. Release the provider node immediately
   after export or at the allocation deadline, whichever comes first. The shell
   prints `LEASE_STILL_BILLING`; script completion is not lease release. Verify
   ended lease, no pending request and stopped meter, then download/hash-check
   the archive and analyze after release. A14-minute allocation at the previous
   verified32USD/hour quote is at most7.466667USD; recheck the live quote.
5. Freeze a useful packed plan, if any, from complete exact q1/q4 micro pairs:
   each activated role needs no per-width median regression and at least1%
   mean improvement. Freeze the global layout/lookahead choice across widths.
   Preserve setup/storage/resource costs and the same-weight result. Put the
   selected JSON in `optimized/plans/` in a new source commit for verification.
6. A second bounded batch uses `SSD_SYSTEMS_PHASE=verify` and optionally
   `SSD_SYSTEMS_SELECTED_PLAN=<committed-plan-basename>.json`. Native and
   adaptive experiments remain independent even if packing loses. Compare
   complete outputs to controls for SSD, SD and the relevant AR packed path.
   Freeze the SSD variant on calibration before the unused `systems-fresh`
   four-prompt pair. No selection from fresh results. Old H reserved prompts
   are now regression data. If the wall bound cannot finish, preserve the
   partial record and exclude it; do not extend the lease silently.

The source delivery includes a staging command and a receipt; no paid run is
started by packaging it. The wrapper accepts only survey/verify phases and
sanitized plan basenames. A future measured winner still requires independent
HF-equivalence work before a validated model-equivalent headline is justified.

## Problems retained for the project history

- Computer-control documentation and inventory calls repeatedly timed out at
  the300-second transport limit, including after the user's reconnect. No GPU
  was requested while release control was unreliable. User then deferred testing.
- Local CUDA/Triton and the deployed C++ toolchain are unavailable. Native and
  packed compilation remain unverified, not passed or failed.
- Review found the initial packed QKV wrapper used a different merge tile from
  control. It now uses exactly control's128-element/four-warp merge launch.
- Review found skipped CUDA tests could be mistaken for a gate pass. Acceptance
  now requires executed passes and no skipped/error/failure receipts.
- Review found fresh prompts were referenced by the coordinator before CLI
  support existed. A distinct immutable split and CLI mapping are now in place.
- Review tightened comparisons to raw timed outputs and complete repetition
  grids; incomplete fresh pairs cannot qualify as successful verification.
- Manual lookahead may increase live registers or cause spills. Packed weights
  duplicate storage. Adaptive cost estimates may be inaccurate. Native dispatch
  may be slower. These are pending experiments, not known improvements.
- Independent HF numerical drift and inaccessible hardware counters remain
  unresolved. This work cannot establish proximity to hardware SOL.

The extra20USD authorization raises the total National Compute cap to80USD.
Prior conservative reservation59.156645 leaves20.843355. Final G/H/Marshall
settlement is pending locally; these numbers are reservations, not an invoice
or a live credit balance. No I compute spend, topup or settings change occurred.
Readings and failed attempts continue in `history/events.jsonl`,
`history/research.jsonl` and [the reading log](READING_LOG.md).
