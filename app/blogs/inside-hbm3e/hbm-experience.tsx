"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { OrganizationLevel, RowState } from "./content";
import { HbmOrganization, organizationLevelForFocus, organizationLevels, type MemorySelection } from "./hbm-organization";
import styles from "./article.module.css";

const steps = [
  { title: "The whole package", short: "Package", text: "One HBM stack beside the compute die. The core dies are stacked vertically; the interposer connects the two components laterally." },
  { title: "One DRAM cell", short: "Cell", text: "A capacitor stores one bit. The wordline switches the transistor; the bitline is how the bit is read or written." },
  { title: "Activate, sense, restore", short: "Row", text: "Opening a wordline connects a row of cells to bitlines. Sense amplifiers resolve the small voltage changes and restore the stored values." },
  { title: "Select the columns", short: "Column", text: "A READ selects a portion of the open row. The whole activated row stays local; only selected data enters the read path." },
  { title: "Banks and bank groups", short: "Banks", text: "Many independent grids share one set of data pins. Overlapping their row work, and alternating bank groups, keeps the pins busy." },
  { title: "Channels, ranks, addresses", short: "Channels", text: "16 independent 64-bit channels, each split into two 32-bit pseudo-channels, with extra ranks behind the same pins." },
  { title: "Pins, beats, bursts", short: "Burst", text: "32 data pins, one bit per pin per beat, 8 beats per burst: 32 bytes per READ." },
  { title: "Down the vertical interconnect", short: "TSVs", text: "Selected read data travels toward the base die through TSVs and die joints. Lower dies are not extra DRAM lookups in the route." },
  { title: "The base-die handoff", short: "Base die", text: "The base die interfaces the stack with the package. Drivers, receivers and timing circuits support reliable transfers." },
  { title: "Across the interposer", short: "Interposer", text: "Read data travels laterally to the GPU memory interface. The local HBM path does not pass through the motherboard or PCIe." },
  { title: "Width × data rate", short: "Bandwidth", text: "At 9.6 Gb/s per data pin, 1,024 pins give 1.2288 TB/s of theoretical bandwidth per stack. More core dies add capacity behind that interface." },
  { title: "Power and heat", short: "Power", text: "Separate power and ground connections support the stack. Array operations, refresh, clocking and I/O all contribute to heat." },
  { title: "The assembly has to survive", short: "Packaging", text: "Microbumps, underfill, thin dies and cooling must work together. More layers change the mechanical and thermal problem." },
  { title: "The whole trip", short: "GPU", text: "Capacitor → sense amps → column → burst → TSVs → base die → interposer → GPU. Thousands of these trips run side by side across 32 pseudo-channels." },
];

const rowScenes: Record<RowState, { title: string; text: string }> = {
  precharged: { title: "Precharged bitlines", text: "The cells are disconnected and keep their stored charge. The bitlines return to their reference voltage, ready for the next ACTIVATE." },
  sensing: { title: "ACTIVATE, sense and restore", text: "ACTIVATE turns on a wordline. Cells share charge with bitlines; sense amplifiers resolve the small voltage changes and restore the cells." },
  open: { title: "The row is open", text: "The wordline stays on and the sense amplifiers hold the row's values. A READ can now select columns from this open row." },
};

