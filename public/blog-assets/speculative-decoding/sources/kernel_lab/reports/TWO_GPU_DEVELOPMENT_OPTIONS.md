# Two-GPU development shortlist

Reviewed 2026-10-22 using official public pricing and architecture documentation.
Research only: no account, order, credentials, allocation, or performance test.

## Published on-demand starting prices

Bitdeer explicitly advertises these VM configurations and total hourly starting prices:

| Configuration | Whole VM advertised from USD/hour | Role |
| --- | ---: | --- |
| 2 x H100 SXM | 4.72 | Hopper runtime/reference development |
| 2 x H200 | 5.522 | Hopper development with more memory/bandwidth |
| 2 x B200 | 9.38 | Preferred current native Blackwell kernel qualification |

Sources: https://www.bitdeer.ai/en/services/virtual-machine and
https://www.bitdeer.ai/en/pricing/gpu-compute . The search-indexed official tables
contain the rows; direct fetched page text omitted dynamically populated rows.
These are advertised starting rates, not a verified live stock/checkout quote.
Minimum charging interval, storage/egress/tax, region, permissions and GPU topology
have not been established. A 30-minute compute-only estimate is 2.36, 2.761 or
4.69 USD respectively, conditional on fractional-hour billing with no larger minimum.
No claim of globally cheapest rental.

Hyperstack price multiplication was rejected as evidence of available two-GPU
SXM/Blackwell flavors. Its official current flavor catalog lists B200/H200/H100
SXM at eight GPUs, and the two-GPU H100 entry is PCIe. Do not quote two times a
per-GPU SXM rate as a purchasable two-GPU instance.
Sources: https://www.hyperstack.cloud/gpu-pricing and
https://docs.hyperstack.cloud/docs/hardware/flavors/ .

## Compatibility and recommendation

NVIDIA identifies B200 as CC10.0, B300 as CC10.3 and H100/H200 as CC9.0:
https://developer.nvidia.com/cuda/gpus . Local native_precision.py accepts only
SM100/103 with Triton3.7.0. Thus B200 matches the candidate architecture guard,
but requires fresh compilation, native instruction audits, numerical gates and
measurements; the existing B300 run does not qualify it automatically.
Hopper supports BF16/FP8 development, but cannot execute this tcgen05 native
Blackwell FP8/FP4 implementation. It requires an explicit separate backend and
worker. The current N6 native-gated worker cannot run unchanged on Hopper.

Prefer two B200s for the active native precision effort if the actual VM quote,
stock and interconnect are suitable. Prefer two H200s for a distinct lower-cost
Hopper runtime experiment if porting cost is justified. H200 is only 0.802 USD/hour
above the advertised H100 pair; no end-to-end speed advantage has been measured.
Do not claim any configuration guarantees the 1000 single-request tokens/sec goal.

Before an authorized order: verify two full GPUs on one host, P2P/NVLink topology,
SSH access, driver/container compatibility, Nsight permissions, exact billing and
termination API/support. At startup inspect nvidia-smi topo -m and P2P behavior.
Prepare source/assets before billing; batch bounded useful experiments, export
results, then terminate and verify billing/resource release independently of job
exit. Persistent storage may still incur charges. National Compute credits are
not assumed transferable; no new-provider spending has been committed.

## Alternative review 2026-10-27

Verda is a credible lower-cost interruptible candidate: official USD pricing lists
B200 at 3.60 USD/GPU-hour spot and supports 1/2/4/8-GPU instances; an estimated
two-GPU compute subtotal is 7.20 USD/hour, not a verified live two-GPU quote.
Its GPU-instances marketing page displays a different on-demand price than the
pricing page; use account-specific CLI/checkout pricing before selecting.
Official CLI supports availability, instance-type prices, SSH and deletion.
Spot can be evicted at any time without warning, including seconds after launch.
Use short restartable tests and persist each completed result; model reload/JIT
can negate savings. Storage is separate. Sources: https://verda.com/pricing ,
https://verda.com/gpu-instances , https://docs.verda.com/cli/instances/ ,
https://docs.verda.com/cpu-and-gpu-instances/set-up-a-gpu-instance/ .

Beam advertises one-B200 on-demand machines from4.11USD/hour including CPU/RAM,
but public pricing does not establish an equivalent same-host two-B200 offering.
Candidate for component tests only until topology/configuration is verified:
https://www.beam.cloud/pricing . Existing two-GPU gate needs a separately labeled
single-device component worker, not silently bypassed validation.

Other published comparisons: Runpod current product catalog B2007.99USD/GPU-hour
(older guide says6.79, use actual checkout); Lambda explicit two-B200 flavor
6.89USD/GPU-hour,13.78total. Neither establishes a cheaper native two-GPU option
than the existing Bitdeer from9.38total or Modal12.4992GPU-only comparison.
Vast public live-market article quotes cheapest B2007.50/GPU-hour with update age
86hours; no suitable same-host pair verified. Avoid presenting a single-card
marketplace minimum as a guaranteed pair. Sources: https://www.runpod.io/product/cloud-gpus ,
https://lambda.ai/instances , https://vast.ai/article/how-much-does-it-cost-to-rent-a-gpu-in-the-cloud-live-pricing-guide .

No account access, allocation, spend, kernel execution or benchmark gain.
