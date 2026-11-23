"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./article-contents.module.css";

type ContentsEntry = { id: string; title: string };

export function ArticleContents({ entries }: { entries: ContentsEntry[] }) {
  const [currentId, setCurrentId] = useState<string>();
  const sidebar = useRef<HTMLElement>(null);
  const disclosure = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const article = document.getElementById("article-body");
    if (!article) return;

    const headings = entries
      .map(({ id }) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => heading !== null && article.contains(heading));

    let frame = 0;
    const update = () => {
      frame = 0;
      const atEnd = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (atEnd) {
        setCurrentId(headings.at(-1)?.id);
        return;
      }
      let active: string | undefined;
      for (const heading of headings) {
        const offset = parseFloat(getComputedStyle(heading).scrollMarginTop) || 0;
        const readingLine = Math.max(64, offset + 2);
        if (heading.getBoundingClientRect().top > readingLine) break;
        active = heading.id;
      }
      setCurrentId(active);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(article);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
      cancelAnimationFrame(frame);
    };
  }, [entries]);

  useEffect(() => {
    const rail = sidebar.current;
    const link = rail?.querySelector('[aria-current="location"]');
    if (!rail || !link || !rail.clientHeight) return;
    const bounds = rail.getBoundingClientRect();
    const current = link.getBoundingClientRect();
    if (current.top < bounds.top) rail.scrollTop += current.top - bounds.top;
    if (current.bottom > bounds.bottom) rail.scrollTop += current.bottom - bounds.bottom;
  }, [currentId]);

  if (!entries.length) return null;
  const currentTitle = entries.find(({ id }) => id === currentId)?.title;
  const links = (onClick?: () => void) => (
    <ol className={styles.links}>
      {entries.map(({ id, title }) => (
        <li key={id}>
          <a href={`#${id}`} aria-current={id === currentId ? "location" : undefined} onClick={onClick}>
            {title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <nav ref={sidebar} className={styles.sidebar} aria-label="In this article">
        <p className={styles.label}>In this article</p>
        {links()}
      </nav>
      <details ref={disclosure} className={styles.disclosure}>
        <summary>
          In this article
          {currentTitle && <span className={styles.currentTitle}>{currentTitle}</span>}
        </summary>
        <nav className={styles.mobileNav} aria-label="In this article">
          {links(() => disclosure.current?.removeAttribute("open"))}
        </nav>
      </details>
    </>
  );
}
