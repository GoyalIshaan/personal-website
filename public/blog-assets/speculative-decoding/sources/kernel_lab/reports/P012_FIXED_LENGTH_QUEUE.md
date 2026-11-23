# P012: fixed-length AR queue candidate

Parent: f0a958a; opt-in runtime change, not promoted. No GPU performance result yet.

Observed code: ARDecoder stages/reads a pinned CPU packet after every graph chunk even without EOS. For fixed output length, the number of chunks is known. Candidate queues ceil(output/chunk) graph replays, reads one final packet, checks final count, then synchronizes. GPU ar_step still enforces the output cap; partial-chunk wasted forwards remain counted. EOS retains incumbent behavior. No precision/kernel arithmetic change.

Eight CPU scheduler cases cover counts1/17/32/35, EOS, partial chunks and reuse. GPU tiny-model tests cover graph/eager modes and full token equivalence; unexecuted locally. Trained harness --compare-fixed-queue adds complete-output/reuse gates and interleaved five-repeat comparison on the same model/allocation. No throughput claim until measured.

P011 profiler finding: Nsight Compute returned9 because GPU clock locking failed. Prepared retry uses --clock-control none; this does not establish counter access and clocks remain uncontrolled. Nsight Systems smoke returned0. Final model timings are unprofiled.

Research: NVIDIA Nsight Compute Profiling Guide, https://docs.nvidia.com/nsight-compute/ProfilingGuide/ (read clock-control search excerpt, 2026-10-28). Adopted documented disabling of tool clock control after matching runtime error. No implementation copied; no license-bearing code adapted.
