# B300 batch H: exact prefill; remaining decode drift

Source `89e195b3f41ca9ffaf8a9f6e44f111717ab2aa86` passed **84 tests in39.50s**.
The full pretrained diagnostic completed in16.34s, exit42. On both7B and0.5B,
HF-compatible prefill matched the independent HF trace **exactly at every
captured layer, every KV entry and the final logit** for `cal-code`.

This repairs the previous dense-uncached difference, but does not repair the
cached decode distribution gate. Causal-mask-only changes gave identical failed
decode results. Full versus prefix prefill gave identical decode results under
each tested plan. Both hypotheses therefore fail as explanations of the
remaining decode drift at these checkpoints. Original failure rows stay intact.

| HF full-prompt policy | Target maximum TV | Draft maximum TV | All target/draft top1 match |
| --- | ---: | ---: | --- |
| Selected C plans | 0.024570 | 0.046663 | yes / no |
| Fixed-M16 vendor projection + gate | 0.027565 | 0.055853 | yes / no |
| Projection MMA BK128 S8 | 0.032723 | 0.031253 | yes / no |

All default candidates failed unchanged TV<=0.02 gates; no generation timing
row was produced. G's isolated-operator errors were small, while full cached
decode still accumulates differences. This supports investigating accumulated
BF16 schedule differences; it does not prove every decode primitive is correct.

## Next experiment: explicitly provisional runtime profiling

Repeating plan/prefill searches without throughput or counters has not delivered
the user's performance goal. The next batch freezes the selected C decode plans
and repaired HF prefill, retaining all strict numerical audit results. An
**explicit CLI diagnostic flag**, off by default, permits profiling after an
HF audit failure. Such output is labeled `diagnostic_completed` / diagnostic-only
and is automatically excluded from validated speedups. No tolerance changes.

Exact target first-row equality across widths1/3/5/7 and exact native-AR versus
AR chunk/SD/SSD tokens remain hard gates before timing. Every timed row repeats
the native-AR check. The exploratory run uses only the two calibration prompts,
128 tokens and two repetitions, with separate bounded profiling. Verification
and reserved prompts are not used to choose kernels or K/B. The result can
identify launch, memory, synchronization and acceptance costs, but cannot be
presented as an independently numerically validated speedup.

This is a deliberate workflow change after the failed H gate, recorded before
execution. It prevents an arbitrary small-audit threshold from blocking all
runtime diagnosis while keeping the failed correctness evidence visible.

Export07:40:10UTC; provider release07:41:10UTC. Lease ended/released, no active
node, meter stopped. UI input/confirmation handling caused a60-second cleanup
gap. Exact archive SHA256:
`63491e71f7e56b71766f90125c5eec1235de3c49eef6b35269ca105524f59e22`.
Organization-only checkpoint `2818885b-e63f-4bc5-83fa-4c7b176c2cda`. Archive and
readable audits are retained under `../evidence/evalH-89e195b3/`.