function PackageDrawing({ focus, die, compact = false, description = steps[focus].text }: { focus: number; die: number; compact?: boolean; description?: string }) {
  const selectedY = 230 - (die - 1) * 24;
  const coreFocus = focus >= 1 && focus <= 7;
  const hasData = [0, 6, 7, 8, 9, 10, 13].includes(focus);
  const dataPath = `M365 ${selectedY + 8} V274 H400 V321 H188 V259 H166`;
  const activePath = focus === 6 ? `M348 ${selectedY + 8} H403` : focus === 7 ? `M365 ${selectedY + 8} V274` : focus === 8 ? "M365 274 H400 V300" : focus === 9 ? "M400 300 V321 H188 V259 H166" : dataPath;
  const suffix = compact ? "compact" : "full";
  return <svg className={styles.packageSvg} viewBox={focus === 11 ? "0 0 520 410" : "18 50 484 354"} role="img" aria-label={`Schematic eight-high HBM3E stack beside a GPU. Core die ${die} selected. ${description}`}>
    <defs><marker id={`hbm-arrow-${suffix}`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="var(--hbm-data)" /></marker><marker id={`hbm-command-${suffix}`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="var(--hbm-command)" /></marker></defs>
    <g className={styles.packageBase}>
      <rect x="18" y="363" width="484" height="23" rx="2" fill="#202020" stroke="#555555" />
      <text x="39" y="379" className={styles.diagramMuted}>Package substrate</text>
      {Array.from({ length: 17 }, (_, i) => <circle key={i} cx={36 + i * 28} cy="396" r="4" fill="#666666" />)}
      <path d="M52 330 V363 M116 330 V363 M262 330 V363 M358 330 V363 M467 330 V363" stroke="#444444" strokeWidth="3" />
      <rect x="28" y="312" width="464" height="18" rx="2" fill={focus === 9 || focus === 10 ? "#343434" : "#222222"} stroke={focus === 9 ? "var(--hbm-data)" : "#666666"} />
      <path d="M39 335 V347 H169" fill="none" stroke="#777777" />
      <text x="176" y="351" className={styles.diagramMuted}>Silicon interposer · lateral routing</text>
    </g>
    <g opacity={focus === 1 || focus === 2 || focus === 3 || focus === 4 ? 0.55 : 1}>
      <rect x="48" y="229" width="156" height="58" rx="3" fill={focus === 13 ? "#343434" : "#232323"} stroke={focus === 13 ? "var(--hbm-data)" : "#777777"} />
      <text x="62" y="250" className={styles.diagramText}>Compute die</text>
      <rect x="60" y="261" width="30" height="17" fill="#333333" rx="1" /><text x="67" y="273" className={styles.diagramTiny}>L2</text>
      <rect x="97" y="261" width="57" height="17" fill="#333333" rx="1" /><text x="102" y="273" className={styles.diagramTiny}>Controller</text>
      <rect x="162" y="261" width="30" height="17" fill="#333333" rx="1" /><text x="167" y="273" className={styles.diagramTiny}>PHY</text>
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={58 + i * 12} cy="297" r="2.4" fill="var(--hbm-bump)" />)}
    </g>
    <g>
      <rect x="285" y="262" width="185" height="24" rx="1" fill={focus === 8 ? "#444444" : "#292929"} stroke={focus === 8 ? "var(--hbm-data)" : "#888888"} />
      <text x="295" y="278" className={styles.diagramText}>Base die</text><text x="432" y="278" className={styles.diagramTiny}>I/O</text>
      {Array.from({ length: 15 }, (_, i) => <circle key={i} cx={293 + i * 12} cy="297" r={focus === 12 ? 3.1 : 2.4} fill="var(--hbm-bump)" />)}
      {Array.from({ length: 8 }, (_, i) => {
        const y = 230 - i * 24;
        const selected = i + 1 === die;
        return <g key={i}>
          <rect x="285" y={y} width="185" height="16" rx="1" fill={selected && coreFocus ? "#454545" : selected ? "#383838" : "#252525"} stroke={selected && coreFocus ? "var(--hbm-data)" : "#606060"} strokeWidth={selected && coreFocus ? 1.8 : 1} />
          <text x="295" y={y + 12} className={styles.diagramDie}>DRAM {i + 1}</text>
          {[0, 1, 2, 3, 4, 5].map(b => <rect key={b} x={382 + b * 12} y={y + 4} width="7" height="8" fill={selected && focus === 4 && b % 2 === 0 ? "var(--hbm-data)" : "#777777"} opacity={selected ? 0.9 : 0.4} />)}
          {Array.from({ length: 9 }, (_, j) => <circle key={j} cx={299 + j * 20} cy={y + 21} r={focus === 12 ? 2.8 : 1.7} fill="var(--hbm-bump)" opacity={focus === 12 || focus === 7 ? 1 : 0.5} />)}
          {focus === 12 && <rect x="285" y={y + 17} width="185" height="6" fill="#9f815b" opacity=".17" />}
        </g>;
      })}
      <path d="M365 67 V281 M420 67 V281" stroke={focus === 7 ? "var(--hbm-data)" : "#aaaaaa"} strokeWidth={focus === 7 ? 3 : 1.5} opacity={focus === 7 ? 0.9 : 0.45} />
      <path d="M305 67 V281 M454 67 V281" stroke={focus === 11 ? "var(--hbm-command)" : "#777777"} strokeWidth={focus === 11 ? 3 : 1} strokeDasharray="3 4" opacity={focus === 11 ? 1 : 0.45} />
      {focus === 11 && <g className={styles.heat} fill="none" stroke="#ca9b86" strokeWidth="1.5"><path d="M324 50 Q316 41 324 32 T324 14 M372 50 Q364 41 372 32 T372 14 M422 50 Q414 41 422 32 T422 14" /><path d="M321 18 L324 12 L327 18 M369 18 L372 12 L375 18 M419 18 L422 12 L425 18" /></g>}
    </g>
    <g className={styles.diagramLeaders} fill="none" stroke="#777777" strokeWidth="1">
      <path d="M132 85 H270 L285 78" /><path d="M137 137 H260 L365 153" /><path d="M155 189 H269 L286 204" />
    </g>
    <text x="36" y="82" className={styles.diagramText}>8 core dies</text><text x="36" y="99" className={styles.diagramMuted}>8-high example</text>
    <text x="36" y="134" className={styles.diagramText}>TSV columns</text><text x="36" y="151" className={styles.diagramMuted}>through silicon</text>
    <text x="36" y="186" className={styles.diagramText}>Microbumps</text><text x="36" y="203" className={styles.diagramMuted}>between dies</text>
    {hasData && <g fill="none"><path d={dataPath} stroke="var(--hbm-data)" strokeWidth="2" opacity=".22" /><path d={activePath} stroke="var(--hbm-data)" strokeWidth="2" markerEnd={`url(#hbm-arrow-${suffix})`} /><path className={styles.flow} d={activePath} stroke="var(--hbm-data)" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 38" /></g>}
    {(focus === 0 || focus === 9) && <path className={styles.commandFlow} d={`M180 252 H220 V316 H436 V274 H420 V${selectedY + 11} H400`} fill="none" stroke="var(--hbm-command)" strokeWidth="1.3" strokeDasharray="5 5" markerEnd={`url(#hbm-command-${suffix})`} />}
    <circle cx="365" cy={selectedY + 8} r="4" fill="var(--hbm-data)" />
  </svg>;
}

function CompactPackageDrawing({ focus, die }: { focus: number; die: number }) {
  const selectedY = 8 + (8 - die) * 12;
  const path = `M298 ${selectedY + 4} V119 H323 V143 H84 V97 H66`;
  const hasData = [0, 7, 8, 9, 10, 13].includes(focus);
  return <svg viewBox="0 0 420 170" className={styles.compactSvg} role="img" aria-label={`Compact HBM3E package schematic. ${steps[focus].text}`}>
    <defs><marker id="hbm-arrow-mini" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="var(--hbm-data)" /></marker></defs>
    <rect x="10" y="136" width="399" height="14" fill="#252525" stroke="#888888" />
    <text x="12" y="167" className={styles.diagramMuted}>Interposer · lateral data path</text>
    <rect x="15" y="73" width="120" height="49" rx="2" fill={focus === 13 ? "#444444" : "#252525"} stroke="#999999" />
    <text x="26" y="94" className={styles.diagramText}>Compute die</text><text x="26" y="112" className={styles.diagramMuted}>L2 · memory I/O</text>
    <text x="14" y="19" className={styles.diagramText}>8 core DRAM dies</text><path d="M152 16 H211 L225 12" fill="none" stroke="#777777" />
    <text x="161" y="65" className={styles.diagramMuted}>TSVs →</text>
    {Array.from({ length: 8 }, (_, i) => <g key={i}><rect x="226" y={8 + i * 12} width="171" height="8" rx="1" fill={8 - i === die ? "#555555" : "#303030"} stroke={8 - i === die ? "var(--hbm-data)" : "#666666"} /><text x="382" y={15 + i * 12} className={styles.diagramTiny}>{8 - i}</text>{Array.from({ length: 6 }, (_, j) => <circle key={j} cx={238 + j * 28} cy={18 + i * 12} r="1.4" fill="var(--hbm-bump)" />)}</g>)}
    <path d="M298 10 V123 M354 10 V123" stroke="#aaaaaa" strokeWidth={focus === 7 ? 2.5 : 1} />
    <rect x="226" y="110" width="171" height="16" fill={focus === 8 ? "#555555" : "#303030"} stroke="#999999" /><text x="236" y="122" className={styles.diagramMuted}>Base die / I/O</text>
    {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={234 + i * 19} cy="131" r="1.8" fill="var(--hbm-bump)" />)}
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={24 + i * 16} cy="131" r="1.8" fill="var(--hbm-bump)" />)}
    {hasData && <><path d={path} fill="none" stroke="var(--hbm-data)" strokeWidth="1.8" markerEnd="url(#hbm-arrow-mini)" /><path className={styles.flow} d={path} fill="none" stroke="var(--hbm-data)" strokeWidth="4" strokeDasharray="1 32" strokeLinecap="round" /></>}
    <circle cx="298" cy={selectedY + 4} r="3" fill="var(--hbm-data)" />
  </svg>;
}

