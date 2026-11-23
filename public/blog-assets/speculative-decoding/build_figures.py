"""Read-only source snapshot and reproducible publication figures. No GPU/cloud calls."""
from pathlib import Path
import csv, hashlib, json, subprocess
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent
REPO = OUT.parent / 'ssd-performance-v2'
COMMIT = '6d887df71c2b3c68e90c99f69f2688dc12de2768'
S = OUT / 'sources'; S.mkdir(exist_ok=True)
F = OUT / 'figures'; F.mkdir(exist_ok=True)
paths = ['history/PROJECT_HISTORY.md', 'analysis/REPORT.md', 'analysis/primary-summary.json',
         'research/NUMERICS_AND_RUNTIME.md', 'kernel_lab/reports/WORK_REPORT.md',
         'kernel_lab/reports/READING_LOG.md', 'kernel_lab/reports/EXPERIMENT_COMPARISON.md',
         'kernel_lab/history/events.jsonl', 'kernel_lab/history/research.jsonl']
paths += [str(x.relative_to(REPO)) for x in (REPO/'kernel_lab/reports').glob('*.md')]
paths += ['kernel_lab/reports/fusionD-attention-pairs.csv', 'kernel_lab/reports/directE-attention-pairs.csv',
          'kernel_lab/evidence/modal-b300-trained-20261028T212626Z/paired-full-model-analysis.json']
prefix='kernel_lab/evidence/modal-b300-trained-20261028T212626Z/downloaded/payload/trained-fp8-bf16/'
paths += [prefix+x for x in ['rows.jsonl','gates.json','completion.json','separate-bf16-comparison.json','inputs.json','metadata.json']]
manifest=[]
existing = json.loads((OUT/'source-manifest.json').read_text()) if (OUT/'source-manifest.json').exists() else None
if existing:
    assert existing['commit'] == COMMIT
    paths = [x['path'] for x in existing['files']]
for p in sorted(set(paths)):
    target=S/p
    if existing:
        data = target.read_bytes()
        expected = next(x for x in existing['files'] if x['path']==p)
        assert hashlib.sha256(data).hexdigest()==expected['sha256'], p
    else:
        r=subprocess.run(['git','show',f'{COMMIT}:{p}'],cwd=REPO,capture_output=True)
        if r.returncode: raise RuntimeError('Missing committed source: '+p)
        data=r.stdout; target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(data)
    manifest.append({'path':p,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
(OUT/'source-manifest.json').write_text(json.dumps({'commit':COMMIT,'cutoff':'2026-10-28; through P016 and budget authorization only','files':manifest},indent=2))

plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,
 'axes.spines.right':False,'axes.titleweight':'bold','axes.labelcolor':'#d6d6d6',
 'text.color':'#e5e5e5','axes.edgecolor':'#484848','axes.facecolor':'#101010','figure.facecolor':'#101010','savefig.facecolor':'#101010','xtick.color':'#bdbdbd','ytick.color':'#bdbdbd',
 'svg.fonttype':'none'})
BLUE='#bba997'; GREEN='#a9bda9'; RED='#ca9788'; GRAY='#777777'; GOLD='#c3b898'
def save(fig,name,note):
    fig.text(.06,.015,note,fontsize=8,color='#aaaaaa',va='bottom')
    fig.tight_layout(rect=(0,.085,1,.96))
    fig.savefig(F/(name+'.png'),dpi=180)
    fig.savefig(F/(name+'.svg'))
    plt.close(fig)
def labels(ax,bars,fmt='{:.1f}'):
    ax.bar_label(bars,labels=[fmt.format(x.get_height()) for x in bars],padding=3,fontsize=9)

# Historical matched intervention; reported aggregate values, no invented uncertainty.
fig,ax=plt.subplots(figsize=(8,4.6));x=np.arange(2)
labels(ax,ax.bar(x-.18,[60.96,46.21],.36,color=GRAY,label='Eager'))
labels(ax,ax.bar(x+.18,[108.89,127.95],.36,color=GREEN,label='CUDA graphs'))
ax.set(xticks=x,xticklabels=['AR','SD'],ylabel='Decode tokens / second',ylim=(0,155),
 title='Graphs changed the economics of speculation')
ax.legend(frameon=False)
save(fig,'01-graphs','E018 • 7B/0.5B, H100, BF16 static-cache backend. SD matched shape-8 reference; native AR equality only 6/18.\nHistorical diagnostic ablation; not an exact-native-output speedup claim. Source: PROJECT_HISTORY, E018.')

