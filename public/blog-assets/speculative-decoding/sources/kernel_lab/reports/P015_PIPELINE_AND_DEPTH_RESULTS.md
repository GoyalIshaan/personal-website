# P015: deeper pipelines, larger tiles, and EAGLE depth

Source13027d3. All40trained timing rows and full greedy equality gates passed. Ten paired real-weight projection candidates:7exact,3rejected for output differences.

| Role | Stages | BN | BK | Exact | Speedup |
|---|---:|---:|---:|---|---:|
|gate_up|3|64|128|True|1.2634x|
|gate_up|2|128|128|True|0.9901x|
|gate_up|2|64|256|True|1.2631x|
|gate_up|3|128|256|True|1.3338x|
|gate_up|3|64|256|True|1.2027x|
|down|3|64|128|True|1.5971x|
|down|2|128|128|True|1.0449x|
|down|2|64|256|False|rejected|
|down|3|128|256|False|rejected|
|down|3|64|256|False|rejected|

Selected for full-model testing: gate/up BN128 BK256 stages3 split1; down BN64 BK128 stages3 split4. Both retain two-pass packing. No source duplication and no global precision switch. CUDA binaries and hashes are retained for the seven exact candidates.

Numerical insight: down K18944 split4 uses37chunks of128 per split in the incumbent, but19chunks of256 per split with BK256. Thus BK changes the split boundaries and FP32 reduction grouping; observed output differences are consistent with this structural change. Gate/up split1 has no such split-boundary change. This is a source-level explanation, not a reproduced earliest-instruction error trace. Failed candidates remain rejected rather than weakening the equality gate.

| Context/task | K2 decode tokens/s | K3 | K4 |
|---|---:|---:|---:|
|128/code|527.13|563.64|597.59|
|512/prose|453.09|449.77|435.31|

These prompts differ, so this is not isolated context scaling. At128, K4 emits more useful tokens per round; at512, extra drafting is wasted often enough that K2 wins. Full-model incumbent projection schedules were used for this depth sweep.

App ap-qrzI91O0EzAqvAKOXiiTn1 stopped/tasks0 with no containers;180s conservative billed-lifetime bound0.7275USD. P016 separately compares incumbent and selected target models within one allocation, each owning caches/graphs. Five interleaved repeats; target recipe identity is method-specific. Both AR and EAGLE must match complete outputs across targets before any runtime promotion.
