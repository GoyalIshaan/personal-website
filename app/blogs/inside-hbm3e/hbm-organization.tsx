"use client";

import { useId } from "react";
import type { OrganizationLevel, RowState } from "./content";
import styles from "./organization.module.css";

export type MemorySelection = { channel: number; pseudo: number; rank: number; group: number; bank: number };

// Ordered the way the essay builds memory up: one cell → one grid → leaving the grid → many grids → the interface → capacity → the address.
export const organizationLevels: { id: OrganizationLevel; label: string; text: string }[] = [
  { id: "cell", label: "One cell", text: "A capacitor holds the bit; a transistor connects it to the bitline. The wordline is the transistor's on switch." },
  { id: "row", label: "Rows + sense amps", text: "The row decoder raises one wordline. Each sense amplifier compares its bitline with the halfway reference and drives it to a full 0 or 1." },
  { id: "columns", label: "Picking columns", text: "READ carries a column address. The column decoder connects only the chosen sense amplifiers, 8 columns or 256 bits, to the read path." },
  { id: "burst", label: "Pins, beats, bursts", text: "The 256 bits leave on 32 data pins. Each beat puts one bit on every pin; 8 beats make one 32-byte burst." },
  { id: "banks", label: "Banks", text: "Banks open and close rows independently, but they all share the same 32 data pins. Overlapping their row work keeps the pins busy." },
  { id: "groups", label: "Bank groups", text: "Back-to-back READs down one group's internal wires must wait 4 cycles. Alternating groups lets a burst start every 2 cycles." },
  { id: "activations", label: "Activation limits", text: "Every ACTIVATE pulls a current spike. ACTIVATEs must be at least 4 cycles apart, and at most four may land in any 24-cycle window." },
  { id: "channels", label: "Channels", text: "16 independent channels, each with its own data pins, command/address pins and banks. 16 × 64 bits = 1,024 data pins." },
  { id: "pseudo", label: "Pseudo-channels", text: "Each channel splits into two 32-bit halves with their own banks. A burst is exactly 32 bytes, and the pair shares one set of command pins." },
  { id: "ranks", label: "Ranks (SIDs)", text: "A taller HBM stack adds more banks on another die, wired to the same pins. SID bits pick which rank answers." },
  { id: "address", label: "One address", text: "The controller cuts each address into fields. Low bits spread consecutive 32-byte blocks across channels; high bits pick the row." },
];

export function organizationLevelForFocus(focus: number): OrganizationLevel {
  return focus === 1 ? "cell" : focus === 2 ? "row" : focus === 3 ? "columns" : focus === 4 ? "banks" : focus === 6 ? "burst" : "channels";
}

type Props = {
  level: OrganizationLevel;
  selection: MemorySelection;
  rowState: RowState;
  compact?: boolean;
  motionPaused: boolean;
};

const values = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1];
const groupTone = ["#cfcfcf", "#baa38e", "#8fa7b8", "#a9b88f"];

/* ---------- small shared pieces ---------- */

function Timeline({ x0, x1, y, cycles, step = 4, label = "clock cycles" }: { x0: number; x1: number; y: number; cycles: number; step?: number; label?: string }) {
  const w = (x1 - x0) / cycles;
  return <g>
    <path d={`M${x0} ${y} H${x1}`} className={styles.axis} />
    {Array.from({ length: Math.floor(cycles / step) + 1 }, (_, i) => <g key={i}>
      <path d={`M${x0 + i * step * w} ${y} v4`} className={styles.axis} />
      <text x={x0 + i * step * w} y={y + 15} textAnchor="middle" className={styles.tiny}>{i * step}</text>
    </g>)}
    <text x={x1} y={y + 28} textAnchor="end" className={styles.tiny}>{label}</text>
  </g>;
}

