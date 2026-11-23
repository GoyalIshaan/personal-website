"""Validate exported P017 token continuity and derive diagnostic window rates."""
import hashlib
import json
from pathlib import Path


def analyze(directory):
    root=Path(directory)
    contract=json.loads((root/'contract.json').read_text())
    result=json.loads((root/'result.json').read_text())
    tokens=[];windows=[]
    for path in sorted(root.glob('tokens-*.json')):
        row=json.loads(path.read_text())
        if row['start_output']!=len(tokens) or row['end_output']!=len(tokens)+len(row['tokens']):
            raise ValueError('missing, duplicated or inconsistent output segment')
        if row['populated_kv_positions']!=contract['prompt_tokens']-1+row['end_output']:
            raise ValueError('cache cursor not continuous')
        if row['populated_kv_positions']>=contract['capacity']:
            raise ValueError('cache overflow')
        tokens.extend(row['tokens'])
        window={k:v for k,v in row.items() if k!='tokens'}
        window['decode_tps']=len(row['tokens'])/row['window_s'] if row['window_s']>0 else None
        windows.append(window)
    digest=hashlib.sha256(json.dumps(tokens,separators=(',',':')).encode()).hexdigest()
    if digest!=result['tokens_sha256']:raise ValueError('full sequence hash mismatch')
    completed=len(tokens)==contract['output_tokens']
    if result['reached_requested_output']!=completed or (result['stop_reason']=='completed')!=completed:
        raise ValueError('completion receipt inconsistent with actual outputs')
    from collections import Counter
    return {'generated_tokens':len(tokens),'prompt_tokens':contract['prompt_tokens'],'total_sequence_tokens':contract['prompt_tokens']+len(tokens),
        'requested_output_tokens':contract['output_tokens'],'reached_requested_output':completed,
        'stop_reason':result['stop_reason'],'sequence_hash_verified':True,
        'complete_contiguous_checkpoints':True,'windows':windows,'stats':result['stats'],
        'peak_allocated_gib':result['peak_allocated_bytes']/1024**3,
        'first_ignored_eos_output_index':result['first_ignored_eos_output_index'],
        'most_common_token_ids':Counter(tokens).most_common(5),
        'scope':'Single AR endurance request; ignore EOS; no SD/SSD equality or coherent text claim'}


if __name__=='__main__':
    import argparse
    p=argparse.ArgumentParser();p.add_argument('directory');p.add_argument('--output',required=True);a=p.parse_args()
    Path(a.output).write_text(json.dumps(analyze(a.directory),indent=2)+'\n')
