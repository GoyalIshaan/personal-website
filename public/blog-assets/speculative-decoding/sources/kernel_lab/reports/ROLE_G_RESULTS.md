# G: faster role schedules rejected for changing target outputs

Executed source05a53cfce07041e99927fc20c543bc30d79aba55; all133 source hashes
verified.106 baseline checks pass34.568s;15 new checks pass17.710s.36 matrix
cases and8 fresh-process jobs complete,32 timed rows. Every method matches its
own native AR, but the selected target differs from the control native AR.
**The full selected plan is rejected as a preserved-output optimization.**

Mean q1/q3 role timing selects QKV BN32/S8/2warps8.313us, output BN32/S4/2warps
10.032us, down BN64/S8/4warps28.459us. Transposed4 controls are9.031/10.247/
29.843us. Narrowing and K splits help different roles differently. The2-stage
control loses badly, including down44.552us; all losing rows are retained.

| Diagnostic only | Control | Selected, rejected | Separate draft hybrid |
| --- | ---: | ---: | ---: |
| AR tok/s | 319.486 | 325.498 | - |
| SD tok/s | 426.323 | 439.001 | 437.785 |
| SSD tok/s | 534.654 | 552.119 | 546.651 |

Same7B/0.5B,256capacity,E attention,T4 gate/head,K2/B1,96-output cap,2 prompts
times2repeats. Target-only comparison keeps draft frozen. Accepted/proposed
changes224/336→220/332; SSD hits/lookups80/164→80/162. Hybrid changes draft
gate/head separately and does not improve E2E here. These differences and the
target sequence change prevent calling the numbers a pure kernel speedup.

Target maxHF TV worsens.02457046→.03046004; audited target top1 values still
match, which does not excuse later sequence divergence. Draft maxTV.04666274,
one top1 mismatch. Independent HF thresholds remain unchanged. No full plan or
hybrid is promoted, and552tok/s is not an accepted headline result.

K split grouping changes FP32 accumulation order before BF16 rounding. The
next hypothesis preserves BK128/S4/stages3, tests only narrower tiles and warp
layout with an exact BF16-bit gate, and falls back per role on any mismatch.
Pretrained logits and complete generated sequences must then match the control.
This prevents tuning a speed number by silently changing the target arithmetic.

Original notebook, frozen root and every JIT kernel body remain unchanged.
Optional per-role plan overrides preserve old JSON behavior and are opt-in.
Full raw artifacts, binaries with constexpr identity, samples and gates are in
`../evidence/roleG-05a53cfc/`; tables are in roleG-generation.csv and
roleG-matrix-rankings.csv. Existing source archives preserve each implementation.

Launch23:11:46UTC; baseline23:14:20; candidate gates23:14:58; downloads23:15:18;
suite23:15:51; finished23:18:21; outer0/export0. Released23:18:57UTC, before
23:25 ceiling. No active GPU/pending request; meter stopped/watch disarmed.
Download/analysis followed release.32,150,749-byte archive SHA256
5286daec53cd7fb2912ae177de2437bc0f37b0d2a7e4ac5423c9737f71042c96 matches.
Organization-only checkpoint8e12c41b-89e9-430a-9169-6b511f7d10d6.

Read-only reconciliation: F settled5.934409USD. G exact lease interval
23:11:12.190–23:18:57.719UTC,465.529s, implies4.138035USD; only2.209164 was
posted when read. Expected project spend51.893569 and remaining8.106431 are
not final settled totals. An earliest-minute, rounded-up478s G bound costs
at most4.248889USD, leaving7.995577 conservatively after settled pre-G47.755534.
That tighter ended-lease bound can replace the earlier7.466667 live-run reserve;
it is based on the release record and verified32USD/hour rate, not the account
balance. All observations and corrections are retained in the budget journal.
