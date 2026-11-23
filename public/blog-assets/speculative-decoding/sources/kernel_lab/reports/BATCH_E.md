# B300 batch E: fast staging and a foreign-device RoPE failure

Source `22a40f3162d0607d5b66425e81c3a7c044dd462f`. The run stopped before pretrained throughput. Two selected-plan tests passed; one failed during GPU 1 model construction. Raw logs, JUnit, environment, model receipts and compiled artifacts are retained. Archive SHA256: `2f81a2ed4d53fb0627bd902644bee49dcd9977a0ff886421bb6cd94585950070`.

The repaired public-Hub route downloaded the 7B assets in 13.590 seconds and the 0.5B assets in 4.473 seconds. Download plus verification took 28.461 seconds. All 18 files, totaling 16,242,374,515 bytes, matched the immutable CPU receipt SHA256s. The previous slow SSH model upload is removed; only the small source and compiler archives cross that link.

Both selected plans passed the independent tiny-HF numerical checks, exact first-row logits across widths 1/3/8, and AR chunk 1 versus chunk 8. The third test stopped while constructing a draft model on GPU 1 with GPU 0 current. The traceback is inside HF's RoPE call to PyTorch's native outer-product BMM Triton kernel, not an assertion comparing token sequences or distributions. The exception is `Pointer argument cannot be accessed from Triton (cpu tensor?)`.

The [upstream source at the exact torch commit](https://github.com/pytorch/pytorch/blob/8145d630e8/torch/_native/ops/bmm_outer_product/triton_kernels.py) allocates on the input device but launches its Triton kernel without a device context. The observed wrong-current-device setup is consistent with that missing guard. This diagnosis is supported by the traceback and source; the repair still needs its CUDA rerun. A separate upstream mixed CPU/CUDA-input issue exists, but that is not proof of the same failure here.

The prepared repair explicitly guards static HF RoPE table construction and the new backend's diagnostic/dense entry points by the owned tensor device. A context-only wrapper calls the original HF RoPE implementation for both the independent oracle and the preserved v2 baseline. It changes no arithmetic and leaves root baseline files byte-identical. Two regression cases use capacities 128 and 256 with GPU 0 current and tensors on GPU 1, including current-device restoration and an independent HF comparison. The next batch reruns the entire correctness suite before downloading full models or timing anything.

Export completed at 06:19:39 UTC, and release was verified at **06:20:05 UTC** on 2026-10-21. The lease is ended/released, no node is active and the meter is stopped. The 26-second export-to-release interval is recorded. New pretrained throughput remains unmeasured.

A separate K/B and AR-chunk calibration runner is now prepared. It freezes family winners on calibration before consuming verification/reserved prompts and adds actual EOS and a 1,089-token prefix. It has not been CUDA-executed and is not part of batch E's results.
