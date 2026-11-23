# K funded-run control checkpoint

Recorded 2026-10-22, 03:23 UTC. Source remains immutable commit
`64129e5428cc559dd8ad9f1fff5c951eda25a311`.

The user added credits and authorized running the prepared single-request
tests with immediate node release. Billing showed 35.03 USD at 03:13 UTC,
including a user-funded 5 USD deposit. The prior balance blocker is resolved;
the 80 USD project spending cap has not changed.

The local ZIP and all 218 manifest entries were reverified. The prepared run
selects six B1 full-model cases: one-GPU AR control, two-GPU TP AR control and
two-GPU packed gate/up candidate, each at input lengths 128 and 2048. Numerical
checks precede timings; the independent HF audit thresholds stay unchanged.
No K CUDA compilation, GPU test or timing has executed.

The user manually exposed the Marshall CPU terminal. Its `/data/workspace`
prompt was observed, and the pane maximized. A `pwd` input attempt was rejected
with `The user changed Helium`; no command output was confirmed. Further
Window-menu clicks were rejected despite fresh observations and an explicit
AX Raise focus action. Native read-only observations worked, but Helium showed
a different window. Both browser-extension tab inventories had separately
timed out. These are observed control failures; their cause is unresolved.

No GPU was requested or allocated by the agent for J or K. Current provider
resource state was not reverified during this incident, so a CPU prompt is
not proof of no active leases. There is no new GPU compute charge attributable
to this attempt, and no new performance result. Earlier I results remain the
last measured results and retain their diagnostic numerical qualification.

Before allocation, restore reliable Helium input, stage K in
`/data/workspace/ssd-kernel-64129e54`, verify the complete source manifest and
ZIP hash there, and recheck the provider quote/resource state. A successful
run must export to CPU workspace, explicitly release the provider node and
retain an observable ended/no-pending receipt. Work is capped at 600 seconds,
stop/export at 90 seconds, with an 840-second allocation deadline at the last
32 USD/hour quote (7.466667 USD planned ceiling). This timeout does not itself
release the lease. No follow-up request is queued or armed by this agent.

Evidence is under `kernel_lab/evidence/singleK-run-preflight/`. Events
K118–K121 retain the funded resumption, restored readings, manual terminal
recovery and unsuccessful focus/input checks. The old credit-blocked and
source-staging checkpoints remain historical records.

At 03:24–03:30 UTC, after the user confirmed Helium would stay unused, a clean
CPU terminal executed `pwd` and printed `/data/workspace`. The full K source
paste then produced no visible stage marker. Later small paste/key tests
produced no confirmed shell output, including on a replacement terminal.
A coordinate attempt failed with `windowNotFoundAtPosition`, and rebinding
the controller did not restore typing. Accessibility and pixel state briefly
differed, then converged on the replacement pane. A direct AX value set showed
`pwd` in the textarea without confirmed shell execution. Browser navigation
still worked, but Grid refresh left the page body blank. The cause is
unresolved; the user was asked whether manual page/terminal operation works.
No GPU was requested or tested. K122 records this later diagnostic sequence.

An alternative CPU-only transport is now prepared with
`kernel_lab/cloud/prepare_stage_delta.py`. It reuses 348,959 bytes from the
hash-checked J ZIP and reconstructs the exact immutable K ZIP. The compressed
delta is 159,327 bytes and the generated shell text is 217,821 bytes. Local
execution verified the exact final ZIP and all 218 files on both initial and
idempotent second application. The applier rejects a mismatched base, wire or
target hash and refuses to overwrite conflicting staged source files. This
workaround has not been executed remotely. It does not change any K kernel,
source archive, numerical threshold or performance claim. Its local receipt
is `K_DELTA_TRANSPORT_LOCAL_VERIFICATION.json`.