function Block({ x, y, w, h = 16, kind, text }: { x: number; y: number; w: number; h?: number; kind: "act" | "rd" | "pre" | "data" | "idle"; text?: string }) {
  const cls = kind === "act" ? styles.blockAct : kind === "rd" ? styles.blockRead : kind === "pre" ? styles.blockPre : kind === "data" ? styles.blockData : styles.blockIdle;
  return <g><rect x={x} y={y} width={w} height={h} rx="1.5" className={cls} />{text && <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" className={styles.blockText}>{text}</text>}</g>;
}

/* ---------- 1. one cell ---------- */

function CellDetail({ marker }: { marker: string }) {
  return <g>
    <text x="24" y="111" className={styles.label}>One cell, at a wordline × bitline crossing</text>
    <g className={styles.cellInset}>
      {Array.from({ length: 5 }, (_, r) => <path key={`w${r}`} d={`M22 ${138 + r * 13} H128`} className={r === 2 ? styles.wordlineActive : styles.wordline} />)}
      {Array.from({ length: 8 }, (_, c) => <path key={`b${c}`} d={`M${32 + c * 13} 130 V200`} className={c === 4 ? styles.bitlineHot : styles.bitline} />)}
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 8 }, (_, c) => <rect key={`${r}-${c}`} x={28 + c * 13} y={134 + r * 13} width="8" height="8" className={r === 2 && c === 4 ? styles.selectedCells : styles.cells} />))}
      <path d="M86 164 L172 196" className={styles.zoomLine} />
      <text x="22" y="220" className={styles.tiny}>R wordlines + C bitlines</text>
      <text x="22" y="234" className={styles.tiny}>reach R × C cells</text>
    </g>
    <path d="M232 128 V198 M232 230 V266 M212 266 H252 M212 276 H252 M232 276 V302 M217 302 H247" className={styles.returnData} />
    <path d="M221 197 V231 M221 201 H232 M221 227 H232" className={styles.transistor} />
    <path d="M150 214 H209 M210 197 V231" className={styles.command} markerEnd={`url(#${marker}-command)`} />
    <text x="150" y="206" className={styles.small}>Wordline</text>
    <text x="242" y="140" className={styles.small}>Bitline (shared</text><text x="242" y="155" className={styles.small}>by the whole column)</text>
    <text x="262" y="210" className={styles.label}>Transistor</text><text x="262" y="226" className={styles.small}>switch, closed only when</text><text x="262" y="240" className={styles.small}>its wordline is on</text>
    <text x="262" y="272" className={styles.label}>Capacitor</text><text x="262" y="288" className={styles.small}>charge = 1, empty = 0</text>
    <circle cx="232" cy="271" r="11" className={styles.storedCharge} />
    <g className={styles.leak}><circle cx="252" cy="300" r="2" /><circle cx="258" cy="309" r="1.6" /><circle cx="263" cy="318" r="1.2" /></g>
    <text x="24" y="340" className={styles.label}>Charge leaks away, so every row is refreshed</text>
  </g>;
}

/* ---------- 2/3. one grid: rows, sense amps, columns ---------- */

function SenseTrace() {
  // Bitline voltage over one ACTIVATE: equalized at VDD/2, nudged by charge sharing, then driven to the rail by the sense amp.
  const x0 = 96, x1 = 420, top = 300, mid = 338, bot = 376;
  return <g>
    <text x="88" y={top + 4} textAnchor="end" className={styles.tiny}>VDD</text>
    <text x="88" y={mid + 4} textAnchor="end" className={styles.tiny}>VDD/2</text>
    <text x="88" y={bot + 4} textAnchor="end" className={styles.tiny}>0</text>
    <text x="24" y="320" className={styles.tiny}>bitline</text><text x="24" y="332" className={styles.tiny}>voltage</text>
    <path d={`M${x0} ${top} H${x1} M${x0} ${bot} H${x1}`} className={styles.gridLine} />
    <path d={`M${x0} ${mid} H${x1}`} className={styles.referenceLine} />
    <path d={`M${x0} 290 V${bot}`} className={styles.axis} />
    <path d={`M${x0} ${mid} H160 C170 ${mid} 175 ${mid - 9} 190 ${mid - 9} H232 C252 ${mid - 9} 262 ${top} 290 ${top} H${x1}`} className={`${styles.traceHigh} ${styles.drawIn}`} />
    <path d={`M${x0} ${mid} H232 C252 ${mid} 262 ${bot} 290 ${bot} H${x1}`} className={`${styles.traceRef} ${styles.drawIn}`} />
    <path d="M160 292 V380 M232 292 V380" className={styles.marker} />
    <text x="163" y="290" className={styles.tiny}>wordline on</text>
    <text x="236" y="290" className={styles.tiny}>sense amp fires</text>
    <text x="178" y={mid - 14} className={styles.tiny}>tiny nudge</text>
    <text x="298" y={top + 14} className={styles.tiny}>bitline → full 1, cell restored</text>
    <text x="298" y={bot - 6} className={styles.tiny}>reference bitline → 0</text>
  </g>;
}

