/* Full-page navigation preserves the portfolio background script's lifecycle. */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { SPECULATIVE_DECODING_POST as post } from "@/data/blogs";
import styles from "./article.module.css";

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: `/blogs/${post.slug}` },
  openGraph: {
    title: `${post.title} | Ishaan Goyal`, description: post.description,
    type: "article", authors: ["Ishaan Goyal"], publishedTime: post.date,
    url: `/blogs/${post.slug}`,
  },
};

function anchor(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function SpeculativeDecodingPage() {
  const source = await readFile(path.join(process.cwd(), "content/blogs/speculative-decoding.md"), "utf8");
  const withoutTitle = source.replace(/^# .*\n/, "");
  const subtitle = withoutTitle.match(/^\n\*([^\n]+)\*\n/)?.[1] ?? post.description;
  const markdown = withoutTitle.replace(/^\n\*[^\n]+\*\n/, "");
  const contents = Array.from(markdown.matchAll(/^## (.+)$/gm)).map(match => ({ title: match[1], id: anchor(match[1]) }));
  const minutes = Math.ceil(source.split(/\s+/).length / 220);

  return <main className={styles.page}>
    <a className={styles.skip} href="#article-body">Skip to article</a>
    <nav className={styles.topNav} aria-label="Article navigation">
      <div className={styles.breadcrumb}><a href="/">Ishaan Goyal</a><span aria-hidden="true">/</span><a href="/blogs">Blogs</a></div>
    </nav>
    <header className={styles.header}>
      <div className={styles.byline}>Ishaan Goyal <span aria-hidden="true">/</span><time dateTime={post.date}>November 3, 2026</time><span aria-hidden="true">/</span>{minutes} min read</div>
      <h1>{post.title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>
      <p className={styles.note}>Inference engineering · Research log</p>
    </header>
    <details className={styles.contents}>
      <summary>In this article <span>{contents.length} parts</span></summary>
      <ol>{contents.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}</ol>
    </details>
    <article id="article-body" className={styles.prose}>
      <ReactMarkdown skipHtml remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[[rehypeKatex, { trust: false, throwOnError: false, maxExpand: 1000, maxSize: 20 }]]} components={{
        h2: ({ children }) => <h2 id={anchor(String(children))}>{children}</h2>,
        h3: ({ children }) => <h3 id={anchor(String(children))}>{children}</h3>,
        table: ({ children }) => <div className={styles.tableScroll} tabIndex={0}><table>{children}</table></div>,
        // Static scientific plots retain their supplied pixels and explicit alt text.
        /* eslint-disable @next/next/no-img-element */
        img: ({ src, alt }) => <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" />,
      }}>{markdown}</ReactMarkdown>
    </article>
    <footer className={styles.footer}>
      <a href="/blogs">← All blogs</a><a href="#">Back to the top ↑</a>
      <button className="motion-toggle" type="button" aria-pressed="false">Pause background</button>
    </footer>
  </main>;
}