function CellDrawing() {
  return <svg viewBox="0 0 420 150" className={styles.detailSvg} role="img" aria-label="One DRAM cell: wordline controls an access transistor between the bitline and a storage capacitor.">
    <text x="14" y="28" className={styles.diagramText}>One bit</text>
    <path d="M160 22 H393 M190 22 V53 H183 V79 H190 V104 M170 104 H210 M170 112 H210 M190 112 V133 M175 133 H205" stroke="var(--hbm-data)" fill="none" strokeWidth="2" />
    <path d="M14 67 H169 M170 53 V81" stroke="var(--hbm-command)" strokeWidth="2" />
    <text x="15" y="59" className={styles.diagramMuted}>Wordline</text><text x="303" y="16" className={styles.diagramMuted}>Bitline</text>
    <text x="230" y="69" className={styles.diagramText}>Access transistor</text><text x="230" y="111" className={styles.diagramText}>Storage capacitor</text>
    <path d="M217 108 H222" stroke="#888888" /><circle className={styles.cellCharge} cx="190" cy="109" r="9" fill="var(--hbm-data)" opacity=".2" />
  </svg>;
}

function ArrayDrawing({ focus, rowState = "open" }: { focus: number; rowState?: RowState }) {
  const active = !(focus === 2 && rowState === "precharged");
  const description = focus === 4 ? "Four banks overlap work while sharing an output bus." : focus === 2 && rowState === "precharged" ? "A precharged subarray: wordlines are off, cells retain their charge, and bitlines are equalized. No open row is held in the sense amplifiers." : "A small example subarray: an activated wordline selects cells; sense amplifiers hold the row; column selection chooses part of it.";
  return <svg viewBox="0 0 420 154" className={styles.detailSvg} role="img" aria-label={description}>
    {focus === 4 ? <>
      {[0, 1, 2, 3].map(i => <g key={i}><rect x={18 + i * 100} y="16" width="82" height="65" rx="2" fill={i % 2 === 0 ? "#414141" : "#272727"} stroke={i % 2 === 0 ? "var(--hbm-data)" : "#666666"} /><text x={28 + i * 100} y="38" className={styles.diagramText}>Bank {i}</text><text x={28 + i * 100} y="61" className={styles.diagramTiny}>{["READ", "ACTIVATE", "READY", "PRECHARGE"][i]}</text><path d={`M${59 + i * 100} 82 V106`} stroke="var(--hbm-data)" /></g>)}
      <path d="M59 106 H360 V126 H401" fill="none" stroke="var(--hbm-data)" strokeWidth="2" /><text x="21" y="143" className={styles.diagramMuted}>Overlapping work → shared channel data path</text>
    </> : <>
      {[0, 1, 2].map(row => <g key={row}><path d={`M17 ${25 + row * 23} H281`} stroke={row === 1 && active ? "var(--hbm-command)" : "#555555"} />{Array.from({ length: 12 }, (_, col) => <rect key={col} x={62 + col * 18} y={17 + row * 23} width="13" height="14" rx="1" fill={row === 1 && active ? focus === 3 && col >= 4 && col < 8 ? "var(--hbm-command)" : "#555555" : "#333333"} stroke={row === 1 && active ? "#aaaaaa" : "#555555"} />)}</g>)}
      {Array.from({ length: 12 }, (_, col) => <g key={col}><path d={`M${68 + col * 18} 12 V96`} stroke="#777777" opacity=".5" /><rect x={62 + col * 18} y="96" width="13" height="14" fill={active ? "#555555" : "#333333"} /><text x={65 + col * 18} y="107" className={styles.diagramTiny}>{active ? col % 3 === 0 ? "1" : "0" : "·"}</text></g>)}
      <text x="18" y="87" className={styles.diagramTiny}>Sense amplifiers</text><path d="M134 111 V126 H320 V63 H393" stroke={focus === 3 ? "var(--hbm-command)" : "var(--hbm-data)"} opacity={active ? 1 : .25} strokeWidth="2" fill="none" /><rect x="301" y="48" width="39" height="29" fill="#333333" stroke="#999999" /><text x="306" y="67" className={styles.diagramTiny}>Mux</text><text x="350" y="52" className={styles.diagramTiny}>Read path</text><text x="17" y="148" className={styles.diagramMuted}>{focus === 3 ? "Select columns from the open row" : !active ? "Wordline off · bitlines equalized · stored bits retained" : rowState === "sensing" ? "ACTIVATE → share charge → sense → restore" : "Open row held in sense amplifiers · READ comes next"}</text>
    </>}
  </svg>;
}

