/* eslint-disable @next/next/no-html-link-for-pages */
import { HBM3E_POST } from "@/data/blogs";
import type { ArticleDocument, Block } from "./content";
import { ArticleMarkdown } from "./article-markdown";
import { HbmExperience } from "./hbm-experience";
import { BandwidthLab, PowerLab, BurstFigure, CoalescingLab } from "./article-tools";
import katex from "katex";
import styles from "./article.module.css";

const tex = (line: string) => katex.renderToString(line, { displayMode: true, throwOnError: false, trust: false, output: "htmlAndMathml" });

function ArticleBlock({ block, focus, definitions }: { block: Block; focus: number; definitions: string }) {
  return <div data-focus={block.focus ?? focus} data-row-state={block.rowState} data-organization-level={block.organizationLevel} data-paragraph={block.id} className={block.type === "p" ? styles.paragraph : styles.inlineFigure}>
    {block.type === "p" ? <ArticleMarkdown text={block.text} definitions={definitions} /> : <Figure block={block} />}
  </div>;
}

function Figure({ block }: { block: Exclude<Block, { type: "p" }> }) {
  switch (block.type) {
    case "memory-interfaces": return <figure className={styles.channelFigure} aria-labelledby="memory-interfaces-title"><div className={styles.tableScroll}><table><caption id="memory-interfaces-title">Width and pin rate do different jobs</caption><thead><tr><th scope="col">Historical example</th><th scope="col">Data width</th><th scope="col">Gb/s per pin</th><th scope="col">Peak GB/s</th></tr></thead><tbody><tr><th scope="row">LPDDR4, x32</th><td>2 × 16 bits</td><td>3.2</td><td>12.8</td></tr><tr><th scope="row">GDDR5 chip</th><td>32 bits</td><td>8</td><td>32</td></tr><tr><th scope="row">HBM1 stack</th><td>1,024 bits</td><td>1</td><td>128</td></tr></tbody></table></div><figcaption>One x32 LPDDR4 device, one GDDR5 chip, and one HBM1 stack at the stated rates. Width × pin rate ÷ 8 gives peak GB/s; a complete system can use several devices. <a href="#source-11">[11]</a> <a href="#source-12">[12]</a> <a href="#source-13">[13]</a> <a href="#source-14">[14]</a></figcaption></figure>;
    case "equation": return <figure className={styles.equation}><div>{block.lines.map(line => <div key={line} className={styles.equationLine} dangerouslySetInnerHTML={{ __html: tex(line) }} />)}</div>{block.note && <figcaption>{block.note}</figcaption>}</figure>;
    case "channels": return <figure className={styles.channelFigure}><div className={styles.tableScroll}><table><caption>Same width, different organization</caption><thead><tr><th scope="col">Per stack</th><th scope="col">HBM2 / HBM2E</th><th scope="col">HBM3 / HBM3E</th></tr></thead><tbody><tr><th scope="row">Data interface</th><td>1,024 bits</td><td>1,024 bits</td></tr><tr><th scope="row">Channels</th><td>8 × 128 bits</td><td>16 × 64 bits</td></tr><tr><th scope="row">Pseudo-channels</th><td>16 × 64 bits</td><td>32 × 32 bits</td></tr><tr><th scope="row">Burst per pseudo-channel</th><td>4 × 8 B = 32 B</td><td>8 × 4 B = 32 B</td></tr></tbody></table></div><figcaption>Interface widths and normal pseudo-channel bursts. These are not the number of physical die layers. <a href="#source-2">[2]</a></figcaption></figure>;
    case "burst": return <BurstFigure />;
    case "bandwidth": return <BandwidthLab />;
    case "power": return <PowerLab />;
    case "coalescing": return <CoalescingLab />;
    case "read-path": return <figure className={styles.readPath}><p>One read, end to end</p><ol>{["Selected cells", "Sense amplifiers / row buffer", "Column selection", "Channel read path", "TSVs + die joints", "Base-die I/O", "Interposer traces", "GPU memory interface", "Cache / waiting consumer"].map(x => <li key={x}>{x}</li>)}</ol><figcaption>Logical and physical steps combined. Operations overlap across requests; this is not a cycle-accurate timing diagram.</figcaption></figure>;
  }
}

export function ArticleView({ article, editable = false }: { article: ArticleDocument; editable?: boolean }) {
  const { intro, sections, references, wordCount } = article;
  return <main className={styles.page}>
    <a className={styles.skip} href="#article-body">Skip to article</a>
    <nav className={styles.topNav} aria-label="Article navigation"><div className={styles.breadcrumb}><a href="/">Ishaan Goyal</a><span aria-hidden="true">/</span><a href="/blogs">Blogs</a></div><div className={styles.editNav}>{editable && <a href="/blogs/inside-hbm3e/edit">Edit</a>}<a href="#sources">Sources</a></div></nav>
    <header className={styles.articleHeader}>
      <div className={styles.byline}>Ishaan Goyal <span aria-hidden="true">/</span> <time dateTime={HBM3E_POST.date}>{HBM3E_POST.dateLabel}</time> <span aria-hidden="true">/</span> {Math.ceil(wordCount / 220)} min read</div>
      <h1>{article.title}</h1>
      <p className={styles.subtitle}>The core DRAM dies, the base die, and everything connecting them.</p>
    </header>
    <HbmExperience contentRevision={article.contentKey}>
      <div id="article-body" className={styles.prose}>
        <div className={styles.opening}>{intro.map(block => <ArticleBlock key={block.id} block={block} focus={0} definitions={article.definitions} />)}</div>
        <noscript><p className={styles.noScript}>The full article, diagrams and worked examples are visible below. Scroll-following and interactive controls require JavaScript.</p></noscript>
        <details className={styles.contents}><summary>In this article <span>{sections.length} parts</span></summary><ol>{sections.map(s => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ol></details>
        {sections.map(section => <section key={section.id} id={section.id} className={styles.articleSection} aria-labelledby={`${section.id}-title`}>
          <h2 id={`${section.id}-title`} data-focus={section.focus} data-paragraph={`${section.id}-heading`}>{section.title}</h2>
          {section.blocks.map(block => <ArticleBlock key={block.id} block={block} focus={section.focus} definitions={article.definitions} />)}
        </section>)}
        <section id="sources" className={`${styles.articleSection} ${styles.sources}`} aria-labelledby="sources-title"><h2 id="sources-title">Sources & further reading</h2><p>This piece grew out of my HBM and GPU notes. The sources below ground generation-specific numbers and the hardware details. The diagrams are explanatory schematics, not vendor die layouts; moving markers show direction, not latency or measured signal timing.</p><ol>{references.map(ref => <li key={ref.id} id={`source-${ref.id}`}><a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title} ↗</a><ArticleMarkdown text={ref.detail} definitions={article.definitions} /></li>)}</ol></section>
      </div>
    </HbmExperience>
    <footer className={styles.footer}><a href="/blogs">← All blogs</a><a href="#">Back to the top ↑</a><button className="motion-toggle" type="button" aria-pressed="false">Pause background</button></footer>
  </main>;
}