function ArrayDetail({ level, rowState, marker }: { level: OrganizationLevel; rowState: RowState; marker: string }) {
  const active = rowState !== "precharged";
  const columns = level === "columns";
  const sensing = rowState === "sensing" && !columns;
  const picked = (col: number) => columns && col >= 4 && col < 8;
  return <g data-array-state={rowState} data-column-read={columns ? "true" : "false"}>
    <text x="24" y="104" className={styles.label}>{columns ? "READ: the column decoder picks a slice" : !active ? "Precharged: no row open" : sensing ? "ACTIVATE: share charge, sense, restore" : "Open row, held in the sense amplifiers"}</text>
    {/* row decoder */}
    <rect x="24" y="130" width="34" height="118" className={styles.decoder} />
    <text x="41" y="186" textAnchor="middle" className={styles.tiny} transform="rotate(-90 41 186)">row decoder</text>
    <path d="M10 118 H41 V129" className={active && !columns ? styles.command : styles.commandIdle} markerEnd={`url(#${marker}-command)`} />
    <text x="62" y="122" className={styles.tiny}>{active && !columns ? "ACTIVATE · row 2" : "row address"}</text>
    {Array.from({ length: 12 }, (_, col) => <g key={col}>
      <path d={`M${98 + col * 23} 132 V252`} className={`${picked(col) ? styles.bitlineHot : styles.bitline} ${sensing ? styles.sensingLine : ""}`} />
      {sensing && <path d={`M${98 + col * 23} 186 V250`} className={styles.chargeSharing} />}
    </g>)}
    {Array.from({ length: 5 }, (_, row) => <g key={row}>
      <path d={`M58 ${142 + row * 23} H370`} className={row === 2 && active ? styles.wordlineActive : styles.wordline} />
      <text x="378" y={146 + row * 23} className={styles.tiny}>R{row}</text>
      {Array.from({ length: 12 }, (_, col) => <rect key={col} x={91 + col * 23} y={135 + row * 23} width="14" height="14" className={row === 2 && active ? picked(col) ? styles.selectedCells : styles.openCells : styles.cells} />)}
    </g>)}
    {/* sense amplifiers = row buffer */}
    {values.map((bit, col) => <g key={col}>
      <rect x={90 + col * 23} y="252" width="16" height="22" className={active && !sensing ? picked(col) ? styles.selectedCells : styles.senseOpen : styles.senseIdle} />
      <text x={98 + col * 23} y="267" textAnchor="middle" className={styles.bit}>{active && !sensing ? bit : sensing ? "~" : "–"}</text>
    </g>)}
    <text x="24" y="261" className={styles.tiny}>sense amps</text>
    <text x="24" y="273" className={styles.tiny}>= row buffer</text>
    {sensing ? <SenseTrace /> : columns ? <>
      <rect x="90" y="292" width="275" height="22" className={styles.decoder} />
      <text x="96" y="307" className={styles.tiny}>column decoder: connect only the chosen sense amps</text>
      {[4, 5, 6, 7].map(col => <path key={col} d={`M${98 + col * 23} 274 V292`} className={styles.returnData} />)}
      <path d="M436 303 H367" className={styles.command} markerEnd={`url(#${marker}-command)`} />
      <text x="436" y="296" textAnchor="end" className={styles.tiny}>READ · col</text>
      <path d="M210 314 V334 H420" className={styles.returnData} markerEnd={`url(#${marker}-data)`} />
      <path d="M210 314 V334 H420" className={styles.dataTravel} />
      <text x="24" y="358" className={styles.label}>8 columns × 32 bits = 256 bits → read path</text>
    </> : <>
      <text x="24" y="318" className={styles.small}>{!active ? "Wordlines off · bitlines reset to VDD/2 · bits stay in the cells" : "Same row: read again. New row: PRECHARGE, then ACTIVATE."}</text>
      {active && <g><Block x={24} y={360} w={70} kind="act" text="ACTIVATE" /><Block x={98} y={360} w={52} kind="rd" text="READ" /><Block x={154} y={360} w={52} kind="rd" text="READ" /><Block x={210} y={360} w={78} kind="pre" text="PRECHARGE" /><text x="296" y="372" className={styles.tiny}>row hits are cheap</text></g>}
    </>}
  </g>;
}

/* ---------- 4. pins, beats, burst ---------- */

