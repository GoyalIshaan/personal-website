/* Native links give the portfolio's background script a fresh lifecycle. */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";
import { BLOG_POSTS } from "@/data/blogs";
import styles from "./blogs.module.css";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Longer notes on things I've been learning. By Ishaan Goyal.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Blogs — Ishaan Goyal",
    description: "Longer notes on things I've been learning.",
    url: "/blogs",
    type: "website",
  },
};

export default function BlogsPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Blogs</span>
      </nav>
      <header>
        <div className="identity">
          <h1>Blogs</h1>
          <p>Longer notes on things I’ve been learning.</p>
        </div>
      </header>
      <ul className={styles.posts} aria-label="Blog posts">
        {posts.map((post) => (
          <li key={post.slug} className={styles.post}>
            <article>
              <div className={styles.heading}>
                <h2><a href={`/blogs/${post.slug}`}>{post.title}</a></h2>
                <time dateTime={post.date}>{post.dateLabel}</time>
              </div>
              <p>{post.description}</p>
            </article>
          </li>
        ))}
      </ul>
      <footer>
        <a href="/">← Ishaan Goyal</a>
        <button className="motion-toggle" type="button" aria-pressed="false">Pause background</button>
      </footer>
    </main>
  );
}
