"use client";

import { useState } from "react";
import styles from "./article.module.css";

export function BurstFigure() {
  const [beat, setBeat] = useState(8);
  return <figure className={styles.lab} aria-labelledby="burst-title">
    <h3 id="burst-title">One 32-byte burst</h3>
    <div className={styles.beats} aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <div key={i} data-filled={i < beat}><span>{i + 1}</span><b>4 B</b></div>)}</div>
    <label className={styles.rangeLabel} htmlFor="burst-beat">Data beats <output htmlFor="burst-beat">{beat} of 8 · {beat * 4} bytes transferred</output></label>
    <input id="burst-beat" type="range" min="0" max="8" value={beat} onChange={e => setBeat(Number(e.target.value))} />
    <figcaption>Each beat carries four bytes on one 32-bit pseudo-channel. Move the slider to build the burst. Beat spacing here is illustrative.</figcaption>
  </figure>;
}

export function BandwidthLab() {
  const [rate, setRate] = useState(9.6);
  const [stacks, setStacks] = useState(1);
  const [height, setHeight] = useState(8);
  const [utilization, setUtilization] = useState(80);
  const perStack = 1024 * rate / 8 / 1000;
  const aggregate = perStack * stacks;
  return <figure className={styles.lab} aria-labelledby="bandwidth-lab-title">
    <h3 id="bandwidth-lab-title">Change the levers independently</h3>
    <div className={styles.labControls}>
      <div><label className={styles.rangeLabel} htmlFor="pin-rate">Data rate per pin <output htmlFor="pin-rate">{rate.toFixed(1)} Gb/s</output></label><input id="pin-rate" type="range" min="6.4" max="9.6" step="0.2" value={rate} onChange={e => setRate(Number(e.target.value))} /></div>
      <div><label className={styles.rangeLabel} htmlFor="stack-count">Complete stacks <output htmlFor="stack-count">{stacks}</output></label><input id="stack-count" type="range" min="1" max="8" value={stacks} onChange={e => setStacks(Number(e.target.value))} /></div>
      <div className={styles.selectRow}><label htmlFor="stack-height">Core dies per stack</label><select id="stack-height" value={height} onChange={e => setHeight(Number(e.target.value))}><option value="8">8-high</option><option value="12">12-high</option></select></div>
      <div><label className={styles.rangeLabel} htmlFor="bandwidth-utilization">Assumed utilization <output htmlFor="bandwidth-utilization">{utilization}%</output></label><input id="bandwidth-utilization" type="range" min="10" max="100" step="5" value={utilization} onChange={e => setUtilization(Number(e.target.value))} /></div>
    </div>
    <dl className={styles.results} aria-live="polite"><div><dt>Interface width / stack</dt><dd>1,024 bits</dd></div><div><dt>Capacity · vendor labels</dt><dd>{height * 3 * stacks} GB</dd></div><div><dt>Peak / stack</dt><dd>{perStack.toFixed(4)} TB/s</dd></div><div><dt>Aggregate peak</dt><dd>{aggregate.toFixed(4)} TB/s</dd></div><div className={styles.resultEmphasis}><dt>At the assumed utilization</dt><dd>{(aggregate * utilization / 100).toFixed(4)} TB/s</dd></div></dl>
    <figcaption>24Gb core-die example. Height changes capacity, not interface width. Rates between slider endpoints are mathematical examples, not a list of qualified speed bins. Aggregate rates assume the processor supports every stack; utilization is an input, not a prediction.</figcaption>
  </figure>;
}

