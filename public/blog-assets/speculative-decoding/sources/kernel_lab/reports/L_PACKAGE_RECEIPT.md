# L immutable source prepared; GPU retest awaits funding

Source commit `4d15ec2762629210e6b8830b566ef28b17b97d8d`, branch `kernel-sol`.
The source ZIP has 234 verified manifest files, 565,452 bytes, SHA256
`78dd7f89bfd0386a680895ee74723f4ed0cef757df38b2fa50296f640771b855`.
It is saved beside the repository as `ssd-kernel-source-lifecycleL-prepared.zip`.
The staging delta reuses K's exact ZIP from `/data/workspace/ssd-kernel-64129e54/source.zip`.
Its 234,651-byte paste script reconstructs the exact L ZIP; first and idempotent
second applications passed locally, including paths containing spaces.
[Verification](L_PACKAGE_LOCAL_VERIFICATION.json). L is **not uploaded**.

The incremental Git bundle `ssd-kernel-history-lifecycleL-incremental.bundle`
contains source head 4d15ec2 and the separate K results commit 61d4d3d; it requires
76955ca from the existing chain. Bundle verification passed. Later package and
billing receipt commits do not change the immutable L source ZIP.
[Package and hash metadata](L_PACKAGE_RECEIPT.json).

Local checks: 113 CPU passes, 13 skipped CUDA modules, 123 Python parses,
21 shell parses; source/baseline hashes preserved. L's CUDA compilation, TP2
normal exit and matched packing speed remain **unexecuted**. See
[implementation/plan](L_LIFECYCLE_AND_MATCHED_CONTROLS.md).

A fresh read-only Billing check shows $28.64 available, below $32 admission
by $3.36. It shows $76.36 monthly spend, $76.26 in the selected Oct15-21 window
and $6.05 monthly Marshall usage; these organization totals do not isolate K's
exact per-lease charge. Keep the conservative project reservation $77.782034
and remaining $2.217966 under the authorized $80 until reconciled. The proposed
$90 cap is **not yet authorized**. No node request, credit purchase, new Marshall
prompt or setting change was made. The ended K host must not be reused.
[Billing proof](../evidence/singleK-run-preflight/post-k-billing.png).
