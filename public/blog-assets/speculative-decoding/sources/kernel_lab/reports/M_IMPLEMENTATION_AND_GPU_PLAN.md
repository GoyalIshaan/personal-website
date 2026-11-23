# M: compressed projections and shared-prefix parallel scouts

Status: implemented locally, CUDA compilation/execution pending. No new
throughput, quality, numerical-fix or SOL result is claimed. K remains the last
GPU run and its node is released. The original/v1/v2 notebooks and old kernel
bodies are preserved. M follows the plan recorded in K133 before implementation.

## User-approved numerical contract

Precision changes are allowed. Each target revision, quantization recipe,
projection/attention plan and head tie order defines its own reference. AR,
SD, serial SSD and parallel SSD must reproduce that reference's full greedy
sequence. Every measured repeat is checked. Different precisions never silently
share a speedup denominator. Same-backend agreement is not a task-quality test.

The quantized target uses the exact BF16 reconstruction of compressed weights
for common prefill and its materialized-control decoder. The compressed decoder
must match that control's corresponding logits exactly at widths1,K+1,8, not
just its first argmax. EOS, rejection, rollback, suffix adoption and unrelated
request reuse have dedicated gates. Independent original BF16 teacher-forced
distributions are saved separately. K's historical failed HF gates are unchanged.

## Implemented changes and why

| Component | Implementation | Expected mechanism; evidence boundary |
| --- | --- | --- |
| W8A16 | E4M3FN weight values, FP32 scales per128 K elements/output row | Approximately half the projection weight bytes, plus scales. Dequantization cost may erase the gain. |
| W4A16 | E2M1 nibbles, E4M3 scales per16 elements, one FP32 tensor scale | About one quarter of BF16 value bytes, plus scales/padding. Own even-K-low-nibble ABI; not native NVFP4 layout. |
| Low-M projections | Register dequantization before the same BF16 MMA/vector reduction; fixed K grouping and split order | Reuses the original arithmetic after reconstructing weights. No activation quantization and no native FP8/FP4 MMA claim. |
| Gate/up | Compressed projection with fused BF16-boundary SwiGLU output | Avoids materializing interleaved gate/up activations for unsplit MMA. Existing ordered split merge remains available. |
| Output/down | Compressed partials plus existing ordered residual/RMS fusion | Preserves three BF16 boundaries and split reduction order. |
| Parallel scout model | All forecast outcomes in one batched proposal graph | Reuses weight tiles across MMA branch rows; dependent depth remains sequential. No per-branch model loop. |
| Branch cache | Read-only shared main draft trunk plus private `[2,L,B,HK,K,D]` suffixes | Removes per-scout full-cache mirrors and prefix copies. One suffix-copy kernel adopts a successful branch. |
| Branch attention | Absolute-position RoPE, separately masked trunk/private loads, original physical split geometry/merge | Covers split-boundary addressing and poisoned future suffix tests. GPU exactness is pending. |
| Branch control | Fused seed/position preparation and fused batched draft transition; seed DMA staged before graph | Outcome and correction-token ID must both match before reuse. Missed/final wasted work is included in timing. |

Canonical BF16 weights are retained for prefill and independent dequantized
controls. Receipts count those bytes separately. These candidates reduce decode
weight traffic; they do not yet reduce total resident model memory. Quantization
setup is outside decode timing and explicitly reported. The head stays BF16.

Default K3/four scouts cover four accepted-length outcomes, with one correction
guess each. They are not eight distinct correction branches. The existing
serial SSD and default plans remain controls. An additional explicit provisional
`.5B branchM` plan uses MMA for all roles, including unsplit gate/up: the old
vector projections otherwise repeat weight reads per branch. Changing the draft
plan globally can affect acceptance and B1 draft latency, so it is a separately
labeled candidate, not an automatic dispatch by branch count.

## Trained drafter audit and remaining integration

Pinned `thoughtworks/Qwen2.5-7B-Instruct-Eagle3` at
`ff17dda64a036cf5bd7bc56c0ab728325f1c0d0b`. Downloaded only397-byte config,
1472-byte Safetensors header (plus8-byte length),128000-byte integer vocabulary
offsets and152064-byte boolean membership. No BF16 model tensor payload.
Exact hashes and HTTP206 byte ranges are saved under `research/eagle3-m`.