historical=json.loads((S/'analysis/primary-summary.json').read_text())
fig,axs=plt.subplots(1,3,figsize=(12,4.8))
for ax,r in zip(axs,historical):
    vals=[r['methods'][m]['e2e_tps'] for m in ['ar_native','sd_colocated','sd','ssd']]
    labels(ax,ax.bar(np.arange(4),vals,color=[GRAY,BLUE,BLUE,GREEN]))
    ax.set(xticks=np.arange(4),xticklabels=['AR1','SD1','SD2','SSD2'],ylim=(0,max(vals)*1.23),title=r['model'].split('-')[1]+' / '+r['backend'])
axs[0].set_ylabel('Warm request tokens / second')
save(fig,'02-h100-release','H100 release • 8 regression prompts × 3 repeats, up to 192 output tokens, EOS enabled. Ratios of total tokens/time.\nSame-backend greedy equality; no cross-backend identity or production-engine comparison. Source: analysis/primary-summary.json.')

fig,axs=plt.subplots(1,2,figsize=(11,4.8))
for ax,filename,col,title in [(axs[0],'fusionD-attention-pairs.csv','fused_us','D: broad RoPE/cache/attention fusion'),(axs[1],'directE-attention-pairs.csv','direct_us','E: direct output for one physical split')]:
    rows=list(csv.DictReader((S/'kernel_lab/reports'/filename).open()))
    vals=[100*(float(r['baseline_us'])/float(r[col])-1) for r in rows]
    ax.bar(np.arange(16),vals,color=[GREEN if v>0 else RED for v in vals]);ax.axhline(0,color='#aaaaaa',lw=.8)
    ax.set(title=title,xlabel='Recorded case index (0–15)',xticks=[0,4,8,12,15],ylim=(-40,40))
axs[0].set_ylabel('Boundary throughput change (%)')
save(fig,'03-fusion','Separate allocations; each candidate is compared with its own matched control. 5 paired timing samples/case.\nD loses 14/16; E helps its 8 single-split cases, with unchanged multi-split controls. These are microbenchmarks.')

projection=[('P013 gate/up: 1 stage',.707),('P013 gate/up: fused pack, 2 stages',.952),('P013 gate/up: fused pack, 1 stage',.687),
 ('P013 down: 1 stage',.671),('P013 down: fused pack, 2 stages',.721),('P013 down: fused pack, 1 stage',.512),
 ('P015 gate/up: 3 stages, BN128/BK256',1.3338),('P015 down: 3 stages, BN64/BK128',1.5971)]
fig,ax=plt.subplots(figsize=(10,5.4));y=np.arange(len(projection))
ax.barh(y,[x[1] for x in projection],color=[GREEN if x[1]>1 else RED for x in projection])
ax.axvline(1,color='#aaaaaa',lw=1);ax.set(yticks=y,yticklabels=[x[0] for x in projection],xlim=(0,1.85),xlabel='Control time / candidate time (higher is better)',title='Packing fusion lost; deeper projection pipelines won')
for i,(_,v) in enumerate(projection):ax.text(v+.02,i,f'{v:.3f}×',va='center',fontsize=9)
ax.invert_yaxis()
save(fig,'04-projection-search','B300, trained first-layer weight boundaries including packing; 7 paired samples. Selected P015 winners only.\nThree additional P015 down/BK256 candidates failed exact-output checks and are excluded, not assigned zero speed.')

paired=json.loads((S/'kernel_lab/evidence/modal-b300-trained-20261028T212626Z/paired-full-model-analysis.json').read_text())
raw=[json.loads(x) for x in (S/prefix/'rows.jsonl').read_text().splitlines()]
assert len(raw)==80
assert all(x['complete_tokens_match_ar'] for x in raw)
gates=json.loads((S/prefix/'gates.json').read_text());assert len(gates)==161 and all(x['passed'] for x in gates)
fig,axs=plt.subplots(1,2,figsize=(12,5))
for ax,c in zip(axs,[128,512]):
    rows=[r for r in paired if r['context']==c];x=np.arange(4)
    labels(ax,ax.bar(x-.25,[r['control_decode_tps'] for r in rows],.25,color=GRAY,label='Incumbent decode'),'{:.0f}')
    labels(ax,ax.bar(x,[r['candidate_decode_tps'] for r in rows],.25,color=GREEN,label='Optimized decode'),'{:.0f}')
    labels(ax,ax.bar(x+.25,[r['candidate_return_tps'] for r in rows],.25,color=BLUE,label='Optimized request'),'{:.0f}')
    ax.set(xticks=x,xticklabels=['AR','SD K2','SD K3','SD K4'],ylim=(0,800),title=f'{c} input tokens / '+('code' if c==128 else 'prose'))