function ChannelsDrawing({ burst = false }: { burst?: boolean }) {
  return <svg viewBox="0 0 420 138" className={styles.detailSvg} role="img" aria-label={burst ? "Eight four-byte data beats make one 32-byte pseudo-channel burst." : "Sixteen 64-bit channels, each split into two 32-bit pseudo-channels."}>
    {burst ? <>{Array.from({ length: 8 }, (_, i) => <g key={i}><rect x={14 + i * 49} y="30" width="40" height="43" fill="#444444" stroke="#aaaaaa" /><text x={24 + i * 49} y="56" className={styles.diagramText}>4 B</text><text x={29 + i * 49} y="92" className={styles.diagramTiny}>{i + 1}</text></g>)}<text x="14" y="123" className={styles.diagramMuted}>8 data beats × 4 bytes = 32-byte burst</text></> : <>{Array.from({ length: 16 }, (_, i) => <g key={i}><rect x={15 + i * 25} y="17" width="19" height="62" fill="none" stroke="#777777" /><rect x={18 + i * 25} y="22" width="5" height="51" fill="#cccccc" /><rect x={26 + i * 25} y="22" width="5" height="51" fill="#baa38e" /><text x={18 + i * 25} y="96" className={styles.diagramTiny}>{i}</text></g>)}<text x="15" y="126" className={styles.diagramMuted}>16 channels · 2 pseudo-channels each · 1,024 data bits</text></>}
  </svg>;
}


