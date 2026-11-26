/* Full-page navigation preserves the portfolio background script's lifecycle. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { ModeToggle } from "@/components/mode-toggle";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { JENS_SON_POST as post } from "@/data/blogs";
import {
  ArchitectureDiagram, MatrixUnitDiagram, PrefillProfilingChart, TimingChart, TokensPerDollarChart, VectorUnitDiagram,
} from "./charts";
import { ContextSweepChart, DeltaNetVsAttentionChart, MatrixBreakdownChart, UnitShareChart, VectorBreakdownChart } from "./perf-charts";
import { ArticleContents } from "../article-contents";
import layout from "../article-contents.module.css";
import styles from "./article.module.css";

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blogs/${post.slug}` },
  openGraph: {
    title: `${post.title} | Ishaan Goyal`, description: post.description,
    type: "article", authors: ["Ishaan Goyal"], publishedTime: post.date,
    url: `/blogs/${post.slug}`,
    images: [{ url: "/blog-assets/jens-son/header.webp", width: 1600, height: 900, alt: "Jen's Son floorplan art" }],
  },
};

// The markdown marks each chart as an image whose src is "#chart=<key>".
const CHARTS: Record<string, ComponentType> = {
  "tokens-per-dollar": TokensPerDollarChart,
  architecture: ArchitectureDiagram,
  "matrix-unit": MatrixUnitDiagram,
  "vector-unit": VectorUnitDiagram,
  "prefill-profiling": PrefillProfilingChart,
  timing: TimingChart,
  "unit-share": UnitShareChart,
  "vector-ops": VectorBreakdownChart,
  "matrix-ops": MatrixBreakdownChart,
  "deltanet-vs-attention": DeltaNetVsAttentionChart,
  "context-sweep": ContextSweepChart,
};

// Sections a skimmer can skip. Each folds behind a dropdown whose teaser still gives the headline.
// Everything else (the goal, the numbers, the architecture overview, the verdict) stays open.
const FOLDS: Record<string, string> = {
  "Why batch 1?": "One person running a model locally, so memory bandwidth, not arithmetic, sets the speed.",
  "Why one model?": "Fixed shapes and fixed weights let every buffer, schedule and memory layout be planned ahead.",
  "Why Qwen3.5-9B?": "The strongest open model under 10B, with cheap linear-attention layers and a built-in draft head.",
  "Spec sheet": "1 GHz, a 1,024 × 64 int8 matrix unit, 512 fp32 vector lanes, 512 GB/s of GDDR7, a 33–43 mm² die.",
  "The DeltaNet unit": "Runs the memory update of the 24 DeltaNet layers on the vector lanes, four heads interleaved so the FMA pipeline never stalls, with rollback for speculation.",
  "Inside the matrix unit": "1,024 weight lanes × 64 token rows. 4-bit codes become int8 weights in each lane, multiplies are exact, and each output is rounded once per 1,024 products. Decode uses 1 row, speculative verify 4, prefill all 64.",
  "Inside the vector unit": "512 fp32 lanes where one fused multiply-add does every elementwise op; exp, sigmoid, 1/x and 1/√x are a small table plus Newton steps on the same lanes.",
  "The instruction set and the software stack": "Coarse 4-slot bundles: about 44,000 per speculative step instead of about 12.7 million.",
  "How I tested it": "A golden model, a functional simulator and the RTL that agree bit for bit, and a timing simulator checked against the RTL command by command.",
  "Speculation, checked on a real GPU": "Measured acceptance is 2.45–3.68 tokens per step, about 240 tok/s on Jen's Son at 32K.",
  "Die area": "33–43 mm² at a 6 nm-class node, about half of it the memory interface.",
  "Power": "About 30 W for the card while decoding, well inside the 75 W slot limit.",
  "Price": "About $135–152 to build the 8 GB card, and memory is about 60% of that.",
};

type Section = { level: 0 | 2 | 3; title: string; body: string };

// Split the post at its ## and ### headings so each section can be folded or left open.
function sections(markdown: string): Section[] {
  const out: Section[] = [{ level: 0, title: "", body: "" }];
  for (const line of markdown.split("\n")) {
    const heading = line.match(/^(##|###) (.+)$/);
    if (heading) out.push({ level: heading[1].length as 2 | 3, title: heading[2], body: "" });
    else out[out.length - 1].body += line + "\n";
  }
  return out;
}

function anchor(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function JensSonPage() {
  const source = await readFile(path.join(process.cwd(), "content/blogs/jens-son.md"), "utf8");
  const withoutTitle = source.replace(/^# .*\n/, "");
  const subtitle = withoutTitle.match(/^\n\*([^\n]+)\*\n/)?.[1] ?? post.description;
  const markdown = withoutTitle.replace(/^\n\*[^\n]+\*\n/, "");
  // The contents list shows only the open sections; folded ones are details a skimmer can skip.
  const contents = Array.from(markdown.matchAll(/^## (.+)$/gm)).filter(match => !(match[1] in FOLDS)).map(match => ({ title: match[1], id: anchor(match[1]) }));
  const minutes = Math.ceil(source.split(/\s+/).length / 220);

  return <main className={styles.page}>
    <a className={styles.skip} href="#article-body">Skip to article</a>
    <nav className={styles.topNav} aria-label="Article navigation">
      <div className={styles.breadcrumb}><a href="/">← Ishaan Goyal</a><span aria-hidden="true">/</span><a href="/blogs">Writing</a></div>
      <ModeToggle className="blog-theme-toggle" />
    </nav>
    <div className={layout.layout}>
      <header className={styles.header}>
        <div className={styles.byline}><time dateTime={post.date}>{post.dateLabel}</time><span aria-hidden="true">·</span>{minutes} min read</div>
        <h1>{post.title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <figure className={styles.floorplan}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/blog-assets/jens-son/header.webp" width={1600} height={900}
            alt="Colored compute blocks down the center, flanked by memory interfaces" />
          <figcaption>Jen’s Son floorplan illustration</figcaption>
        </figure>
      </header>
      <ArticleContents entries={contents} />
      <article id="article-body" className={`${layout.body} ${styles.prose}`}>
        {render(sections(markdown))}
      </article>
      <footer className={styles.footer}>
        <a href="/blogs">← All blogs</a><a href="#">Back to the top ↑</a>
      </footer>
    </div>
  </main>;
}

function Md({ children }: { children: string }) {
  return <ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} components={{
    table: ({ children }) => <div className={styles.tableScroll} tabIndex={0}><table>{children}</table></div>,
    // A paragraph holding only a chart would wrap a <figure> in a <p>, which isn't valid HTML.
    p: ({ node, children }) => {
      const only = node?.children.length === 1 ? node.children[0] : undefined;
      const isChart = only?.type === "element" && only.tagName === "img" && String(only.properties?.src ?? "").startsWith("#chart=");
      return isChart ? <>{children}</> : <p>{children}</p>;
    },
    img: ({ src, alt }) => {
      const Chart = typeof src === "string" && src.startsWith("#chart=") ? CHARTS[src.slice(7)] : undefined;
      if (!Chart) return null;
      return <figure className={styles.chart}><Chart />{alt ? <figcaption>{alt}</figcaption> : null}</figure>;
    },
  }}>{children}</ReactMarkdown>;
}

function Heading({ level, title }: { level: 2 | 3; title: string }) {
  const H = level === 2 ? "h2" : "h3";
  return <H id={anchor(title)}>{title}</H>;
}

function render(list: Section[]) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    if (s.level === 0) { out.push(<Md key="intro">{s.body}</Md>); continue; }
    const teaser = FOLDS[s.title];
    if (teaser === undefined) {
      out.push(<section key={s.title} className={s.level === 2 ? styles.main : undefined}><Heading level={s.level} title={s.title} /><Md>{s.body}</Md></section>);
      continue;
    }
    // A folded ## section takes its ### subsections inside the fold with it.
    let body = s.body;
    while (s.level === 2 && list[i + 1]?.level === 3) {
      const sub = list[++i];
      body += `\n### ${sub.title}\n${sub.body}`;
    }
    out.push(<details key={s.title} className={`${styles.fold} ${s.level === 2 ? styles.foldMajor : ""}`}>
      <summary><Heading level={s.level} title={s.title} /><span className={styles.teaser}>{teaser}</span></summary>
      <div className={styles.foldBody}><Md>{body}</Md></div>
    </details>);
  }
  return out;
}
