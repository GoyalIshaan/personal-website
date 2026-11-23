# Beam quickstart setup — 2026-10-27 Chicago

User authorized official installer, browser sign-in, exact app.py and execution.
Installed beam-client0.2.233 using official installer, restricted agent setup to
Codex. Browser OAuth completed; no user-pasted token. whoami confirms workspace
208770 (fee9f33e-9263-4efd-920e-c7b8dca003d3), credit.ok=true and2000c available
before and after (not a settled zero-cost receipt). No checkout initiated.

Exact source: /Users/ishaankundesu/Documents/Codex/2026-10-20/i-h/app.py .
First python app.py exited1 at Context Name prompt before any VM existed.
Installed VM SDK constructor context=None uses ServiceClient(None), whose
get_channel prompts rather than selecting saved default. Retried exact unchanged
file through subprocess python app.py with default context and saved OAuth
credential supplied locally on stdin; token never printed or put in argv/files.
Exit0, stdout includes Hello from your VM! followed by newline. No deployment URL
was printed by app.py. This is a CPU VM quickstart, not a GPU qualification.

Immediately stopped quickstart via beam vm stop. Stop and independent vm list
both report status=stopped, desired_state=stopped, auto_resume=false.
VM id vm-15c85dd879f270c0; created2026-10-28T02:32:12.204835937Z,
stopped updated2026-10-28T02:32:21.20418454Z. Defaults4vCPU/8GiB/50GiB; root
snapshot retained, storage charges not independently established. No serverless
deployments/containers existed at preflight; no positive warm/minimum settings.

MCP installer registers Codex successfully. Fresh local stdio MCP initialization
works and tools/list exposes116tools including whoami. Codex active tool catalog
did not hot reload and no host refresh tool is available in this session; a
Codex reconnect/restart is needed for native tool visibility. No claim that
registration alone refreshed this chat. Used CLI/SDK bridge for authorized work.

Read installed use-beam SKILL.md, references/setup.md and references/vms.md.
No GPU, Modal work, kernel benchmark or inference performance claim.