function BurstDetail() {
  const x0 = 96, cw = 34, y0 = 186, rowH = 3.6;
  const bit = (pin: number, beat: number) => ((pin * 2654435761 + beat * 40503 + 12345) >>> 0) % 7 < 3;
  return <g>
    <text x="24" y="104" className={styles.label}>256 bits → 32 data pins × 8 beats</text>
    {/* the 256-bit block from the READ */}
    <text x="24" y="132" className={styles.small}>From READ</text>
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={x0 + i * cw} y="121" width={cw - 3} height="14" className={styles.selectedCells} />)}
    <text x={x0 + 8 * cw + 6} y="132" className={styles.tiny}>256 bits</text>
    {/* clock: 4 cycles, a beat on every edge (DDR) */}
    <text x="24" y="166" className={styles.small}>Clock</text>
    <path d={Array.from({ length: 4 }, (_, i) => { const x = x0 + i * 2 * cw; return `${i === 0 ? "M" : "L"}${x} 168 V152 H${x + cw} V168 H${x + 2 * cw}`; }).join(" ")} className={styles.clock} />
    {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${x0 + i * cw} 150 V176`} className={styles.edge} />)}
    {/* 32 pins × 8 beats */}
    <text x="24" y={y0 + 10} className={styles.small}>pin 0</text>
    <text x="24" y={y0 + 32 * rowH} className={styles.small}>pin 31</text>
    {Array.from({ length: 32 }, (_, pin) => <path key={pin} d={`M${x0 - 6} ${y0 + pin * rowH + 1.5} H${x0 + 8 * cw}`} className={styles.pinWire} />)}
    {Array.from({ length: 8 }, (_, beat) => <g key={beat} className={styles.beat} style={{ animationDelay: `${beat * 160}ms` }}>
      {Array.from({ length: 32 }, (_, pin) => <rect key={pin} x={x0 + beat * cw + 2} y={y0 + pin * rowH} width={cw - 7} height={rowH - 0.8} className={bit(pin, beat) ? styles.bitOne : styles.bitZero} />)}
      <text x={x0 + beat * cw + cw / 2 - 2} y={y0 + 32 * rowH + 14} textAnchor="middle" className={styles.tiny}>{beat + 1}</text>
    </g>)}
    <text x={x0 + 8 * cw + 6} y={y0 + 16 * rowH} className={styles.tiny}>32 pins</text>
    <path d={`M${x0} 336 v6 H${x0 + cw - 4} v-6`} className={styles.bracket} />
    <text x={x0} y="356" className={styles.tiny}>1 beat = 1 bit on every pin = 4 B</text>
    <path d={`M${x0} 362 v6 H${x0 + 8 * cw - 4} v-6`} className={styles.bracket} />
    <text x="24" y="384" className={styles.label}>1 burst = 8 beats = 32 bytes · 2 beats per clock (DDR)</text>
  </g>;
}

/* ---------- 5. banks share pins: timing ---------- */

function BanksDetail() {
  const x0 = 96, x1 = 420, cycles = 24, w = (x1 - x0) / cycles;
  const X = (c: number) => x0 + c * w;
  // ACTIVATE→READ 6 cycles, ACTIVATEs ≥4 apart, same-bank READs ≥4 apart, one burst (2 cycles) on the pins at a time.
  const banks = [
    { act: 0, reads: [6, 10, 14] }, { act: 4, reads: [12, 16] }, { act: 8, reads: [18, 22] }, { act: 12, reads: [20] },
  ];
  return <g>
    <text x="24" y="104" className={styles.label}>Four banks, one set of 32 data pins</text>
    <text x="24" y="122" className={styles.small}>Illustrative: row ready 6 cycles after ACT; a burst takes 2.</text>
    {banks.map((b, i) => <g key={i}>
      <text x="24" y={152 + i * 26} className={styles.small}>Bank {i}</text>
      <Block x={X(b.act)} y={140 + i * 26} w={6 * w - 2} kind="act" text="ACT" />
      {b.reads.map(r => <Block key={r} x={X(r)} y={140 + i * 26} w={2 * w - 2} kind="rd" text="RD" />)}
    </g>)}
    <path d={`M${x0} 246 H${x1}`} className={styles.divider} />
    <text x="24" y="270" className={styles.small}>Data pins</text>
    <rect x={x0} y="258" width={x1 - x0} height="18" className={styles.blockIdle} />
    {banks.flatMap((b, i) => b.reads.map(r => <g key={`${i}-${r}`}><rect x={X(r)} y="258" width={2 * w - 1} height="18" className={styles.blockData} style={{ fill: groupTone[i] }} /><text x={X(r) + w} y="271" textAnchor="middle" className={styles.blockTextDark}>B{i}</text></g>))}
    <text x="24" y="304" className={styles.small}>One bank</text><text x="24" y="317" className={styles.small}>alone</text>
    <rect x={x0} y="294" width={x1 - x0} height="18" className={styles.blockIdle} />
    {[6, 10, 22].map(r => <rect key={r} x={X(r)} y="294" width={2 * w - 1} height="18" className={styles.blockData} />)}
    <text x={X(12) + 4} y="307" className={styles.tiny}>PRE + ACT: idle</text>
    <Timeline x0={x0} x1={x1} y={324} cycles={cycles} />
    <text x="24" y="368" className={styles.label}>4 banks: pins busy 8 of 9 slots. 1 bank: 3.</text>
  </g>;
}

/* ---------- 6. bank groups: internal paths ---------- */

function GroupsDetail({ marker }: { marker: string }) {
  const x0 = 120, x1 = 420, cycles = 16, w = (x1 - x0) / cycles;
  const X = (c: number) => x0 + c * w;
  return <g>
    <text x="24" y="104" className={styles.label}>Each bank group has its own internal wires</text>
    {[0, 1].map(g => <g key={g}>
      <rect x={24 + g * 120} y="118" width="104" height="48" className={styles.region} />
      <text x={32 + g * 120} y="134" className={styles.small}>Bank group {g}</text>
      {Array.from({ length: 4 }, (_, b) => <rect key={b} x={32 + g * 120 + b * 23} y="142" width="17" height="16" className={styles.cells} style={{ stroke: groupTone[g] }} />)}
      <path d={`M${76 + g * 120} 166 V${190 - g * 0} H300`} className={styles.internalPath} style={{ stroke: groupTone[g] }} />
    </g>)}
    <text x="24" y="216" className={styles.tiny}>each group&apos;s internal read/write wires need 4 cycles to settle between READs</text>
    <rect x="300" y="176" width="72" height="26" className={styles.mux} /><text x="336" y="193" textAnchor="middle" className={styles.tiny}>serializer</text>
    <path d="M372 189 H420" className={styles.returnData} markerEnd={`url(#${marker}-data)`} /><text x="396" y="182" textAnchor="middle" className={styles.tiny}>32 pins</text>
    {/* same group */}
    <text x="24" y="238" className={styles.small}>Same group</text><text x="24" y="251" className={styles.tiny}>READ every 4</text>
    <rect x={x0} y="232" width={x1 - x0} height="18" className={styles.blockIdle} />
    {[0, 4, 8, 12].map(c => <g key={c}><rect x={X(c)} y="232" width={2 * w - 1} height="18" className={styles.blockData} style={{ fill: groupTone[0] }} /><text x={X(c + 3)} y="245" textAnchor="middle" className={styles.tiny}>idle</text></g>)}
    {/* alternating */}
    <text x="24" y="276" className={styles.small}>Alternating</text><text x="24" y="289" className={styles.tiny}>READ every 2</text>
    {Array.from({ length: 8 }, (_, i) => <g key={i}><rect x={X(i * 2)} y="270" width={2 * w - 1} height="18" className={styles.blockData} style={{ fill: groupTone[i % 2] }} /><text x={X(i * 2) + w} y="283" textAnchor="middle" className={styles.blockTextDark}>G{i % 2}</text></g>)}
    <Timeline x0={x0} x1={x1} y={300} cycles={cycles} step={2} />
    <text x="24" y="352" className={styles.label}>Same group: pins busy 50%. Alternating: 100%.</text>
  </g>;
}

/* ---------- 7. activation limits ---------- */

function ActivationsDetail({ marker }: { marker: string }) {
  const x0 = 70, x1 = 420, cycles = 40, w = (x1 - x0) / cycles;
  const X = (c: number) => x0 + c * w;
  const acts = [0, 4, 8, 12];
  return <g>
    <text x="24" y="104" className={styles.label}>ACTIVATEs are rationed to protect the supply</text>
    <text x="24" y="132" className={styles.small}>Current</text>
    <path d={`M${x0} 176 H${x1}`} className={styles.gridLine} />
    <path d={`M${x0} 142 H${x1}`} className={styles.limitLine} /><text x={x1} y="137" textAnchor="end" className={styles.tiny}>what the power grid can deliver</text>
    <path d={[...acts, 24].map(c => `M${X(c)} 176 C${X(c) + 3} 176 ${X(c) + 4} 152 ${X(c) + 8} 152 C${X(c) + 14} 152 ${X(c) + 16} 176 ${X(c) + 28} 176`).join(" ")} className={styles.currentSpike} />
    {acts.map(c => <g key={c}><Block x={X(c)} y={196} w={3 * w} kind="act" text="ACT" /></g>)}
    <Block x={X(16)} y={196} w={3 * w} kind="idle" text="5th?" />
    <path d={`M${X(17.5)} 218 C${X(18)} 240 ${X(22)} 240 ${X(24)} 222`} className={styles.command} markerEnd={`url(#${marker}-command)`} />
    <Block x={X(24)} y={196} w={3 * w} kind="act" text="ACT" />
    <path d={`M${X(0)} 252 v6 H${X(24)} v-6`} className={styles.bracket} />
    <text x={X(12)} y="272" textAnchor="middle" className={styles.tiny}>any 24-cycle window: at most 4 ACTIVATEs</text>
    <text x={X(2)} y="230" textAnchor="middle" className={styles.tiny}>≥4 apart</text><text x={X(17.5)} y="194" dy="-4" textAnchor="middle" className={styles.tiny}>too soon</text>
    <Timeline x0={x0} x1={x1} y={290} cycles={cycles} step={8} />
    <text x="24" y="342" className={styles.label}>Too many at once → the supply sags → misreads.</text>
  </g>;
}

/* ---------- 8. channels ---------- */

function ChannelsDetail({ s }: { s: MemorySelection }) {
  return <g>
    <text x="24" y="104" className={styles.label}>16 channels: nothing shared between them</text>
    {Array.from({ length: 16 }, (_, channel) => {
      const x = 24 + channel % 4 * 100;
      const y = 120 + Math.floor(channel / 4) * 52;
      const sel = channel === s.channel;
      return <g key={channel} data-selected-channel={sel ? "true" : undefined}>
        <rect x={x} y={y} width="90" height="44" className={sel ? styles.selectedRegion : styles.region} />
        <text x={x + 7} y={y + 14} className={styles.tiny}>Ch {channel}</text>
        <path d={`M${x + 7} ${y + 21} H${x + 83}`} className={sel ? styles.commandBus : styles.commandBusIdle} />
        <path d={`M${x + 7} ${y + 33} H${x + 42} M${x + 48} ${y + 33} H${x + 83}`} className={sel ? styles.twoPathsSelected : styles.twoPaths} />
      </g>;
    })}
    <path d="M24 336 H44" className={styles.commandBus} /><text x="50" y="340" className={styles.small}>command/address pins (one set per channel)</text>
    <path d="M24 356 H44" className={styles.twoPathsSelected} /><text x="50" y="360" className={styles.small}>data pins: 2 × 32 per channel</text>
    <text x="24" y="382" className={styles.label}>16 × 64 = 1,024 data pins · 16 commands at once</text>
  </g>;
}

/* ---------- 9. pseudo-channels ---------- */

function PseudoDetail() {
  const cw = 20;
  return <g>
    <text x="24" y="104" className={styles.label}>Why split a 64-bit channel in two?</text>
    <text x="24" y="128" className={styles.small}>1 · Access size (8 beats per burst, fixed)</text>
    <text x="24" y="150" className={styles.tiny}>64-bit channel</text>
    {Array.from({ length: 8 }, (_, i) => <g key={i}><rect x={128 + i * cw} y="140" width={cw - 2} height="12" className={styles.selectedCells} /><rect x={128 + i * cw} y="153" width={cw - 2} height="12" className={styles.wasted} /></g>)}
    <text x={128 + 8 * cw + 8} y="152" className={styles.tiny}>64 B per burst</text>
    <text x={128 + 8 * cw + 8} y="166" className={styles.tiny}>half often unused</text>
    <text x="24" y="188" className={styles.tiny}>32-bit pseudo-channel</text>
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={128 + i * cw} y="178" width={cw - 2} height="12" className={styles.selectedCells} />)}
    <text x={128 + 8 * cw + 8} y="189" className={styles.tiny}>32 B = one GPU sector</text>
    <text x="24" y="222" className={styles.small}>2 · Pin cost: one command bus feeds both halves</text>
    <rect x="24" y="234" width="392" height="98" className={styles.region} />
    <path d="M40 250 H400" className={styles.commandBus} /><text x="44" y="246" className={styles.tiny}>shared command/address pins: PC0 and PC1 take turns</text>
    {[0, 1].map(pc => <g key={pc}>
      <rect x={40 + pc * 186} y="262" width="174" height="56" className={styles.selectedRegion} />
      <text x={50 + pc * 186} y="280" className={styles.small}>Pseudo-channel {pc}</text>
      {Array.from({ length: 4 }, (_, i) => <rect key={i} x={50 + pc * 186 + i * 22} y="290" width="16" height="16" className={styles.cells} />)}
      <text x={146 + pc * 186} y="303" className={styles.tiny}>own banks</text>
      <path d={`M${127 + pc * 186} 318 V342`} className={styles.returnData} /><text x={133 + pc * 186} y="338" className={styles.tiny}>32 data pins</text>
    </g>)}
    <text x="24" y="368" className={styles.label}>32 independent data paths, 16 command buses</text>
  </g>;
}