function TsvDrawing() {
  return <svg viewBox="0 0 420 170" className={`${styles.detailSvg} ${styles.detailSvgLarge}`} role="img" aria-label="Cross-section of two stacked dies: a copper TSV runs through each die, ends in a contact pad, and a microbump joins it to the die below. Underfill fills the gap.">
    {[0, 1].map(d => { const y = 18 + d * 70; return <g key={d}>
      <rect x="20" y={y} width="270" height="44" fill="#2b2b2b" stroke="#666666" />
      <text x="26" y={y + 16} className={styles.diagramTiny}>{d === 0 ? "die n+1" : "die n"}</text>
      {[90, 150, 210].map(x => <g key={x}><rect x={x} y={y} width="10" height="44" fill="#9a6b45" /><rect x={x - 1.5} y={y} width="1.5" height="44" fill="#bbbbbb" /><rect x={x + 10} y={y} width="1.5" height="44" fill="#bbbbbb" /><rect x={x - 5} y={y + 44} width="20" height="4" fill="#c9c9c9" /></g>)}
    </g>; })}
    <rect x="20" y="66" width="270" height="22" fill="#3a332b" opacity=".7" />
    {[90, 150, 210].map(x => <ellipse key={x} cx={x + 5} cy="77" rx="9" ry="8" fill="var(--hbm-bump)" />)}
    <path d="M95 18 V150" stroke="var(--hbm-data)" strokeWidth="2" strokeDasharray="1 9" className={styles.flow} />
    <g className={styles.diagramTiny}>
      <path d="M220 40 H300" stroke="#777777" /><text x="304" y="44" className={styles.diagramTiny}>TSV: copper column</text>
      <path d="M223 63 H300" stroke="#777777" /><text x="304" y="67" className={styles.diagramTiny}>contact pad</text>
      <path d="M224 78 H300" stroke="#777777" /><text x="304" y="82" className={styles.diagramTiny}>microbump (solder)</text>
      <path d="M262 86 H300" stroke="#777777" /><text x="304" y="98" className={styles.diagramTiny}>underfill: holds joints,</text><text x="304" y="110" className={styles.diagramTiny}>carries heat out</text>
      <text x="304" y="20" className={styles.diagramTiny}>thin insulating liner</text><path d="M211 18 L300 17" stroke="#777777" />
    </g>
    <text x="20" y="164" className={styles.diagramMuted}>Straight down through the area, not around the edge</text>
  </svg>;
}

