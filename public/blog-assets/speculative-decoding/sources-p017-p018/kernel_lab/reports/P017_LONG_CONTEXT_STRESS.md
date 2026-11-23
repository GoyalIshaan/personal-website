# P017: one request with 128,000 generated tokens

Status: completed128000output AR endurance test, with earlier deadline-limited attempt preserved. See executed results below; no long-context SD/SSD or quality-equivalence claim.

The user authorized an additional15USD on2026-10-28 (Modal round cap25USD), then confirmed an additional15USD in Modal credits. No purchase authorized. Each run must still reserve its worst-case cost and independently verify termination. Beam reports zero B200/B300 capacity.

## Hypothesis and limits

P016 reaches696.64decode tokens/sec on128input/128output using trained EAGLE. This does not predict endurance throughput: full-history attention grows with cache occupancy. First isolate AR correctness and capacity; EAGLE's trained long-context behavior is unqualified. This test is not a 128k AR/SD/SSD equivalence claim.

Target: pinned Qwen2.5-7B, P016 FP8 target projections/BF16 attention/KV, static YaRN factor4 with original32768positions,131072total slots,128prompt+128000output+one inactive-graph reserve. No rolling cache, eviction, synthetic replacement of generated history, or repeated-prefill segmentation. Target KV allocation is7GiB. Generation ignores EOS for endurance; record first ignored EOS. This is beyond documented8192output range, with no coherent-text or quality-equivalence claim.

New code: narrow explicit static-YaRN adapter validation; bounded AR generator with one prefill and per1024output durable token checkpoints; long-attention oracle gates at127/4095/32767/65535/128127/131068positions, width1/4exact checks; pinned-HF RoPE table checks; tiny-model graph/no-graph continuation tests and full-model32token ARchunk1/chunk32/bounded equality. Gates must pass before endurance generation.

The existing attention schedule is unchanged initially. Its512-way reduction and launch of inactive splits may be slow or fail compilation at131072slots. Preserve failure evidence before changing reductions; hierarchical merging would create a new numerical recipe.

## Measurement and cleanup

Save per-window emitted tokens, populated KV positions, wall time, allocated/reserved memory; raw immutable token segments and hashes; precision/config/source identity; overall latency and completion/deadline/OOM/failure status. Timing includes checkpoint overhead and is a single diagnostic run, not a promotion. Deadline checked between graph chunks; outer subprocess and provider deadlines protect against hangs. Export streamed snapshots and final archive, stop exact app, confirm stopped/tasks0/no containers, reconcile upper bound only after termination.

Existing two-device native qualification remains mandatory; first stress job uses GPU0 for AR and explicitly records GPU1 unused for inference. No claim of two-GPU decoding. Bound first batch to1200seconds including setup/export/shutdown (14.55USD/hour conservative pair+CPU+RAM rate;4.85USD reservation). The internal worker is900seconds; setup consumes part of that allowance. Partial progress at the deadline is valid diagnostic evidence, not completion of128k.

## Sources read and adopted

- https://huggingface.co/Qwen/Qwen2.5-7B-Instruct — model card context/generation limits and static YaRN factor4 configuration. Use pinned HF's table construction, not copied formula code. Static scaling can change short-context outputs, so give this lane a separate identity.
- https://modal.com/pricing — refreshed2026-10-28: B3000.001972USD/second each; CPU0.0000131/core/second; RAM0.00000222/GiB/second. Conservative14.55USD/hour bounds two GPUs,2CPU,32GiB.

No third-party implementation copied in this change. Prior kernel implementations and notices remain in force.

## Attempt1: deadline-limited, not a capacity failure

Run `modal-b300-long-context-20261028T220853Z`, source356be2b, app`ap-wmCidTLlCVhEbncxnjfVxa`. Native28tests passed;4fixed-queue/bounded-continuation GPU tests passed. All6long-attention positions passed, width1/4exact; max absolute SDPA difference0.00048828125. HF YaRN sampled tables exact;32token chunk1/chunk32/bounded output exact.

