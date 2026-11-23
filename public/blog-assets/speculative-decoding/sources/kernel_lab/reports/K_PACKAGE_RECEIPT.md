# K local package and staging state

Source commit `64129e5428cc559dd8ad9f1fff5c951eda25a311` is packaged in
`ssd-kernel-source-singleK-prepared.zip`: 516117bytes, SHA256
`fd85f59791e9c985ecf40ab7658bd2ab1f465a28c4088dad4b6955f57b2c5dda`. All218 manifest entries and the
base64 staging payload passed local verification. The source history bundle
is `ssd-kernel-history-singleK-incremental.bundle`, 1390610bytes,
SHA256 `f8eff1d9c74f32891f53c57e3956be48e6d3abeacbb7f382bc2f00df38a92451`. It requires J source
`ccf686b56cdc695775b0d33b920d1787ee0e76e9` and passed `git bundle verify`.

CPU source staging was attempted, but **no K success receipt was observed**.
The terminal still displayed the old J receipt; this is not K upload evidence.
A coordinate retry was rejected and a later observation showed Helium on a
different window. [Attempt record](../evidence/singleK-preflight/source-stage-attempt.json)
and raw UI text preserve this incomplete action. K must be restaged and its
218 hashes verified before executing it. Expected new directory:
`/data/workspace/ssd-kernel-64129e54`. Do not run the older J directory expecting the new K scope.

No GPU request or execution followed. Refreshed balance30.03USD remains below
B300's32USD first-hour admission threshold. No top-up or settings change was
made. Code,92CPU checks,117current Python parses,21shell parses and packaging
are complete within the requested hour; CUDA correctness and speed are pending.

The immutable source ZIP does not include this later package/staging receipt.
[Preparation report](SINGLE_REQUEST_FOCUS_K_PREPARATION.md) describes the active
small-batch scope, single-request priority, kernel candidate and limitations.