/* ---------- 10. ranks / stack IDs ---------- */

function RanksDetail({ s, marker }: { s: MemorySelection; marker: string }) {
  const sid = s.rank % 2;
  return <g>
    <text x="24" y="104" className={styles.label}>Ranks: more banks on another die, same pins</text>
    {/* mini stack, two SIDs */}
    {Array.from({ length: 8 }, (_, i) => <g key={i}><rect x="24" y={120 + i * 14} width="70" height="10" className={styles.region} style={{ stroke: groupTone[i < 4 ? 1 : 0], fill: (i < 4 ? 1 : 0) === sid ? "#3a3a3a" : "#1e1e1e" }} /><text x="100" y={129 + i * 14} className={styles.tiny}>{i === 1 ? "SID 1" : i === 5 ? "SID 0" : ""}</text></g>)}
    <rect x="24" y="234" width="70" height="10" className={styles.region} /><text x="100" y="243" className={styles.tiny}>base die</text>
    <text x="24" y="262" className={styles.tiny}>8-high: 2 SIDs (illustrative</text><text x="24" y="275" className={styles.tiny}>die-to-SID mapping)</text>
    {[0, 1].map(r => <g key={r} opacity={r === sid ? 1 : 0.45}>
      <rect x={160 + r * 132} y="120" width="122" height="118" className={r === sid ? styles.selectedRegion : styles.region} />
      <text x={168 + r * 132} y="137" className={styles.small}>SID {r} {r === sid ? "· answers" : "· ignores"}</text>
      {Array.from({ length: 4 }, (_, g) => <g key={g}>
        <text x={168 + r * 132} y={157 + g * 20} className={styles.tiny}>BG{g}</text>
        {Array.from({ length: 4 }, (_, b) => <rect key={b} x={196 + r * 132 + b * 20} y={147 + g * 20} width="15" height="13" className={styles.cells} style={{ stroke: groupTone[g] }} />)}
      </g>)}
      <path d={`M${221 + r * 132} 238 V262 H${287}`} className={r === sid ? styles.returnData : styles.bitline} />
    </g>)}
    <path d="M287 262 V292" className={styles.returnData} markerEnd={`url(#${marker}-data)`} />
    <text x="295" y="288" className={styles.tiny}>same 32 data pins</text>
    <text x="24" y="320" className={styles.small}>Bank groups: split inside a rank, for speed.</text>
    <text x="24" y="338" className={styles.small}>Ranks: more banks on another die, for capacity.</text>
    <text x="24" y="364" className={styles.label}>More SIDs → more storage, same 1,024 pins</text>
  </g>;
}

