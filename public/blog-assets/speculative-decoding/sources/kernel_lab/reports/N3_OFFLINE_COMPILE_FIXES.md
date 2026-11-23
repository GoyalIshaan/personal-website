# N3: two compiler problems found and fixed while queued

The B300 request remains queued under the user's instruction. No GPU was
assigned or charged during this work. The CPU workspace installed official
Triton3.7.0 in an isolated virtual environment; Docker was unavailable because
there is no daemon socket. No provider setting or Docker daemon was changed.

## Compiler history

| Snapshot | Static compilation | Actual FP8 emission | GPU execution |
| --- | --- | --- | --- |
| Original staged N/N2 e033491a | 14 pass,8 fail | All projection cases fail at masked loads | None |
| Floating masked-fill fix | 22 pass,0 fail | FP16 MMA-v2 fallback | None |
| Fixed FP8 physical16 tile | 22 pass,0 fail | All4 projection modes emit tcgen05 FP8, no FP16 MMA | None |

First failure: `tl.load` cannot cast an integer-zero mask fill to FP8. Four
masked FP8 data/scale loads now use floating0.0. FP4 data remains packed uint8.

Second failure: compilation alone concealed FP16 emulation. Original physical
query dimension8 fails pinned Triton3.7 MMA-v5 geometry, which requires result
CTA dimensions divisible64 and16. Its SM100/103 MMA-v2 path promotes FP8 to
FP16. The candidate now fixes physical queries16 and restricts FP8 BN to64/128.
The `max_num_imprecise_acc=0` request is unchanged. Logical query widths stay
1..8, with one fixed physical layout independent of the number of queries.
This is a new recorded schedule, not an assertion of old/new bit equivalence.
Within-configuration AR/SD/SSD equality remains a hard real-GPU requirement.

The native proof now requires tcgen05 FP8 on SM100/103 and rejects half-precision
MMA as well as virtual FP8 MMA-v2, which can itself be emulated in SASS. We did
not weaken the proof to call a fallback native. FP4 static emission already
shows mxf4nvf4/block16. Full generated files remain in the CPU evidence folder.

## Resource evidence and limits

All22 CPU ptxas probes report zero spill stores/loads. FP4 projection qualification
cases use231..233registers/thread at split1; split4's tiny one-block case uses54.
Fused FP4 RMS packing uses96/107registers at3584 columns and213at16384. These
are compilation resources on qualification shapes, not actual Qwen performance.
Split4 in this matrix has only one K block; do not extrapolate its register
savings to full-size projections. Compiler-declared dynamic/shared requirements
must be kept separate from ptxas static shared memory.

Three FP8 reassemblies did not byte-match their cached cubin; those resource
rows are auxiliary, not an identity certificate. All FP4 resource cubins matched.
No static result establishes occupancy, bandwidth, numerical correctness,
end-to-end throughput or SOL. Official-wheel/pinned-NGC equivalence is unproven.

## Validation and next step

Full local suite: **234 passed,18 CUDA modules skipped**. Existing original
notebooks, v2 and immutable N/N2 archives are preserved. Two new CPU extraction
contracts and an incomplete-resource-report check pass. Native proof fixtures
reject FP16 and emulated FP8-v2. No GPU numerical threshold is relaxed.

Stage this corrected source, then run the bounded N28/N2-12 CUDA batch immediately
on grant, export and explicitly release. Until that happens, there is no native
CUDA execution receipt or speed improvement. The old staged e033491a source is
superseded by this fix and should not be chosen for the next GPU run.

Evidence: [original failures](N_OFFLINE_RUN1.json), [fill-only result](N_OFFLINE_RUN2.json),
[fixed-tile emission](N_OFFLINE_RUN3.json), [assembler resources](N_OFFLINE_RESOURCES3.json),
[local validation](N3_LOCAL_VALIDATION.json). Primary references and provenance:
READING_LOG R060/R061 and research/triton37-offline/receipt.json.