function BaseDieDrawing() {
  return <svg viewBox="0 0 420 170" className={`${styles.detailSvg} ${styles.detailSvgLarge}`} role="img" aria-label="Top view of the base die: a PHY strip along the edge facing the GPU, TSV arrays in the middle for data, command and power, a power grid across the die, and probe pads for wafer testing.">
    <rect x="20" y="12" width="300" height="140" fill="#242424" stroke="#888888" />
    {Array.from({ length: 9 }, (_, i) => <path key={`h${i}`} d={`M20 ${26 + i * 14} H320`} stroke="#3a3a3a" />)}
    {Array.from({ length: 13 }, (_, i) => <path key={`v${i}`} d={`M${34 + i * 22} 12 V152`} stroke="#3a3a3a" />)}
    <rect x="20" y="12" width="40" height="140" fill="#3b3b3b" stroke="var(--hbm-data)" /><text x="40" y="86" textAnchor="middle" className={styles.diagramTiny} transform="rotate(-90 40 86)">PHY → toward GPU</text>
    {[0, 1, 2].map(r => <g key={r}>{Array.from({ length: 4 }, (_, c) => <g key={c}>{Array.from({ length: 9 }, (_, k) => <circle key={k} cx={92 + c * 52 + (k % 3) * 7} cy={36 + r * 40 + Math.floor(k / 3) * 7} r="1.7" fill={r === 1 ? "var(--hbm-command)" : r === 2 ? "#b56b5b" : "var(--hbm-data)"} />)}</g>)}</g>)}
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={286} y={20 + i * 22} width="20" height="12" fill="#555555" stroke="#aaaaaa" />)}
    <text x="330" y="40" className={styles.diagramTiny}>TSV arrays:</text>
    <text x="330" y="54" fill="var(--hbm-data)" className={styles.diagramTiny}>● data</text>
    <text x="330" y="68" fill="var(--hbm-command)" className={styles.diagramTiny}>● cmd / address</text>
    <text x="330" y="82" fill="#b56b5b" className={styles.diagramTiny}>● power / ground</text>
    <text x="330" y="104" className={styles.diagramTiny}>▭ probe pads</text>
    <text x="330" y="118" className={styles.diagramTiny}>(wafer test)</text>
    <text x="330" y="140" className={styles.diagramTiny}># power grid</text>
    <text x="20" y="166" className={styles.diagramMuted}>The controller is not here: it lives on the GPU</text>
  </svg>;
}

