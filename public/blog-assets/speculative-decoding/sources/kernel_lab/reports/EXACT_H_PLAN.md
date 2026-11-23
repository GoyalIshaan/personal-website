# H: exact-output schedule eligibility and bounded draft-budget tuning

G's full plan is rejected: faster timings changed the target sequence and
increased independent HF error. H preserves BK128, split4 and stages3. Only
BN32/two-warps versus the T4 control is eligible, separately for QKV/output/down.

Before timing, compare BF16 bits for biased QKV and complete projection+residual+
RMS outputs on two seeds at widths1/3/8 and actual7B geometries. Any mismatching
role falls back to control. Only exact, complete q1/q3 timing pairs may replace
a role. No automatic promotion; defaults and existing JIT bodies remain intact.

After selection, a fresh independent-HF model is captured before packing. The
same packed weights evaluate control/selected logits at all forced checkpoints.
Require exact BF16 bits and width invariance; independent HF failures remain
visible and unchanged. Native AR/SD/SSD and cross-control complete sequences
must also match before an eligible timing comparison.

Keep draft frozen. Separately test K3/K4 SSD and K3 SD only after tiny two-GPU
runtime/reuse gates. Select K on calibration performance with the target plan
fixed. If budget allows, freeze that selection and compare it to K2 on the
reserved prompts in fresh processes. Reserved results never choose K or tiles.
Any uncompleted row remains excluded. This is an engineering study, not a
claim that the independent-HF distribution issue or hardware SOL is solved.

Budget60USD total. F is settled. G is released; earliest-minute-to-exact-release
rounded up to478s bounds its total at4.248889USD, replacing the live14minute
reserve. Pre-G settled47.755534 plus this bound leaves7.995577. H may reserve
at most7.466667USD (840s at32USD/node-hour), with600s whole setup/work,<=90s
export and150s control margin. Project worst-case total59.471090, below60.
No topups, held requests or billing/security/clock changes. Stage/verify first,
export/release immediately after the bounded batch, then download/analysis.
