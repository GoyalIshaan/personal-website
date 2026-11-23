# National Compute access options

Verified against official documentation2026-10-22. Public docs/local source
inspection only; no credentials minted/transferred, MCP connection installed,
SSH access changed or compute requested.

Our current product is Public Research. Its official documentation says there
is no REST route or MCP tool for a node request, and requests and releases pass
through Marshall confirmation cards. A job ending or an SSH timeout does not
release the lease. A local CLI must not pretend it can implement that release.

Once granted, a node is reached with ordinary SSH on its public address. The
platform puts Marshall's key on the workspace disk and pins the node host key.
Our workspace_e2e.sh already performs source transfer, Docker execution and
export through SSH/SCP, but we currently drive that runner through a browser
terminal. Direct SSH from this Mac has not been validated. Authorized local
SSH access would move command execution, logs and SCP/rsync transfers out of
browser control; credential setup is a separate step, not done by this review.

National Compute also offers official REST APIs (org bearer token) and a hosted
MCP endpoint https://nationalcompute.com/mcp (OAuth sign-in). MCP exposes billing,
market/cluster reads and supported VM/Kubernetes capacity controls. It is not
currently connected in this agent's available tool catalog. Public Research
lease lifecycle is not unlocked by connecting MCP or minting a generic token.
API-managed VM/Kubernetes capacity is a different product; eligibility, rates
and applicability of this account's credits need checking before switching.

Recommended interface: direct authorized SSH for code/profiling/files, official
MCP for supported structured reads/control, Marshall only for required Public
Research lifecycle actions. A fully API-driven lifecycle would require a
supported API-managed cluster or a future provider change. No undocumented
console endpoints or browser cookie extraction are part of this plan.

Sources:
- https://docs.nationalcompute.com/public-research/ (request/release and SSH)
- https://docs.nationalcompute.com/api/mcp/ (endpoint, OAuth and tool catalog)
- https://docs.nationalcompute.com/authentication/ (org token and cluster binding)
- https://docs.nationalcompute.com/api/ (REST conventions and OpenAPI contracts)
