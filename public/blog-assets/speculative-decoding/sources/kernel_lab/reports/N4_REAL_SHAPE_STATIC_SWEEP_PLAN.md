# N4: actual Qwen projection shapes and static schedule sweep

Plan before implementation, while one B300 request remains queued. N3's fixed
source is already staged and ready; do not delay launch after assignment to
finish this optional static sweep. No GPU allocated at this checkpoint.

Use the project's existing Qwen2.5-7B geometry: H3584,F18944,28Qheads,4KVheads,
dim128. The EAGLE checkpoint has F14336 and7KVheads; keep the two geometries
separate. Static review found the N2 synthetic boundary microbench used F14336
with target qkv width4608. It was explicitly synthetic and never executed, but
is not an actual target boundary. Correct it to derive both dimensions from
GEOMETRIES['7b'] and add a CPU geometry regression before any measurement.

On free CPU, compile the exact current N3 kernel at real target qkv/output/
gate-up/down shapes, logical M1, with FP8 BN64/128 or FP4 BN128, BK128/256,
splits1/2/4/8, warps4/8 and stages1/2. Expected384 variants. Use actual epilogue
mode (qkv bias or SwiGLU only when split1; output/down ordered merge otherwise).
Capture emitted instruction proof, ptxas register/spill reports and compiler
shared requirements. Bound each child and the whole CPU job. No CUDA launches.

Use resources only to prune unsupported/fallback/spilling candidates. Do not
rank speed by register count, promote a plan, or infer throughput/occupancy.
Any later GPU timing and full greedy gates must use exact same source/schedule.
Existing qualification-shape resource rows remain labelled as such.
