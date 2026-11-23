// Performance charts for the launch post. Numbers come from perf-data.json, generated from the chip repo's
// timing simulator at RTL-measured rates (see the post's side note). Colours use the tokens in article.module.css.
import data from "./perf-data.json";

const ink = "var(--cds-text-primary)", quiet = "var(--cds-text-secondary)", grid = "var(--cds-chart-grid)";
const UNIT_COLOR = { matrix: "var(--cds-chart-categorical-1)", vector: "var(--viz-violet)", memory: "var(--viz-aqua)" } as const;
const ms = (ns: number) => ns / 1e6;
const ctxLabel = (n: number) => (n >= 1024 ? `${n / 1024}K` : `${n}`);
const fmt = (v: number, d = 1) => v.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });

/* ---------- 1. Which unit is busy: prefill vs decode ---------- */

export function UnitShareChart() {
  const groups = [
    { key: "prefill", title: `Prefill · one 128-token chunk at 16K context · ${fmt(ms(data.prefill.wall_ns))} ms`, d: data.prefill },
    { key: "decode", title: `Decode · one token at 32K context · ${fmt(ms(data.decode.wall_ns), 2)} ms`, d: data.decode },
  ];
  const rows = [
    { key: "matrix", name: "Matrix unit" },
    { key: "vector", name: "Vector unit" },
    { key: "memory", name: "GDDR7 stream" },
  ] as const;
  const x0 = 150, w = 400, X = (f: number) => x0 + f * w, rh = 30;
  let y = 76;
  const blocks = groups.map((g) => {
    const top = y;
    y += 26 + rows.length * rh + 22;
    return { ...g, top };
  });
  const H = y + 10;
  return (
    <svg viewBox={`0 0 760 ${H}`} role="img" aria-label="Prefill keeps both compute units busy; decode is set by the memory stream" fontSize="11.5">
      <text x="24" y="28" fontSize="15" fontWeight="600" fill={ink}>Prefill is limited by compute, decode by memory</text>
      <text x="24" y="48" fill={quiet}>Share of the wall-clock time each unit is busy (units overlap, so shares don&rsquo;t add to 100%)</text>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <g key={t}>
          <line x1={X(t)} x2={X(t)} y1={64} y2={H - 26} stroke={grid} />
          <text x={X(t)} y={H - 10} textAnchor="middle" fill={quiet}>{`${t * 100}%`}</text>
        </g>
      ))}
      {blocks.map((g) => (
        <g key={g.key}>
          <text x="24" y={g.top + 14} fontWeight="600" fill={ink}>{g.title}</text>
          {rows.map((r, i) => {
            const busy = g.d.busy_ns[r.key], f = busy / g.d.wall_ns, cy = g.top + 26 + i * rh + rh / 2;
            return (
              <g key={r.key}>
                <text x={x0 - 12} y={cy + 4} textAnchor="end" fill={ink}>{r.name}</text>
                <rect x={x0} y={cy - 9} width={Math.max(2, X(f) - x0)} height="18" rx="4" fill={UNIT_COLOR[r.key]}>
                  <title>{`${r.name}: busy ${fmt(ms(busy), 2)} ms of ${fmt(ms(g.d.wall_ns), 2)} ms`}</title>
                </rect>
                <text x={X(f) + 8} y={cy + 4} fill={ink}>{`${Math.round(f * 100)}%`}<tspan fill={quiet}>{`  ·  ${fmt(ms(busy), ms(busy) < 1 ? 2 : 1)} ms`}</tspan></text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

/* ---------- 2. Where a unit's time goes, by what the model is doing ---------- */
// One colour per part of the model, shared by every breakdown chart.
type Op = { key: string; name: string; color: string; parts: string[] };
const FFN = "var(--cds-chart-categorical-1)", DN = "var(--viz-violet)", ATTN = "var(--viz-orange)", PROJ = "var(--viz-yellow)", AQUA = "var(--viz-aqua)", OTHER = "var(--cds-chart-muted)";
const MATRIX_OPS: Op[] = [
  { key: "ffn", name: "Feed-forward (gate, up, down)", color: FFN, parts: ["ffn"] },
  { key: "dn", name: "DeltaNet projections and chunk products", color: DN, parts: ["dn_proj", "dn_chunk"] },
  { key: "attn", name: "Attention q·K and P·V", color: ATTN, parts: ["attn_core"] },
  { key: "proj", name: "Attention projections", color: PROJ, parts: ["attn_proj"] },
  { key: "lm", name: "LM head (picks the next token)", color: AQUA, parts: ["lmhead"] },
  { key: "other", name: "Other", color: OTHER, parts: ["other"] },
];
const VECTOR_OPS: Op[] = [
  { key: "dn", name: "DeltaNet state update", color: DN, parts: ["deltanet"] },
  { key: "attn", name: "Softmax", color: ATTN, parts: ["softmax"] },
  { key: "ffn", name: "SiLU and other activations", color: FFN, parts: ["act"] },
  { key: "nq", name: "Norms and int8 quantizing", color: AQUA, parts: ["norm", "quant"] },
  { key: "other", name: "Other elementwise work", color: OTHER, parts: ["other"] },
];

function Breakdown({ title, sub, ops, unit, label }: { title: string; sub: string; ops: Op[]; unit: "matrix_ops" | "vector_ops"; label: string }) {
  const bars = [
    { key: "prefill", name: "Prefill", d: data.prefill, per: "per chunk" },
    { key: "decode", name: "Decode, 32K", d: data.decode, per: "per token" },
  ];
  const x0 = 140, w = 580, bh = 30;
  const legendTop = 72 + bars.length * 64 + 8;
  const H = legendTop + Math.ceil(ops.length / 2) * 22 + 6;
  return (
    <svg viewBox={`0 0 760 ${H}`} role="img" aria-label={title} fontSize="11.5">
      <text x="24" y="28" fontSize="15" fontWeight="600" fill={ink}>{title}</text>
      <text x="24" y="48" fill={quiet}>{sub}</text>
      {bars.map((b, i) => {
        const raw = b.d[unit] as Record<string, number>;
        const vals = ops.map((o) => o.parts.reduce((t, k) => t + (raw[k] ?? 0), 0));
        const total = vals.reduce((t, v) => t + v, 0);
        const y = 72 + i * 64;
        let acc = 0;
        return (
          <g key={b.key}>
            <text x={x0 - 12} y={y + 14} textAnchor="end" fontWeight="600" fill={ink}>{b.name}</text>
            <text x={x0 - 12} y={y + 29} textAnchor="end" fill={quiet} fontSize="10.5">{`${fmt(ms(total), ms(total) < 1 ? 2 : 1)} ms ${b.per}`}</text>
            {ops.map((o, j) => {
              const v = vals[j];
              if (v <= 0) return null;
              const x = x0 + (acc / total) * w, sw = (v / total) * w;
              acc += v;
              const pct = Math.round((v / total) * 100);
              return (
                <g key={o.key}>
                  <rect x={x + 1} y={y} width={Math.max(1, sw - 2)} height={bh} rx="4" fill={o.color}>
                    <title>{`${label}, ${b.name}: ${o.name}, ${fmt(ms(v), 2)} ms (${pct}%)`}</title>
                  </rect>
                  {sw > 40 ? <text x={x + sw / 2} y={y + bh / 2 + 4} textAnchor="middle" fill={o.color === PROJ ? "#1d1d1b" : "var(--paper)"} fontWeight="600">{`${pct}%`}</text> : null}
                </g>
              );
            })}
          </g>
        );
      })}
      {ops.map((o, i) => (
        <g key={o.key} transform={`translate(${24 + (i % 2) * 360} ${legendTop + Math.floor(i / 2) * 22})`}>
          <rect y="-9" width="12" height="12" rx="3" fill={o.color} />
          <text x="18" y="1" fill={quiet}>{o.name}</text>
        </g>
      ))}
    </svg>
  );
}

export function MatrixBreakdownChart() {
  return <Breakdown unit="matrix_ops" ops={MATRIX_OPS} label="Matrix unit" title="Matrix unit: most of its time is the feed-forward layers" sub="Share of the matrix unit’s busy time by which part of the model it is computing" />;
}

export function VectorBreakdownChart() {
  return <Breakdown unit="vector_ops" ops={VECTOR_OPS} label="Vector unit" title="Vector unit: DeltaNet and softmax take most of its time" sub="Share of the vector unit’s busy time by which part of the model it is computing" />;
}

/* ---------- 2b. DeltaNet stays flat while attention grows ---------- */

export function DeltaNetVsAttentionChart() {
  const rows = data.deltanet_vs_attention;
  const series = [
    { key: "deltanet_ns", name: "24 DeltaNet layers", color: DN },
    { key: "attention_ns", name: "8 attention layers", color: ATTN },
  ] as const;
  const max = Math.ceil(Math.max(...rows.map((r) => r.attention_ns)) / 1e6 / 2) * 2;
  const x0 = 80, plotW = 640, top = 76, h = 200, gw = plotW / rows.length, bw = 44;
  const Y = (v: number) => top + h - (v / 1e6 / max) * h;
  const ticks = Array.from({ length: max / 2 + 1 }, (_, i) => i * 2);
  return (
    <svg viewBox="0 0 760 340" role="img" aria-label="Per decode token, DeltaNet's cost stays flat as context grows while attention's grows" fontSize="11.5">
      <text x="24" y="28" fontSize="15" fontWeight="600" fill={ink}>DeltaNet&rsquo;s cost per token stays flat; attention&rsquo;s grows with context</text>
      <text x="24" y="48" fill={quiet}>Busy time per decode token, matrix and vector unit together, by layer type</text>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x0} x2={x0 + plotW} y1={Y(t * 1e6)} y2={Y(t * 1e6)} stroke={grid} />
          <text x={x0 - 8} y={Y(t * 1e6) + 4} textAnchor="end" fill={quiet}>{`${t} ms`}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const cx = x0 + gw * i + gw / 2;
        return (
          <g key={r.ctx}>
            {series.map((s, j) => {
              const v = r[s.key], x = cx - bw - 3 + j * (bw + 6);
              return (
                <g key={s.key}>
                  <rect x={x} y={Y(v)} width={bw} height={top + h - Y(v)} rx="4" fill={s.color}>
                    <title>{`${s.name} at ${ctxLabel(r.ctx)} context: ${fmt(ms(v), 2)} ms per token`}</title>
                  </rect>
                  <text x={x + bw / 2} y={Y(v) - 6} textAnchor="middle" fill={ink}>{fmt(ms(v))}</text>
                </g>
              );
            })}
            <text x={cx} y={top + h + 18} textAnchor="middle" fill={quiet}>{`${ctxLabel(r.ctx)} context`}</text>
          </g>
        );
      })}
      {series.map((s, i) => (
        <g key={s.key} transform={`translate(${24 + i * 180} 326)`}>
          <rect y="-9" width="12" height="12" rx="3" fill={s.color} />
          <text x="18" y="1" fill={quiet}>{s.name}</text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- 3. Speed across context lengths ---------- */


function Panel({ x, title, unit, series, yTicks, yMax, log }: {
  x: number; title: string; unit: string;
  series: { name: string; color: string; dash?: boolean; pts: { n: number; v: number }[] }[];
  yTicks: number[]; yMax: number; log?: { min: number };
}) {
  const ns = series[0].pts.map((p) => p.n);
  const w = 250, top = 92, h = 210;
  const lx = (n: number) => Math.log2(n), x0 = lx(ns[0]), x1 = lx(ns[ns.length - 1]);
  const X = (n: number) => x + ((lx(n) - x0) / (x1 - x0)) * w;
  const Y = log
    ? (v: number) => top + h - ((Math.log10(v) - Math.log10(log.min)) / (Math.log10(yMax) - Math.log10(log.min))) * h
    : (v: number) => top + h - (v / yMax) * h;
  return (
    <g>
      <text x={x - 44} y={72} fontWeight="600" fill={ink}>{title}</text>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={x} x2={x + w} y1={Y(t)} y2={Y(t)} stroke={grid} />
          <text x={x - 8} y={Y(t) + 4} textAnchor="end" fill={quiet}>{`${t}${unit}`}</text>
        </g>
      ))}
      {ns.map((n) => <text key={n} x={X(n)} y={top + h + 18} textAnchor="middle" fill={quiet}>{ctxLabel(n)}</text>)}
      {series.map((s) => (
        <g key={s.name}>
          <path d={s.pts.map((p, i) => `${i ? "L" : "M"}${X(p.n)} ${Y(p.v)}`).join("")} fill="none" stroke={s.color} strokeWidth="2.25" strokeDasharray={s.dash ? "5 4" : undefined} />
          {s.pts.map((p) => (
            <circle key={p.n} cx={X(p.n)} cy={Y(p.v)} r="4.5" fill={s.color} stroke="var(--paper)" strokeWidth="2">
              <title>{`${s.name} at ${ctxLabel(p.n)}: ${p.v >= 100 ? Math.round(p.v) : fmt(p.v, p.v < 10 ? 2 : 1)}${unit}`}</title>
            </circle>
          ))}
          {(() => {
            const last = s.pts[s.pts.length - 1];
            return <text x={X(last.n) + 9} y={Y(last.v) + 4} fill={ink} fontWeight="600">{last.v >= 100 ? Math.round(last.v) : fmt(last.v, last.v < 10 ? 2 : 1)}</text>;
          })()}
        </g>
      ))}
    </g>
  );
}

export function ContextSweepChart() {
  const dec = data.sweep.decode, pre = data.sweep.prefill;
  const decMax = Math.ceil(Math.max(...dec.map((d) => d.spec_tok_s)) / 50) * 50;
  const preMax = Math.max(...pre.map((d) => d.s));
  const decTicks = Array.from({ length: decMax / 50 + 1 }, (_, i) => i * 50);
  const preTicks = [0.1, 1, 10, 100].filter((t) => t >= pre[0].s / 3 && t / 10 < preMax);
  return (
    <svg viewBox="0 0 760 360" role="img" aria-label="Decode speed and prefill time from 1K to 128K tokens of context" fontSize="11.5">
      <text x="24" y="28" fontSize="15" fontWeight="600" fill={ink}>Speed from 1K to 128K tokens of context</text>
      <text x="24" y="48" fill={quiet}>Decode at batch 1, with and without 3 MTP drafts; prefill for a whole prompt of that length</text>
      <Panel x={68} title="Decode, tokens/s" unit="" yMax={decMax} yTicks={decTicks} series={[
        { name: "With speculation", color: "var(--cds-chart-categorical-1)", pts: dec.map((d) => ({ n: d.ctx, v: d.spec_tok_s })) },
        { name: "Plain", color: "var(--viz-aqua)", pts: dec.map((d) => ({ n: d.ctx, v: d.tok_s })) },
      ]} />
      <Panel x={470} title="Prefill, seconds (log scale)" unit=" s" yMax={Math.max(...preTicks)} log={{ min: Math.min(...preTicks) }} yTicks={preTicks} series={[
        { name: "Prefill", color: "var(--viz-orange)", pts: pre.map((d) => ({ n: d.ctx, v: d.s })) },
      ]} />
      <g transform="translate(24 346)">
        <rect y="-9" width="12" height="12" rx="3" fill="var(--cds-chart-categorical-1)" /><text x="18" y="1" fill={quiet}>decode with speculation (measured acceptance)</text>
        <rect x="300" y="-9" width="12" height="12" rx="3" fill="var(--viz-aqua)" /><text x="318" y="1" fill={quiet}>plain decode</text>
        <rect x="430" y="-9" width="12" height="12" rx="3" fill="var(--viz-orange)" /><text x="448" y="1" fill={quiet}>prefill time for the whole prompt</text>
      </g>
    </svg>
  );
}
