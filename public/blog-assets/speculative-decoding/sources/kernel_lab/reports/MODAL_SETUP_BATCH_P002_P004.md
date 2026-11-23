# Modal setup batch P002–P004

User confirmed $10 remaining Modal credits and directed Modal-first development, with read-only Beam availability checks between batches. No credit purchase; overall authorized Modal cap remains$25.

## Executed and observed

| Attempt | Source | Result | Provider state |
|---|---|---|---|
| modal-qualification-20261028T031744Z | dae09b2 | Stopped image import after review found unguarded local environment/Git initialization | stopped,0tasks,0containers |
| modal-qualification-20261028T032038Z | 3278ca9 | Base/dependencies built; per-file COPY image layers too slow; stopped before GPU invocation | stopped,0tasks,0containers |

Neither attempt invoked the GPU qualification function or produced CUDA/tokens-per-second results. These are environment/setup experiments, not numerical or kernel performance failures. Full driver logs, independent app/container readbacks, launch receipts and budget events are retained under matching `kernel_lab/evidence` paths.

## Fixes

1. Guard host-only environment checks and Git enumeration with `modal.is_local()`. Simulated remote import passes without environment or Git.
2. Mount committed source at startup (`copy=False`) instead of generating one image layer per file. Exclude historical evidence, reports, results and history from uploads. Local and remote-mode object construction pass; GPU execution is still pending.
3. Add append-only reconciliation from original reservation to a conservative stopped elapsed-time bound, requiring successful stop plus independent stopped/zero-task/no-container receipts. Original reservation remains intact; no estimate is labeled a final invoice. Focused suite16passed.

The image-staging change follows the [official Modal image guide](https://modal.com/docs/guide/images), specifically startup file mounts and per-layer caching. No external kernel code copied. Base/dependency image cache reuse on the next run is expected, not yet measured.

## Costs and stopping

Latest provider billing report: first app$0.00046083; second$0.00371217; total$0.00417300 (about0.42US cents), subject to settlement. Conservative all-in elapsed bounds are$0.42833333+$2.35583333=$2.78416667. Those bounds deliberately overcount CPU setup at the planned two-GPU rate; they are not observed charges. Qualification allowance$3 leaves$0.21583333 under those bounds. Reconcile actual closed-app charges before another normal-duration qualification reservation; do not silently erase historical reservations or increase the authorized total.

Both apps are stopped and there are no containers. Source-stage CPU work and setup, rather than GPUs or model inference, consumed this batch. Beam B200 inventory was checked at the beginning and after the batch:0; no Beam GPU reserved.

## Next

Use the completed dependency image and runtime-mounted source for the next bounded two-B200 gate after qualification-cost reconciliation. Then execute trained gates and profiling. No further credit confirmation is needed: the user already supplied$10. Do not launch another slow image-build loop; retain failures and use the new staging path. No default kernel or performance claim is promoted.