axs[0].set_ylabel('Single-request tokens / second');axs[0].legend(fontsize=8,frameon=False)
save(fig,'05-latest-model','P016 • Qwen2.5-7B native FP8 projections, BF16 EAGLE/attention/head/KV. 2×B300; AR uses 1 GPU.\n128 outputs, 5 repeats. Two development prompts differ in task and length. Synchronous SD, not trained SSD.')

fig,ax=plt.subplots(figsize=(9,5));y=np.arange(8)
v=np.array([r['statistics']['median_speedup'] for r in paired]);lo=np.array([r['statistics']['ci95'][0] for r in paired]);hi=np.array([r['statistics']['ci95'][1] for r in paired])
ax.errorbar((v-1)*100,y,xerr=np.array([v-lo,hi-v])*100,fmt='o',color=GREEN,capsize=4)
ax.axvline(3,color=GRAY,ls='--',label='3% runtime promotion threshold')
ax.set(yticks=y,yticklabels=[str(r['context'])+' / '+r['method'] for r in paired],xlim=(0,24),xlabel='Median paired decode speedup (%)',title='Measured full-model benefit: roughly 17–21%')
ax.invert_yaxis();ax.legend(frameon=False,loc='lower right',fontsize=8)
save(fig,'06-paired-uncertainty','P016 • 95% paired bootstrap intervals, 5 pairs, 5,000 resamples, seed 937. Most intervals are smaller than markers.\nThese intervals describe within-allocation repeat noise, not generalization across prompts, devices or deployments.')

fig,axs=plt.subplots(1,2,figsize=(10,4.6))
for ax,c in zip(axs,[128,512]):
    rows=[r for r in paired if r['context']==c and 'eagle' in r['method']]
    ax.plot([2,3,4],[r['control_decode_tps'] for r in rows],'o--',color=GRAY,label='Incumbent')
    ax.plot([2,3,4],[r['candidate_decode_tps'] for r in rows],'o-',color=GREEN,label='Optimized')
    ax.set(xticks=[2,3,4],xlabel='Draft depth K',ylim=(400,750),title=f'{c} input / '+('code' if c==128 else 'prose'))
axs[0].set_ylabel('Decode tokens / second');axs[0].legend(frameon=False)
save(fig,'07-draft-depth','P016 • identical complete outputs within each prompt/recipe. K4 wins for this code prompt; K2 wins for this prose prompt.\nThe workload changes with context. These two curves do not establish a context-length dispatch policy.')

# Validated raw-row consistency; no new GPU computation.
checks=[]
for r in raw:
    assert len(r['tokens'])==128
    assert abs(r['decode_tps']-128/r['decode_s'])<1e-8
    assert abs(r['return_inclusive_tps']-128/r['return_latency_s'])<1e-8
    assert abs(r['return_latency_s']-r['total_s']-r['serialization_s'])<1e-8
for c in [128,512]:
    rows=[r for r in raw if r['context']==c]
    assert all(r['tokens']==rows[0]['tokens'] for r in rows)
    for m in sorted({r['method'] for r in rows}):
        assert sorted(r['repeat'] for r in rows if r['method']==m)==list(range(5))
(OUT/'chart-data.json').write_text(json.dumps({'historical_graph_ablation':{'source':'PROJECT_HISTORY E018','eager':[60.96,46.21],'graph':[108.89,127.95]},'p013_and_p015_projection_summary':projection,'p016':paired},indent=2))
(OUT/'validation.json').write_text(json.dumps({'source_snapshot':COMMIT,'raw_rows_checked':80,'gates_checked':161,'complete_output_equality':True,'timing_arithmetic_checked':True,'gpu_or_cloud_execution':False,'charts':sorted(x.name for x in F.glob('*.svg'))},indent=2))
print('Saved 7 figures as PNG + SVG; checked 80 raw rows and 161 gates.')
