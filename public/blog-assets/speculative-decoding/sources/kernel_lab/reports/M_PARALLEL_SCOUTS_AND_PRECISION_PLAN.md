# M: parallel scouts and explicitly qualified lower precision

User authorization: precision changes are acceptable provided AR, SD and SSD
produce the same complete greedy output for the same target configuration.
This supersedes requiring a new quantized target to reproduce BF16 logits.
Historical BF16 failures/results are unchanged. Quantized-target quality against
BF16 remains a separate, explicitly recorded evaluation, not an exactness claim.
No additional GPU spend is authorized by this precision instruction.

## Contract recorded before implementation

- Identify target/draft revisions, weight formats, dequantization/activation
  rounding, attention schedule, head tie order, tokenizer and EOS in receipts.
  AR/SD/SSD compare within ONE such target identity. Different precisions never
  share a speedup denominator without an explicit cross-precision label.
- Hard gates: finite primitives; independent format/dequantization references;
  exact logits at corresponding teacher-forced positions across query widths;
  exact complete greedy AR/SD/SSD tokens, EOS, rejection, rollback, scout hits,
  misses and unrelated-request reuse. Every timed row is checked against AR.
- Fixed quantization boundaries cannot depend on other query rows. In
  particular, do not use a dynamic activation maximum over an entire varying
  verification block. A single dtype label cannot establish operation identity.
- Preserve independent numerical/quality comparisons to BF16 in a separate
  field. Same-backend agreement does not prove general model quality. Old
  strict BF16 qualification and archives stay readable and unchanged.

## Implementation sequence

1. Deterministic FP8 E4M3 weight-only and packed E2M1 block16 weight formats,
   CPU references and compact storage receipts. Quantize once before graphs.
   Dequantized BF16 weights define common prefill/reference values; decode
   dequantizes tiles inside projection kernels. Label W8A16/W4A16 honestly:
   these are not native W8A8/W4A4 tensor-core execution.
2. Low-M compressed-weight projection kernels with fixed K grouping and BF16
   arithmetic boundaries, fused gate/up output and existing ordered residual/
   RMS merge. Compare against materialized dequantized weights with identical
   plans. Native FP8/NVFP4 paths remain separate candidates with explicit
   activation calibration/rounding contracts; do not silently select a vendor
   kernel that changes arithmetic with query width.
3. One-request branch-batched SSD: shared verified trunk, private branch
   suffixes, branch-aware RoPE/GQA, one graph for parallel scout proposals,
   exact outcome/seed validation and bounded suffix adoption. Start K3 with
   four outcome slots. More correction-token fan-out is a distinct extension;
   four rejection-position choices do not establish eight distinct outcomes.
4. Pin and inspect a trained Qwen2.5 EAGLE-3 candidate; define the target-layer
   feature/vocabulary interface before adapter work. Its weights and published
   acceptance do not establish compatibility or a speedup. Fresh target features
   are unavailable during overlapping SSD, so self-conditioning must be tested.
5. Prepare bounded end-to-end comparisons for BF16/W8A16/W4A16, old SD/SSD and
   branch-batched SSD, short/medium contexts and B1 first. CPU/static and actual
   CUDA/full-model validation remain distinct. No default is promoted by code
   preparation. Work and failed hypotheses continue in the append-only journal.

The project cap stays $80; the proposed $90 cap and account admission funding
remain pending. K is ended/released. No node is requested by this preparation.