function InterposerDrawing() {
  return <svg viewBox="0 0 420 170" className={`${styles.detailSvg} ${styles.detailSvgLarge}`} role="img" aria-label="Side view: GPU and HBM stack sit on a silicon interposer; many fine traces connect them. Below, a PCB fits far fewer, wider traces in the same width.">
    <rect x="20" y="14" width="120" height="34" fill="#2c2c2c" stroke="#888888" /><text x="30" y="35" className={styles.diagramText}>GPU</text>
    <rect x="280" y="8" width="120" height="40" fill="#2c2c2c" stroke="#888888" /><text x="290" y="33" className={styles.diagramText}>HBM stack</text>
    <rect x="12" y="52" width="396" height="34" fill="#202020" stroke="#777777" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${66 + i * 5} 52 V${57 + i * 2.2} H${292 + i * 5} V48`} fill="none" stroke={i % 3 === 0 ? "var(--hbm-command)" : "var(--hbm-data)"} strokeWidth=".9" opacity=".9" />)}
    {Array.from({ length: 12 }, (_, i) => <circle key={`b${i}`} cx={66 + i * 5} cy="50" r="1.4" fill="var(--hbm-bump)" />)}
    {Array.from({ length: 12 }, (_, i) => <circle key={`c${i}`} cx={292 + i * 5} cy="50" r="1.4" fill="var(--hbm-bump)" />)}
    <text x="150" y="99" className={styles.diagramTiny}>silicon interposer: fine traces, ~mm long</text>
    <rect x="12" y="116" width="396" height="26" fill="#1f2a20" stroke="#556b55" />
    {[0, 1, 2].map(i => <path key={i} d={`M60 ${122 + i * 7} H360`} stroke="#9fb39f" strokeWidth="3" />)}
    <text x="20" y="160" className={styles.diagramMuted}>Same width on a PCB: far fewer, wider traces</text>
  </svg>;
}

function DetailDrawing({ focus, rowState }: { focus: number; rowState?: RowState }) {
  if (focus === 1) return <CellDrawing />;
  if (focus === 7) return <TsvDrawing />;
  if (focus === 8) return <BaseDieDrawing />;
  if (focus === 9) return <InterposerDrawing />;
  if (focus >= 2 && focus <= 4) return <ArrayDrawing focus={focus} rowState={rowState} />;
  if (focus === 5 || focus === 10) return <ChannelsDrawing />;
  if (focus === 6) return <ChannelsDrawing burst />;
  return <div className={styles.detailText}>
    <p>{focus === 7 ? "TSV ≠ microbump" : focus === 8 ? "The controller is on the host side" : focus === 9 || focus === 13 ? "A local connection inside the package" : focus === 11 ? "Data paths also have a power cost" : focus === 12 ? "8-high = 8 DRAM dies + a base die" : "Two kinds of stacking"}</p>
    <span>{focus === 7 ? "Through the silicon → across the joint → through the next layer." : focus === 8 ? "Scheduling commands and executing them are different jobs." : focus === 9 || focus === 13 ? "HBM I/O → interposer → GPU I/O. No PCIe hop." : focus === 11 ? "Ptransfer = actual bits/s × joules/bit. Total power includes more." : focus === 12 ? "Core-die count is not the total silicon-layer count." : "3D within the memory stack. 2.5D beside the processor."}</span>
  </div>;
}

export function HbmExperience({ children, contentRevision }: { children: ReactNode; contentRevision?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const aside = useRef<HTMLElement>(null);
  const [focus, setFocus] = useState(0);
  const [rowState, setRowState] = useState<RowState>("open");
  const [organizationLevel, setOrganizationLevel] = useState<OrganizationLevel>("cell");
  const memorySelection: MemorySelection = { channel: 3, pseudo: 0, rank: 0, group: 1, bank: 2 };
  const die = 5;
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const rail = aside.current;
    const body = container.current;
    if (!rail || !body) return;
    const updateOffset = () => body.style.setProperty("--hbm-scroll-offset", `${Math.ceil(rail.getBoundingClientRect().height) + 28}px`);
    updateOffset();
    const observer = new ResizeObserver(updateOffset);
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const paragraphs = Array.from(container.current?.querySelectorAll<HTMLElement>("[data-paragraph]") ?? []);
    let frame = 0;
    let previous: HTMLElement | undefined;
    const measure = () => {
      frame = 0;
      const mobile = window.innerWidth < 1020;
      const target = mobile ? Math.max((aside.current?.getBoundingClientRect().bottom ?? 0) + 28, window.innerHeight * 0.38) : window.innerHeight * 0.33;
      let selected = paragraphs[0];
      for (const paragraph of paragraphs) {
        // A mobile hash jump can land just below the reading line as the rail changes height.
        const headingLead = mobile && paragraph.tagName === "H2" ? 48 : 0;
        if (paragraph.getBoundingClientRect().top <= target + headingLead) selected = paragraph;
        else break;
      }
      if (!selected) return;
      if (previous !== selected) {
        previous?.removeAttribute("data-reading");
        selected.setAttribute("data-reading", "true");
        previous = selected;
      }
      const next = Number(selected.dataset.focus);
      const nextRowState: RowState = selected.dataset.rowState === "precharged" ? "precharged" : selected.dataset.rowState === "sensing" ? "sensing" : "open";
      const nextOrganizationLevel = organizationLevels.find(level => level.id === selected.dataset.organizationLevel)?.id ?? organizationLevelForFocus(next);
      setFocus(next); setRowState(nextRowState); setOrganizationLevel(nextOrganizationLevel);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); cancelAnimationFrame(frame); previous?.removeAttribute("data-reading"); };
  }, [contentRevision]);

  const scene = focus === 2 ? rowScenes[rowState] : steps[focus];
  const organizationActive = focus >= 1 && focus <= 6;
  const organizationScene = organizationLevels.find(level => level.id === organizationLevel)!;
  const organizationProps = { level: organizationLevel, selection: memorySelection, rowState, motionPaused: paused || reduced };
  return <div ref={container} className={styles.bodyGrid}>
    <article className={styles.article}>{children}</article>
    <aside ref={aside} className={styles.visualRail} aria-label="HBM stack explorer" data-focus-step={focus} data-organization-level={organizationActive ? organizationLevel : undefined} data-row-state={focus === 2 ? rowState : undefined} data-motion={paused || reduced ? "paused" : "running"}>
      <div className={styles.visualHeading}><div className={styles.sceneTitle}><h2 aria-live="polite">{organizationActive && focus !== 2 ? organizationScene.label : scene.title}</h2></div></div>
      <div className={styles.desktopDrawing}>{organizationActive ? <HbmOrganization {...organizationProps} /> : <><PackageDrawing focus={focus} die={die} description={scene.text} />{[7, 8, 9, 10].includes(focus) && <div className={styles.detailDrawing}><DetailDrawing focus={focus} rowState={rowState} /></div>}</>}</div>
      <div className={styles.compactDrawing}>{organizationActive ? <HbmOrganization {...organizationProps} compact /> : <CompactPackageDrawing focus={focus} die={die} />}</div>
      <p className={`${styles.sceneCaption} ${organizationActive ? styles.organizationCaption : ""}`}>{organizationActive && focus !== 2 ? organizationScene.text : scene.text}</p>
      <div className={styles.diagramLegend}><span><i className={styles.dataKey} />Read data</span><span><i className={styles.commandKey} />Command / address</span></div>
      <div className={styles.diagramFooter}><button type="button" className={styles.pauseButton} disabled={reduced} aria-pressed={paused || reduced} onClick={() => setPaused(!paused)}>{reduced ? "Motion off" : paused ? "Animate" : "Pause motion"}</button></div>
      <p className={styles.diagramNote}>Not to scale. One representative path; markers indicate direction, not transfer time. {reduced ? "System reduced-motion preference is on." : ""}</p>
    </aside>
  </div>;
}