Two concrete integration traps were found:

- Actual config/tensor shapes require seven KV heads; the model card says four.
  Q/K/V consume7168-wide concatenated token/feature inputs, not ordinary3584-wide
  Qwen inputs. Feature projection consumes three3584-wide target streams.
- `d2t` contains offsets: target ID = draft ID + offset. Treating it as absolute
  IDs duplicates tokens. Actual integer/boolean payloads confirm the offset
  interpretation and increasing target-ID order for deterministic head ties.

The dedicated ABI validator checks shapes, dtypes, byte ranges, mapping and
feature packing. Feature-layer/token alignment, target capture, checkpoint
inference and SSD self-conditioning are still unfinished. No trained-draft
adapter or performance gain is claimed. Generic HF loading is insufficient.
Read scopes, the initially mismatched older `cnets1` architecture, and failed
documentation lookups are retained in R043-R048 and K135/K136.

## Validation and bounded execution

Local outcome:165 tests passed,15 CUDA modules skipped;135 Python files and22
shell scripts parse. Receipts are in `M_LOCAL_TESTS.xml` and `M_LOCAL_VALIDATION.json`.
Skipped CUDA modules do not count as GPU passes. The new two CUDA modules define
27 executed cases on a two-device system: compressed MMA/vector/fused outputs,
materialized control, width invariance, branch split boundaries through2048,
independent full-cache scouts, full acceptance/hits and disagreement/rejection,
AR/SD/serial-SSD/parallel-SSD full tokens, EOS, reuse and explicit graph closure.

`precision_batch.sh` provides separate bounded phases:

1. `gates`:27 real CUDA cases, then a tiny end-to-end worker and offline receipt
   audit. Only success produces `certified-gate.json`.
2. `micro-fp8`/`micro-w4`: paired projection-graph timings of realistic7B MLP
   shapes at M1/4, exact reconstructed-weight controls, alternating order and raw
   event samples. A512MiB eviction touch precedes samples outside their events;
   it is an eviction attempt, not a verified cold-cache/HBM or SOL measurement.
3. `bf16`/`fp8`/`w4`: pinned7B/.5B pair, B1 contexts128/2048,128 output tokens,
   three repeats of each method. Original BF16 distributions, all token lists,
   source/recipe identity, setup/memory costs and failure artifacts are saved.
   The final offline audit rejects missing rows, bad gates, stale source, edited
   tokens, inconsistent timings and incomplete cleanup. AR is labeled one
   participating GPU even though two devices are visible to the process.

Later phases require the exported genuine certificate placed at
`kernel_lab/cloud/m-cuda-gate.json` in a new immutable package. It must match all
active kernels/runtime/tests/worker/plans, cloud driver, metadata inputs,
Torch/Triton/CUDA versions and GPU capabilities. No certificate exists yet.
Cold compilation/allocation overhead belongs to setup, not a latency claim.

The workspace driver retains its60..660-second whole-job limit and bounded
cleanup/export. Worker completion never releases provider billing: export,
explicitly release immediately, and verify the provider's ended/meter-stopped
state after EACH allocation. A new allocation requires fresh admission, budget
and reliable release control. No node is requested by this preparation.

## Immediate decisions after execution

- First resolve any compile/exactness failures, preserving raw failures and
  source identity; do not weaken a gate to produce timing rows.
- Compare parallel versus serial SSD at the same precision/draft plan. Record
  useful emissions, cycle time, draft acceptance, exact scout hits and suffix
  payload, including wasted work. More scouts are not assumed faster.
- Compare compressed versus reconstructed BF16 projections and end-to-end AR.
  Reject compression where dequantization loses. Use the saved emitted code and
  a separate Nsight pass to inspect registers, stalls, occupancy and bandwidth;
  micro event timings alone cannot establish any of those counters.
- Only then test the global MMA draft plan, a qualified shallow drafter, or
  native FP8/FP4 execution. Native activation scaling must be row-independent
  or fixed-calibrated; it must not depend on other verification rows.

Budget is unchanged: authorized cap80USD, conservative reservation77.782034USD,
remaining2.217966USD. Last observed account credit28.64USD was below32USD B300
admission. The proposed90USD cap remains unanswered. These are historical
preflight values, not a fresh provider quote. M has spent no GPU compute.