/* ---------- 11. one address ---------- */

const addressFields = [
  { id: "row", label: "Row", bits: 14, value: "5021" },
  { id: "sid", label: "SID", bits: 1, value: "1" },
  { id: "bank", label: "Bank", bits: 2, value: "1" },
  { id: "bg", label: "BG", bits: 2, value: "2" },
  { id: "col", label: "Col", bits: 5, value: "12" },
  { id: "pc", label: "PC", bits: 1, value: "0" },
  { id: "ch", label: "Ch", bits: 4, value: "3" },
  { id: "off", label: "Byte", bits: 5, value: "0" },
];
const fieldTone: Record<string, string> = { row: "#8e8e8e", sid: "#a9b88f", bank: "#cfcfcf", bg: "#baa38e", col: "#8fa7b8", pc: "#c7b3d6", ch: "#d6c27a", off: "#555555" };

function AddressDetail() {
  const total = addressFields.reduce((a, f) => a + f.bits, 0);
  const x0 = 24, x1 = 416, bw = (x1 - x0) / total;
  let cursor = x0;
  const placed = addressFields.map(f => { const x = cursor; cursor += f.bits * bw; return { ...f, x, w: f.bits * bw }; });
  return <g>
    <text x="24" y="104" className={styles.label}>The controller cuts every address into fields</text>
    {placed.map(f => <g key={f.id}>
      <rect x={f.x} y="118" width={f.w - 1} height="26" style={{ fill: fieldTone[f.id] }} className={styles.field} />
      <text x={f.x + f.w / 2} y="135" textAnchor="middle" className={styles.blockTextDark}>{f.w > 24 ? f.label : ""}</text>
      {f.w > 24 ? <text x={f.x + f.w / 2} y="158" textAnchor="middle" className={styles.tiny}>{f.bits}b</text> : <text x={f.x + f.w / 2} y={f.id === "bank" ? 170 : 158} textAnchor="middle" className={styles.tiny}>{f.label}</text>}
    </g>)}
    <text x="24" y="178" className={styles.tiny}>high bits</text><text x="416" y="178" textAnchor="end" className={styles.tiny}>low bits · one possible mapping</text>
    {/* decode path */}
    {["ch", "pc", "sid", "bg", "bank", "row", "col"].map((id, i) => { const f = addressFields.find(x => x.id === id)!; return <g key={id}>
      <rect x={24 + i * 56} y="190" width="50" height="34" rx="2" className={styles.region} style={{ stroke: fieldTone[id] }} />
      <text x={49 + i * 56} y="204" textAnchor="middle" className={styles.tiny}>{f.label}</text>
      <text x={49 + i * 56} y="218" textAnchor="middle" className={styles.small}>{f.value}</text>
      {i < 6 && <path d={`M${74 + i * 56} 207 h6`} className={styles.axis} />}
    </g>; })}
    <text x="24" y="242" className={styles.tiny}>one branch at each level, down to a 32-byte slice of one row</text>
    {/* interleaving */}
    <text x="24" y="270" className={styles.small}>8 consecutive 32-byte blocks → 8 different channels</text>
    {Array.from({ length: 8 }, (_, i) => <g key={i}>
      <rect x={24 + i * 49} y="280" width="44" height="22" className={styles.selectedCells} /><text x={46 + i * 49} y="295" textAnchor="middle" className={styles.tiny}>blk {i}</text>
      <path d={`M${46 + i * 49} 302 V322`} className={styles.returnData} />
      <rect x={24 + i * 49} y="322" width="44" height="22" className={styles.field} style={{ fill: fieldTone.ch }} /><text x={46 + i * 49} y="337" textAnchor="middle" className={styles.blockTextDark}>ch {i}</text>
    </g>)}
    <text x="24" y="368" className={styles.label}>Low bits → channels busy in parallel</text>
  </g>;
}

