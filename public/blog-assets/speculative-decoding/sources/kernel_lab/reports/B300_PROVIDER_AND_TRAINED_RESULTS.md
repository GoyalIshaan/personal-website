# B300 provider results — P007 through P010

## Outcome

Modal supplied two NVIDIA B300 SXM6 AC GPUs. The unchanged N native gate passed28CUDA tests with0failures/0skips; all8FP8/FP4 PTX/IR instruction receipts were revalidated after download against the tested source manifest. This qualifies synthetic native primitives/model fixtures, not trained AR/SD/SSD speed or original-HF numerical equivalence.

Beam MCP reported0B300inventory; its on-demand CLI had no B300 offer. No Beam GPU was reserved. Its available1999cents does not increase the authorized spend. The user authorized the B300 fallback within the same10USD available-credit limit. Three dollars were reassigned from the existing Modal experimental allocation to B300 qualification; the overall25USD project cap was not increased. Launcher reservations additionally enforce10USD against all accounted Modal runs.

## Attempts and changes

| Experiment | Source | Result | Cleanup |
|---|---|---|---|
| P007 /040022Z |542c868|Remote startup reached, then IndexError at `/root/modal_qualification.py`: host path assumed two parent directories|Stopped,0tasks,no containers|
| P008 /040308Z |1f02411|28CUDA passes;8native receipts; archive SHA256 verified locally|Explicit stop, refreshed stopped/0tasks/no containers|
| P009 /040826Z |7044097|Remote cancellation before final archive; reason unspecified by Modal|Stop retried successfully; refreshed stopped/0tasks/no containers|
| P010 |Local preparation|Periodic bounded text snapshots and recovery from driver logs; no new paid execution|No allocation|

P007 correction uses explicit `/root/ssd` remotely and preserves repository discovery only on the host. Regression checks include Modal's actual flattened module path. Qualification now explicitly requires B200/SM100 or B300/SM103 as selected; it does not silently accept another architecture.

## P008 hardware and validation

- GPU0/GPU1:NVIDIA B300 SXM6 AC; capability10.3;287416123392bytes device memory each.
- PyTorch2.13.0a0+8145d630e8.nv26.06; CUDA13.3; Triton3.7.0; pinned NGC image unchanged.
- Bidirectional peer access and correct4MiBcopies passed. Seven host-synchronized samples each direction: median29.459µs GPU0→1 and34.869µs GPU1→0. This is a small copy smoke test, not peak link bandwidth.
- `nvidia-smi topo -m` returned255; NVLink topology is **not confirmed** by this run.
- Nsight Systems2026.3.1 and Nsight Compute2026.2 binaries exist. Counter/trace permissions are **not qualified**: the later probe batch did not export results.
- Worker elapsed51.03s; whole local launcher71.58s. No model inference tokens/sec measured.

Eight architecture-specific SM103 manifests, a synthetic recipe and immutable run record are in `history/registry/b300-qualified-candidate-index.json` and `b300-qualification-index.json`. The prepared SM100 records remain separate. No winner was promoted. CUBIN hashes were not captured; retained PTX/IR/resources are not mislabeled as executable binaries.

## Trained-run interruption and recovery work

P009 was intended to run native gates, bounded Nsight probes, pinned asset download/hash verification, then unfused FP8 target AR versus BF16 EAGLE SD at contexts128/512,128outputs and5repetitions. Modal reported cancellation “by user or a failure.” No corresponding user cancellation was observed here. No stage result archive returned, so neither successful asset loading nor model execution is claimed. Possible connection/platform interruption remains a hypothesis, not a diagnosed cause.

The old wrapper exported only at completion, losing intermediate files on this interruption. P010 now streams hash-checked chunks for JSON/JSONL/XML/log snapshots while the worker runs and reconstructs only complete snapshots into separate hash directories. Original logs and versions remain; incomplete snapshots never imply successful execution. Binary Nsight reports/PTX files still require the full archive. Full local suite:300passed18skipped before the final timeout regression; streaming-specific suite:3passed, including a real subprocess timeout with recovered partial evidence. This path is not yet GPU-tested. Snapshot instrumentation must be disclosed in timing comparisons.

The launcher observed87.67monotonic seconds while provider creation-to-stop times span about238seconds. This discrepancy is unresolved. The full4.85USD P009 reservation is retained rather than reducing it using the shorter local elapsed time.

## Spending and shutdown

Latest provider report:

| App | Reported USD |
|---|---:|
| First B200 setup |0.00046083|
| Second B200 setup |0.00371217|
| Failed B300 startup |0.08891387|
| Passed B300 native gate |0.25059329|
| Cancelled trained batch |0.51735238|
| Total |0.86103254|

These are provider-reported charges, not final invoices. Conservative accounted reservations total8.13750633USD, including unresolved B200 and trained-run bounds and prior settlement reserves. No further GPU batch is launched against the remaining conservative headroom until reconciliation. The B300 pair launch rate was rounded up to14.55USD/hour including2CPU cores and32GiB RAM from [Modal pricing](https://modal.com/pricing). No credits purchased.

All apps from this work are stopped; refreshed container list is empty. No standing Beam reservation, queued Modal request or persistent new model-cache volume remains. Existing earlier Beam CPU-VM disk retention is unchanged.

## Next

Reconcile the cancelled batch and validate streamed evidence recovery on a short bounded run. Then obtain the first complete trained AR/EAGLE numerical/acceptance/timing result. Only then prioritize kernel changes using actual full-model profiles. The1,000single-request tokens/sec objective remains unmet; synthetic correctness is not a speedup claim.
