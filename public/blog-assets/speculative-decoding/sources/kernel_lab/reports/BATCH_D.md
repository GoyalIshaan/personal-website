# B300 batch D: aborted model staging

Source `6be0027dcc340900f4018f42c9cba2a5f020e788`. This attempt produced **no CUDA test or generation measurement**. It is an infrastructure failure, not a measured kernel regression.

The wrapper started at 06:04:51 UTC on 2026-10-21; source verification passed. Image pull and model-cache upload began in parallel at 06:04:55 UTC. A read-only node probe showed only 674 MiB of the roughly 16 GB model cache staged after about two minutes. The bulk CPU-workspace-to-node SSH path would not fit this experiment's time budget. The official pinned container image did finish pulling, but no model tests started.

We interrupted setup and released the node at **06:07:27 UTC**, with `ended/released`, no active node, and meter stopped verified. The interrupt initially left seven CPU wrapper/transfer/tail processes alive. All were then inspected and terminated with scoped SIGTERM; none remained, no SIGKILL was required, and all files were preserved. The stopped process IDs are in the release receipt.

The exact persistent logs were archived and downloaded as an organization-only checkpoint. Archive SHA256: `c4c30e09c1361843ff99852b120b517c5995e8b9c299452c130dfe8b92c03eaf`. The source manifest, driver log, completed image-pull receipt and model-cache receipt are preserved under `kernel_lab/evidence/evalD-6be0027d/`.

The next source revision changes infrastructure only: fetch the same two public models directly from Hugging Face onto node NVMe, at the CPU receipt's immutable revision SHAs and exact filenames, then verify every file against the existing SHA256s. Download timeout is 220 seconds. The whole job is shortened to 660 seconds to leave additional export/release margin within the 15-minute lease cap. Explicit INT/TERM handling now forwards termination to the timeout supervisor and continues bounded export. Only the small compiled-cache archive crosses the workspace SSH link. No model code, numerical tolerance or chosen kernel plan is changed by this repair.

This next path is prepared, not proven executed. If direct download is also too slow, its timeout ends the batch and preserves the failure rather than consuming the remaining credit cap.
