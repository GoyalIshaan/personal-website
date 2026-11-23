# N4: real target geometry and static schedule pruning

Local validation: **236 passed,18 CUDA modules skipped**. No GPU assigned or
executed. Exactly one B300 request remains queued, last observed position3,
watch armed. The total cap remains $120. Release immediately after the bounded
GPU batch; the CPU static sweep does not allocate a GPU.

Before measuring, corrected the synthetic N2 boundary to derive H3584/F18944,
qkv4608 and gate/up37888 from the project's existing target7B geometry. Old
unexecuted code used EAGLE's F14336 with target qkv4608. No measured row used
that mixed geometry. CPU regression separates the model geometries. The
activation-byte gate now includes target down-projection input width18944.

GPU gate artifacts now save driver-supplied registers/spill attribute and
compiler shared metadata after a real launch, alongside separate PTX/IR proof.
Missing attributes remain null. They are not occupancy or throughput values.
Source packaging includes numbered N2/N3/N4 JSON/XML receipts and compiler
reading provenance; originals and earlier immutable archives remain intact.

A bounded CPU-only384-case sweep uses actual target qkv/output/gate-up/down
shapes, M1, FP8 BN64/128 or FP4 BN128, BK128/256, split1/2/4/8, warps4/8 and
stages1/2. Each compiler worker logs its own ptxas resources and native code
proof using strict accumulation0. At the first checkpoint85cases compiled,
all85showed native emission;81passed resource-pruning requirements. These are
partial static observations, not a speed ranking or a selected runtime plan.
Full failures and final matrix will be appended after completion.

No candidate is promoted from register counts. The frozen launch-ready source
will still run original N28 CUDA cases, then N2's12, then one paired B1 boundary
microbenchmark only if both gates pass. It stops on failure; no model download
is included in this first qualification batch. Source remains ready while
optional CPU sweep work proceeds. Future pretrained acceptance/speed requires
a separate executed model gate and complete request accounting.
