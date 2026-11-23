# P005: corrected staging succeeded; GPU request did not start

Source87cea5d. Attempt`modal-qualification-20261028T033640Z`, app`ap-NhVlOZ7tU5ASjWId6T3Yu8`.

Cached dependency setup and runtime source mounts completed; local entrypoint reached the remote call. Repeated provider reads reported0tasks/no containers. No GPU-worker result or native gate receipt arrived before the650s outer deadline. The launcher interrupted Modal, explicitly stopped this app, and saved independent readbacks: stopped,0tasks,empty container list. Total launcher lifetime652.44s. Exact scheduler reason is unavailable; do not label this a numerical failure or claim confirmed capacity exhaustion.

Modal returned exit0 after handling the interrupt. This is not success. Added explicit `outer_timed_out`, `result_received`, and a status classifier to future launcher receipts, with tests. The historical raw receipt is preserved; `reviewed-outcome.json` records the corrected interpretation.

## Cost and accounting

The two prior closed apps have identical reported costs in successive reads:$0.00046083 and$0.00371217. Append-only billing reconciliation retains these charges plus$0.10pending-settlement reserve each. Original reservations and elapsed bounds remain available. Neither report is called an invoice-final settlement.

Latest billing report contains no row for P005. It is not replaced by an invented zero-cost receipt. Its conservative closed-time bound remains$2.35583333. Combined accounted reserve$2.56000633, remaining qualification allowance$0.43999367 of$3. Provider-reported total remains$0.004173, subject to reporting lag. User-confirmed$10available credits and$25overall Modal cap are unchanged; no purchase.

## Local progress

Prepared `provider_trained.py`: native gate before downloads, pinned model assets, unfused FP8 target/BF16 EAGLE, contexts128/512,128output tokens,5paired repetitions. Shared900s deadline; per-stage logs and failure receipts; process-group termination. No cloud allocation API and no GPU execution by default. Tests verify failed gates and expired budgets launch no downloads/model work.

Full local suite before the final timeout-classification test:293passed18skipped. Final focused registry/worker suite:20passed. These do not qualify CUDA, trained EAGLE or performance.

## Next decision

No automatic retry of the same unstarted B200 request. Beam remains without advertised B200 inventory. Asked the user whether to allow two supported B300s as a separately labeled hardware baseline under the same available-credit limit. No B300 allocation is authorized by silence; no request is queued. If staying on B200, retain source and wait for a new availability opportunity. Reconcile cost estimates before another normal-duration qualification run.
