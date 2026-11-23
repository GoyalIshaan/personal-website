# P012/P013: paired AR queue and projection results

Sourceec5f894; Modal2xB300; all97trained gates passed,50timing rows independently revalidated. Native gate28passed plus2fixed-queue GPU tests. Full ZIP SHA256ebfd9db0a60f0e8f6c06292625cfd0fb6243526332d87a4e0a92c2a2ae2d26d8. Both Nsight smoke probes pass; ncu clocks uncontrolled. No full-model Nsight capture yet.

## AR queue

Opt-in removal of per-chunk CPU packets preserves complete outputs and EOS fallback. Five paired repeats per context/chunk.

| Context | Chunk | Median speedup |95% paired bootstrap CI|
|---:|---:|---:|---|
|128|8|0.99936x|[0.998966244718029, 0.9995812267910819]|
|128|32|1.00212x|[1.0016894201326483, 1.0025666387361134]|
|512|8|0.99950x|[0.9992650849979617, 0.9995730186841896]|
|512|32|1.00191x|[1.0018664806382969, 1.0024602616667613]|

No3%runtime improvement; do not promote. GPU work dominates this already-amortized AR path. This is inference from the intervention, not a complete profile attribution.

## Real-weight feed-forward projections

Seven paired samples,16operations per graph, packing included. Native proof and exact outputs at widths1/4/8 passed. No alternative wins.

| Role | Stages | Packing | Incumbent us | Candidate us | Speedup |
|---|---:|---|---:|---:|---:|
|gate_up|1|two-pass|35.316|49.910|0.707x|
|gate_up|2|row-fused|35.356|37.144|0.952x|
|gate_up|1|row-fused|35.392|51.398|0.687x|
|down|1|two-pass|24.520|36.580|0.671x|
|down|2|row-fused|24.518|33.994|0.721x|
|down|1|row-fused|24.536|47.982|0.512x|

Decision: retain2stage/two-pass incumbent. Reducing pipeline stages hurts; fusing row-wide packing loses despite saving a launch. Next P015 retains two-pass packing and tests deeper pipelines/larger tiles, alongside EAGLE depths2/3/4. The gate/up and down shapes are37888x3584 and3584x18944. All candidates remain in the immutable registry p013-candidate-index.json.

App ap-BTXCvnbKzSUWaH9p7bLl7P explicitly stopped. Refreshed provider state stopped/tasks0 and containers[]. Conservative elapsed bound330s =1.33375USD; invoice not final. Full binary profile exports preserved.
