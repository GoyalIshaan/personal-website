# J source uploaded and verified; GPU testing pending

The National Compute CPU terminal reported `SSD_STAGE_OK`, then independently
recomputed all208 manifest file hashes and the complete ZIP SHA256. The verifier
passed at2026-10-22T02:16:34.182019UTC, in
`/data/workspace/ssd-kernel-ccf686b5`.

| Item | Verified value |
| --- | --- |
| Source commit | `ccf686b56cdc695775b0d33b920d1787ee0e76e9` |
| ZIP bytes | 483436 |
| ZIP SHA256 | `fd009e8b49d427042ca453eaff24d0e709f7b3b5f93c0ea3bdf846e17f91fcfd` |
| Manifest files | 208 |
| GPU request | None |
| J CUDA compilation/execution | None |
| J performance measurements | None |

[CPU_STAGE_VERIFICATION.json](../evidence/throughputJ-preflight/CPU_STAGE_VERIFICATION.json)
was reconstructed from the complete JSON printed in the UI; it is not an API
response or a direct file download. Its source is the retained
[raw accessibility observation](../evidence/throughputJ-preflight/cpu-stage-verified.txt)
and [terminal screenshot](../evidence/throughputJ-preflight/cpu-stage-verified.jpg).
The verifier's command and successful output are visible in both. Remote
receipt metadata that says no GPU was requested is an operator annotation;
resource state is established separately by the
[Grid proof](../evidence/throughputJ-preflight/grid-no-node.jpg).

The latest Grid observation showed30.03USD in credits, no allocated nodes and
no waiting sessions. NVIDIA B300 costs32USD per whole eight-GPU node hour.
[National Compute's admission rule](https://docs.nationalcompute.com/public-research/#asking-marshall)
requires the first whole-node hour available before admission. The1.97USD
shortfall blocks this NVIDIA run even though the planned bounded run would
cost less. No request was attempted and no credits were purchased. The AMD
pool would require a separate ROCm port of the CUDA/NCCL experiment.

This later documentation receipt is not inside the immutable uploaded ZIP.
The original notebook, measured I source and previous kernel bodies are
preserved. [J preparation](BATCH_CONTEXT_TP2_J_PREPARATION.md) contains the
implemented code, shape grids, CPU receipts, limitations and next GPU gates.
The one-request1,000tokens/s target remains unachieved.
