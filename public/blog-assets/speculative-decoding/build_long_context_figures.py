"""Add immutable P017/P018 evidence and figures. Reads Git only on first export."""
from pathlib import Path
import csv
import hashlib
import json
import subprocess
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent / 'ssd-performance-v2'
COMMIT = 'd97a5dc336d3dfec6befb6ec6d3d2a3dd592aaa8'
S = ROOT / 'sources-p017-p018'
F = ROOT / 'figures'
RUNS = ['modal-b300-long-context-20261028T220853Z', 'modal-b300-long-context-20261028T222504Z']
MERGE = 'kernel_lab/evidence/modal-b300-attention-20261028T224229Z'
manifest_path = ROOT / 'long-context-source-manifest.json'
paths = ['kernel_lab/reports/P017_LONG_CONTEXT_STRESS.md',
         'kernel_lab/reports/P018_ATTENTION_MERGE.md',
         'kernel_lab/reports/figures/p017-throughput.csv',
         'kernel_lab/benchmarks/analyze_long_context_p017.py',
         'kernel_lab/history/registry/p017-long-context-index.json',
         'kernel_lab/history/registry/p018-candidate-index.json',
         'kernel_lab/history/registry/p018-run-index.json',
         MERGE + '/downloaded/rows.json', MERGE + '/downloaded/completion.json']
existing = json.loads(manifest_path.read_text()) if manifest_path.exists() else None
if existing:
    assert existing['commit'] == COMMIT
    paths = [x['path'] for x in existing['files']]
else:
    for run in RUNS:
        base = 'kernel_lab/evidence/' + run
        paths += [base + '/' + x for x in ['analysis.json', 'app-after-refresh.json', 'container-after-refresh.json']]
        files = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', COMMIT,
            base + '/downloaded/payload/long-context'], cwd=REPO, text=True).splitlines()
        paths += [x for x in files if x.endswith('.json')]
    paths += ['kernel_lab/evidence/' + RUNS[1] + '/full-common-prefix.json']
records = []
for p in sorted(set(paths)):
    dst = S / p
    if existing:
        data = dst.read_bytes()
        record = next(x for x in existing['files'] if x['path'] == p)
        assert hashlib.sha256(data).hexdigest() == record['sha256'], p
    else:
        data = subprocess.check_output(['git', 'show', f'{COMMIT}:{p}'], cwd=REPO)
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(data)
    records.append({'path': p, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)})
manifest_path.write_text(json.dumps({'commit': COMMIT, 'cutoff': 'Completed P017/P018 only; no P019 results',
    'original_source_manifest_unchanged': 'source-manifest.json', 'files': records}, indent=2) + '\n')

analyses = []
all_tokens = []
for run in RUNS:
    base = S / 'kernel_lab/evidence' / run
    directory = base / 'downloaded/payload/long-context'
    contract = json.loads((directory / 'contract.json').read_text())
    result = json.loads((directory / 'result.json').read_text())
    analysis = json.loads((base / 'analysis.json').read_text())
    tokens = []
    windows = []
    for p in sorted(directory.glob('tokens-*.json')):
        row = json.loads(p.read_text())
        assert row['start_output'] == len(tokens)
        assert row['end_output'] == len(tokens) + len(row['tokens'])
        assert row['populated_kv_positions'] == contract['prompt_tokens'] - 1 + row['end_output']
        assert row['populated_kv_positions'] < contract['capacity']
        tokens.extend(row['tokens'])
        window = {k: v for k, v in row.items() if k != 'tokens'}
        window['decode_tps'] = len(row['tokens']) / row['window_s']
        windows.append(window)
    digest = hashlib.sha256(json.dumps(tokens, separators=(',', ':')).encode()).hexdigest()
    assert digest == result['tokens_sha256']
    assert windows == analysis['windows']
    assert len(tokens) == analysis['generated_tokens']
    assert (len(tokens) == contract['output_tokens']) == result['reached_requested_output']
    assert abs(result['stats']['decode_tps'] - len(tokens) / result['stats']['decode_s']) < 1e-9
    analyses.append(analysis)
    all_tokens.append(tokens)
assert len(all_tokens[0]) == 119968 and len(all_tokens[1]) == 128000
assert all_tokens[0] == all_tokens[1][:119968]
assert analyses[1]['reached_requested_output'] and analyses[1]['stop_reason'] == 'completed'

csv_rows = list(csv.DictReader((S / 'kernel_lab/reports/figures/p017-throughput.csv').open()))
for run, analysis in zip(RUNS, analyses):
    rows = [x for x in csv_rows if x['run'] == run]
    assert len(rows) == len(analysis['windows'])
    for row, window in zip(rows, analysis['windows']):
        assert int(row['end_output']) == window['end_output']
        assert abs(float(row['decode_tps']) - window['decode_tps']) < 1e-9

merge = json.loads((S / MERGE / 'downloaded/rows.json').read_text())
assert len(merge) == 18
assert sum(x['exact'] for x in merge) == 10
for row in merge:
    assert not row['promoted']
    if row['exact']:
        assert len(row['control_ms']) == len(row['candidate_ms']) == 7
        median = float(np.median(np.array(row['control_ms']) / row['candidate_ms']))
        assert abs(median - row['statistics']['median_speedup']) < 1e-12
    else:
        assert 'statistics' not in row and 'control_ms' not in row

plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10,
    'axes.spines.top': False, 'axes.spines.right': False, 'axes.titleweight': 'bold',
    'axes.labelcolor': '#d6d6d6', 'text.color': '#e5e5e5', 'axes.edgecolor': '#484848',
    'axes.facecolor': '#101010', 'figure.facecolor': '#101010', 'savefig.facecolor': '#101010',
    'xtick.color': '#bdbdbd', 'ytick.color': '#bdbdbd', 'svg.fonttype': 'none'})
GREEN = '#a9bda9'
TAN = '#bba997'
GRAY = '#777777'
def save(fig, name, note):
    fig.text(.06, .015, note, fontsize=8, color='#aaaaaa', va='bottom')
    fig.tight_layout(rect=(0, .12, 1, .96))
    fig.savefig(F / (name + '.png'), dpi=180)
    fig.savefig(F / (name + '.svg'))
    plt.close(fig)

fig, ax = plt.subplots(figsize=(9, 5.5))
for analysis, label, color, style in zip(analyses,
    ['Attempt 1: deadline at 119,968 outputs', 'Attempt 2: completed 128,000 outputs'],
    [GRAY, GREEN], ['--', '-']):
    windows = analysis['windows']
    ax.plot([x['end_output'] for x in windows], [x['decode_tps'] for x in windows],
        color=color, ls=style, lw=2, label=label)
ax.axhline(analyses[1]['stats']['decode_tps'], color=TAN, lw=1, ls=':', label='Completed-run average: 202.54')
ax.set(xlabel='Generated output tokens in one request', ylabel='Window throughput (tokens / second)',
    xlim=(0, 140000), ylim=(150, 250), xticks=[0, 32768, 65536, 98304, 128000],
    xticklabels=['0', '32,768', '65,536', '98,304', '128,000'],
    title='Full-history generation slows as the request grows')
ax.annotate('233.92', (1024, analyses[1]['windows'][0]['decode_tps']), xytext=(10, 6), textcoords='offset points', color=GREEN)
ax.annotate('174.70', (128000, analyses[1]['windows'][-1]['decode_tps']), xytext=(-5, -16),
    textcoords='offset points', ha='right', color=GREEN)
ax.legend(frameon=False, fontsize=8, loc='lower left')
save(fig, '08-long-context', 'P017 • Qwen2.5-7B FP8 projections, BF16 attention/KV, static YaRN 4, 131,072 slots, 128 input tokens.\nAR on one B300 of a two-GPU allocation; full KV retained. 1,024-output windows (attempt 1 ends with a partial window).\nIncludes checkpoint overhead; EOS ignored. One completed stress run, not a coherent-text or SD/SSD result.')

fig, axs = plt.subplots(1, 2, figsize=(10, 5.3), sharey=True)
for ax, capacity in zip(axs, [4096, 131072]):
    rows = [r for r in merge if r['capacity'] == capacity and r['position'] == 127]
    speed = np.array([r['statistics']['median_speedup'] for r in rows])
    low = np.array([r['statistics']['ci95'][0] for r in rows])
    high = np.array([r['statistics']['ci95'][1] for r in rows])
    bars = ax.bar(np.arange(3), speed, width=.6, color=[GREEN, TAN, GRAY])
    ax.errorbar(np.arange(3), speed, yerr=[speed-low, high-speed], fmt='none', color='#e5e5e5', capsize=3)
    ax.bar_label(bars, labels=[f'{x:.3f}×' for x in speed], padding=7, fontsize=10)
    ax.axhline(1, color=GRAY, ls=':', lw=1)
    ax.set(xticks=np.arange(3), xticklabels=['32 wide', '64 wide', '128 wide'],
        ylim=(0, 7.4), xlabel='Head-dimension tile', title=f'Capacity {capacity:,} / position 127')
axs[0].set_ylabel('Paired control time / candidate time')
fig.suptitle('A large short-position win, with a longer-context correctness failure', fontsize=12, y=.975)
save(fig, '09-attention-merge', 'P018 • Complete partial+merge attention, synthetic BF16 Q/K/V, B300, 7 interleaved pairs. Bars show exact cases at position 127.\n95% paired bootstrap intervals. 32/64-wide tiles fail exact equality at later positions and were not timed there.\nNo full-model result or default promotion. The 128-wide variant is a structural control, not the incumbent kernel.')

chart_path = ROOT / 'chart-data.json'
chart = json.loads(chart_path.read_text())
chart['p017'] = [{'run': run, **analysis} for run, analysis in zip(RUNS, analyses)]
chart['p018'] = merge
chart_path.write_text(json.dumps(chart, indent=2) + '\n')
receipt = {'source_snapshot': COMMIT, 'token_counts': [len(t) for t in all_tokens],
    'complete_common_prefix_checked': 119968, 'sequence_hashes_verified': True,
    'contiguous_checkpoints_and_cache_cursors_checked': True, 'window_csv_matches_raw_segments': True,
    'final_window_tokens_per_second': analyses[1]['windows'][-1]['decode_tps'],
    'p018_cases': 18, 'p018_exact': 10, 'p018_numerical_failures': 8,
    'p018_paired_medians_recomputed': 10, 'gpu_or_cloud_execution': False,
    'charts': ['08-long-context.png', '09-attention-merge.png']}
(ROOT / 'long-context-validation.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt))
