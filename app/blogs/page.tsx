import Link from "next/link";
import type { Metadata } from "next";
import { ModeToggle } from "@/components/mode-toggle";
import { BLOG_POSTS } from "@/data/blogs";
import styles from "./blogs.module.css";

export const metadata: Metadata = {
  title: "Writing",
  description: "Longer notes on things I've been learning and building. By Ishaan Goyal.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Writing — Ishaan Goyal",
    description: "Longer notes on things I've been learning and building.",
    url: "/blogs",
    type: "website",
  },
};

function shortMonthYear(iso: string) {
  const [year, month] = iso.split("-");
  return `${month}/${year.slice(2)}`;
}

export default function BlogsPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
  let lastYear = "";

  return (
    <div className={styles.page}>
      <div className={styles.topVeil} aria-hidden="true" />
      <main className={styles.container}>
        <nav className={styles.topBar} aria-label="Breadcrumb">
          <Link className={styles.backLink} href="/">
            ← Ishaan Goyal
          </Link>
          <div className={styles.topRight}>
            <Link href="/projects">Projects</Link>
          </div>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Writing</h1>
          <p className={styles.subtitle}>Longer notes on inference hardware, kernels, and systems.</p>
        </header>

        <div className={styles.yearTable} aria-label="Blog posts">
          {posts.map((post, idx) => {
            const year = post.date.slice(0, 4);
            const showYear = year !== lastYear;
            lastYear = year;
            return (
              <article key={post.slug} className={styles.yearRow}>
                <span className={styles.yearGutter}>{showYear ? year : ""}</span>
                <div className={styles.rowMain}>
                  <Link className={styles.rowTitle} href={`/blogs/${post.slug}`}>
                    {post.title}
                  </Link>
                  {idx === 0 && (
                    <span className={styles.newWrap}>
                      New
                      <svg
                        className={styles.newSvg}
                        viewBox="0 0 46 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 13.5C3.5 6.8 12.2 2.2 23.4 2.6C35.2 3 43.2 7.4 42.5 13.4C41.8 19.6 32.5 22.4 21.4 22C10.5 21.6 2.8 17.7 5.5 10.6"
                          stroke="currentColor"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  )}
                  <p className={styles.rowDesc}>{post.description}</p>
                </div>
                <time className={styles.rowDate} dateTime={post.date}>
                  {shortMonthYear(post.date)}
                </time>
              </article>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link href="/">Home</Link>
            <Link href="/projects">Projects</Link>
          </div>
          <ModeToggle className={`blog-theme-toggle ${styles.themeToggle}`} />
        </footer>
      </main>
    </div>
  );
}