export function PowerLab() {
  const [width, setWidth] = useState(1);
  const [rateRatio, setRateRatio] = useState(1);
  const [energy, setEnergy] = useState(1);
  const bandwidthRatio = width * rateRatio;
  const powerRatio = bandwidthRatio * energy;
  return <figure className={styles.lab} aria-labelledby="power-lab-title">
    <h3 id="power-lab-title">Wider does not automatically mean lower power</h3>
    <p className={styles.labIntro}>A hypothetical interface comparison at full utilization. Choose ratios relative to the old design.</p>
    <div className={styles.labControls}>
      <div><label className={styles.rangeLabel} htmlFor="width-ratio">Data-pin count <output htmlFor="width-ratio">{width.toFixed(2)}×</output></label><input id="width-ratio" type="range" min="1" max="2" step="0.25" value={width} onChange={e => setWidth(Number(e.target.value))} /></div>
      <div><label className={styles.rangeLabel} htmlFor="rate-ratio">Per-pin data rate <output htmlFor="rate-ratio">{rateRatio.toFixed(2)}×</output></label><input id="rate-ratio" type="range" min="0.5" max="1" step="0.05" value={rateRatio} onChange={e => setRateRatio(Number(e.target.value))} /></div>
      <div><label className={styles.rangeLabel} htmlFor="energy-ratio">Energy per transferred bit <output htmlFor="energy-ratio">{energy.toFixed(2)}×</output></label><input id="energy-ratio" type="range" min="0.5" max="1.5" step="0.05" value={energy} onChange={e => setEnergy(Number(e.target.value))} /></div>
    </div>
    <div className={styles.presets}><button type="button" onClick={() => { setWidth(2); setRateRatio(0.5); setEnergy(1); }}>2× pins, ½ rate</button><button type="button" onClick={() => { setWidth(2); setRateRatio(0.5); setEnergy(0.8); }}>Also lower energy/bit by 20%</button></div>
    <dl className={styles.results} aria-live="polite"><div><dt>Bandwidth ratio · N × r</dt><dd>{bandwidthRatio.toFixed(2)}×</dd></div><div className={styles.resultEmphasis}><dt>Transfer-power ratio · B × Ebit</dt><dd>{powerRatio.toFixed(2)}×</dd></div></dl>
    <figcaption>Same defined transfer boundary in both designs. Energy/bit is an independent assumption: reducing pin rate does not determine it. Background, refresh and core-array power are outside this comparison.</figcaption>
  </figure>;
}

export function CoalescingLab() {
  const [stride, setStride] = useState(1);
  const addresses = Array.from({ length: 32 }, (_, thread) => thread * stride * 4);
  const touched = Array.from(new Set(addresses.map(address => Math.floor(address / 32))));
  const totalSectors = Math.ceil((addresses[31] + 4) / 32);
  const transferred = touched.length * 32;
  return <figure className={styles.lab} aria-labelledby="coalescing-title">
    <h3 id="coalescing-title">Same 128 useful bytes. Different traffic.</h3>
    <div className={styles.selectRow}><label htmlFor="load-stride">Stride between thread addresses</label><select id="load-stride" value={stride} onChange={e => setStride(Number(e.target.value))}><option value="1">1 float · contiguous</option><option value="2">2 floats</option><option value="4">4 floats</option><option value="8">8 floats · one sector each</option></select></div>
    <div className={styles.sectors} aria-hidden="true">{Array.from({ length: totalSectors }, (_, sector) => <div key={sector} className={styles.sector}>{Array.from({ length: 8 }, (_, slot) => <span key={slot} data-used={addresses.includes(sector * 32 + slot * 4)} />)}</div>)}</div>
    <div className={styles.sectorLegend}>Each outlined group is a 32-byte sector; each filled slot is a requested four-byte float.</div>
    <dl className={styles.results} aria-live="polite"><div><dt>Useful payload</dt><dd>128 B</dd></div><div><dt>Touched sectors</dt><dd>{touched.length}</dd></div><div><dt>Sector bytes fetched</dt><dd>{transferred} B</dd></div><div className={styles.resultEmphasis}><dt>Useful fraction</dt><dd>{(128 / transferred * 100).toFixed(1)}%</dd></div></dl>
    <figcaption>Aligned start, 32 active threads, no cache reuse, one distinct float per thread. Sector accounting only; this is not a simulation of HBM bus scheduling or internal ECC traffic.</figcaption>
  </figure>;
}