/* ---------- dispatch ---------- */

function OrganizationScene({ level, selection, rowState, marker }: { level: OrganizationLevel; selection: MemorySelection; rowState: RowState; marker: string }) {
  if (level === "cell") return <CellDetail marker={marker} />;
  if (level === "row" || level === "columns") return <ArrayDetail level={level} rowState={level === "columns" ? "open" : rowState} marker={marker} />;
  if (level === "burst") return <BurstDetail />;
  if (level === "banks") return <BanksDetail />;
  if (level === "groups") return <GroupsDetail marker={marker} />;
  if (level === "activations") return <ActivationsDetail marker={marker} />;
  if (level === "channels") return <ChannelsDetail s={selection} />;
  if (level === "pseudo") return <PseudoDetail />;
  if (level === "ranks") return <RanksDetail s={selection} marker={marker} />;
  return <AddressDetail />;
}

function Markers({ id }: { id: string }) {
  return <defs><marker id={`${id}-data`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="var(--hbm-data)" /></marker><marker id={`${id}-command`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="var(--hbm-command)" /></marker></defs>;
}

export function HbmOrganization({ level, selection, rowState, compact = false, motionPaused }: Props) {
  const id = useId().replace(/:/g, "");
  const scene = organizationLevels.find(x => x.id === level)!;
  const svg = (cls: string, viewBox: string) => <svg viewBox={viewBox} className={cls} role="img" aria-label={`${scene.label}. ${scene.text} Schematic, not a vendor die layout.`}>
    <Markers id={`${id}${compact ? "c" : ""}`} />
    <g key={`${level}-${rowState}`} className={styles.scene}><OrganizationScene level={level} selection={selection} rowState={rowState} marker={`${id}${compact ? "c" : ""}`} /></g>
  </svg>;
  return <div className={`${styles.organization} ${compact ? styles.compact : ""}`} data-organization-level={level} data-motion={motionPaused ? "paused" : "running"}>
    {compact ? svg(styles.compactDrawing, "0 90 440 300") : <>
      {svg(styles.drawing, "0 90 440 302")}
    </>}
  </div>;
}