Generated119968outputs in587.541889decode seconds:204.1863tok/s overall. Early1024window232.59tok/s; last partial window176.68tok/s. Decode-phase peak27.52368GiB PyTorch allocated; peak counters reset after setup, so this is not whole-process peak VRAM. First ignored EOS index1391. Continuous token checkpoints and final sequence hash verified locally. Stopped by the planned internal deadline; no OOM or capacity fault. Not128k completion. ArchiveSHA256`9f12a3e9cea6422b83a5803f843045ae764e9610c439fc51d56300d7919abb58`.

Explicit stop succeeded; refreshed provider receipts show stopped/tasks0/containers[].897.1874s entire driver lifetime, rounded900s conservative cost3.6375USD. No settled-charge claim. Initial immediate readback had Tasks1 after stop; waited for independent Tasks0 before reducing reservation.

Decision: retain this attempt, launch one fresh full request with more internal time. No reuse/re-prefill of partial output masquerading as one continuing request. Add1500second outer option:1200second worker,1260second stream guard,1320second function limit plus60second startup,1430second host deadline and70second shutdown allowance. At14.55/hour reservation6.0625USD. Existing1200second mode unchanged. Per-request benchmark remains capped at850seconds (including model setup); current measurements predict enough decode time, not a guarantee.

Budget allocation: move3USD of the unused confirmation phase to experiments (17USD experiments,2USD remaining confirmation reserve; two qualification phase limits3USD each). Total remains25USD; this is no additional authorization or balance assumption. Initial local budget test caught phases summing28USD; corrected the allocation before launch and27focused tests pass. User-confirmed15USD additional balance less first run's3.6375USD bound yields at least11.3625USD for the next launch, subject to provider billing. No other compute active.

Added a post-export validator and3CPU tests covering incomplete results, missing token segments and false completion. It validates output hashes and continuous cache cursor progression before generating a summary. Remaining uncertainties: no full128kAR/SD comparison, no long-context trainedEAGLE qualification, no counter-based attribution yet. P016short-context results are a different workload and RoPE/capacity recipe.

## Attempt2: completed128000outputs

Source06b2a97, run`modal-b300-long-context-20261028T222504Z`, app`ap-WQ1iTrlBVLVXPmMTdtqqnI`. Generated128000outputs after128prompt tokens:128128total sequence tokens, one request, one prefill, full KV retained. Decode631.965947442s;202.54255869tok/s average; complete request631.981153017s. Final1024window174.699tok/s. Decode-phase peak27.52368GiB PyTorch allocated; no OOM. EOS ignored after index1391; not a coherent-text claim.

All native28 andcontinuation4CUDA gates passed again;6long-attention regions, sampledRoPE tables and32tokenARmode equivalence passed. Exported125token segments are contiguous and final sequenceSHA256`316b2427c5f18e8845b7f808dc37b93063834c59e15698ffdddea707a7183835` verified. All119968shared outputs exactly match attempt1 across allocations. This establishes AR repeatability, not trainedAR/SD/SSD equivalence at long context.

ArchiveSHA256`6f9007ced4cb5b1685a39e996e49acd8dd84c9cb663d6ced629bfb6ef42ec691`. Explicit stop plus refreshed stopped/tasks0/containers[] verified. Driver925.8788s rounded930s cost bound3.75875USD. Both attempts together7.39625USD upper bound; no settled invoice claim.

| Output window ending at | Window tokens/sec |
|---|---:|
| 1,024 | 233.92 |
| 32,768 | 218.95 |
| 65,536 | 205.54 |
| 98,304 | 185.47 |
| 128,000 | 174.70 |

[Throughput plot](figures/p017-throughput.png) · [PDF](figures/p017-throughput.pdf) · [Raw window CSV](figures/p017-throughput.csv). Immutable recipe/run IDs: `history/registry/p017-long-context-index.json`.

Decision: endurance objective met at128000outputs. No change to the P016production winner. Next measured experiment P018 isolates the merge shape; full-model/SDEAGLE long-context optimization remains separately gated.
