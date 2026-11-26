"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DATA } from "@/data/resume";
import { CURRENTLY, PROJECT_ITEMS, WRITING_ITEMS } from "@/data/now";
import { ModeToggle } from "@/components/mode-toggle";
import styles from "./home-page.module.css";

function useChampaignTime() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
        .format(new Date())
        .toLowerCase()
        .replace(" ", "");

    setTime(fmt());
    const id = window.setInterval(() => setTime(fmt()), 15000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

function mailto(subject?: string) {
  if (!subject) return `mailto:${DATA.contact.email}`;
  return `mailto:${DATA.contact.email}?subject=${encodeURIComponent(subject)}`;
}

export function HomePage() {
  const [copied, setCopied] = useState(false);
  const localTime = useChampaignTime();

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(DATA.contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = mailto();
    }
  }

  let lastWritingYear = "";
  let lastProjectYear = "";

  return (
    <div className={`${styles.homeRoot} home-quiet-canvas`}>
      <div className={styles.topVeil} aria-hidden="true" />
      <main className={styles.container}>
        <header className={`${styles.head} ${styles.stagger}`} style={{ animationDelay: "0.02s" }}>
          <div className={styles.identity}>
            <Image
              src="/pfp.webp"
              alt={DATA.name}
              width={88}
              height={88}
              className={styles.portrait}
              priority
            />
            <div>
              <h1 className={styles.name}>Ishaan Goyal</h1>
              <p className={styles.roleLine}>Champaign, Illinois</p>
            </div>
          </div>
          <time className={styles.updated}>Updated {CURRENTLY.updatedLabel}</time>
        </header>

        <div className={styles.bio}>
          <p className={styles.stagger} style={{ animationDelay: "0.06s" }}>
            Computer science student at UIUC (graduating May 2027). I work on ML systems,
            compilers, and developer tools.
          </p>

          <p className={styles.stagger} style={{ animationDelay: "0.11s" }}>
            Most recently, I was a founding engineer at{" "}
            <a
              className={styles.inlineLink}
              href="https://www.shibuyaaa.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              A Vinyl Bar in Shibuya
            </a>
            , where I compressed BS-RoFormer for on-device stem separation on iOS and built an
            ingestion pipeline for over a million songs. Before that, I worked on the
            ConstraintFlow neural-network verification compiler at UIUC’s ADAPT Lab.
          </p>

          <p className={styles.stagger} style={{ animationDelay: "0.16s" }}>
            Outside of work, I spend my time on inference hardware, GPU kernels, and coding-agent
            tooling: designing{" "}
            <a className={styles.inlineLink} href="/blogs/jens-son">
              Jen’s Son
            </a>{" "}
            (a batch-1 inference chip in SystemVerilog), tuning a{" "}
            <a className={styles.inlineLink} href="/blogs/speculative-decoding">
              multi-GPU speculative decoder
            </a>
            , and shipping{" "}
            <a
              className={styles.inlineLink}
              href="https://ren-ide.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ren
            </a>{" "}
            to alpha users.
          </p>

          <p className={styles.stagger} style={{ animationDelay: "0.21s" }}>
            If you’re building around inference, compilers, or agent systems, or just want to
            talk, reach me at{" "}
            <button type="button" className={styles.inlineBtn} onClick={handleCopyEmail}>
              {DATA.contact.email}
            </button>
            {copied && <span className={styles.copiedNote}>copied</span>}. Also on{" "}
            <a
              className={styles.inlineLink}
              href="https://github.com/GoyalIshaan"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            ,{" "}
            <a
              className={styles.inlineLink}
              href="https://www.linkedin.com/in/ishaan-goyal"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            , and{" "}
            <a
              className={styles.inlineLink}
              href="https://x.com/IshaanGoyal05"
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
            .
          </p>
        </div>

        <section
          className={`${styles.section} ${styles.stagger}`}
          style={{ animationDelay: "0.28s" }}
          aria-labelledby="currently-heading"
        >
          <h2 id="currently-heading" className={styles.sectionLabel}>
            Currently
          </h2>
          <div className={styles.nowList}>
            {CURRENTLY.items.map((item) => (
              <div key={item.title} className={styles.nowRow}>
                <div>
                  <div className={styles.nowTitle}>{item.title}</div>
                  <p className={styles.nowNote}>{item.note}</p>
                </div>
                <div className={styles.nowRight}>
                  {item.href && <a href={item.href}>{item.hrefLabel ?? "read"}</a>}
                  <a href={mailto(item.mailSubject)}>email</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.stagger}`}
          style={{ animationDelay: "0.34s" }}
          aria-labelledby="writing-heading"
        >
          <h2 id="writing-heading" className={styles.sectionLabel}>
            Writing
          </h2>
          <div className={styles.yearTable}>
            {WRITING_ITEMS.map((post) => {
              const showYear = post.year !== lastWritingYear;
              lastWritingYear = post.year;
              return (
                <div key={post.title} className={styles.yearRow}>
                  <span className={styles.yearGutter}>{showYear ? post.year : ""}</span>
                  <div className={styles.rowMain}>
                    <a className={styles.rowTitleLink} href={post.href}>
                      {post.title}
                    </a>
                    {post.isNew && (
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
                    <div className={styles.rowSub}>{post.note}</div>
                  </div>
                  <time className={styles.rowDate}>{post.dateShort}</time>
                </div>
              );
            })}
          </div>
          <a className={styles.allLink} href="/blogs">
            All posts
          </a>
        </section>

        <section
          className={`${styles.section} ${styles.stagger}`}
          style={{ animationDelay: "0.4s" }}
          aria-labelledby="projects-heading"
        >
          <h2 id="projects-heading" className={styles.sectionLabel}>
            Selected projects
          </h2>
          <div className={styles.yearTable}>
            {PROJECT_ITEMS.map((item) => {
              const showYear = item.year !== lastProjectYear;
              lastProjectYear = item.year;
              return (
                <div key={item.title} className={styles.yearRow}>
                  <span className={styles.yearGutter}>{showYear ? item.year : ""}</span>
                  <div className={styles.rowMain}>
                    {item.href ? (
                      <a
                        className={styles.rowTitleLink}
                        href={item.href}
                        {...(item.href.startsWith("/")
                          ? {}
                          : { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span className={styles.rowTitleLink}>{item.title}</span>
                    )}
                    {item.links && item.links.length > 0 && (
                      <span className={styles.rowInlineLinks}>
                        {item.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            {...(l.href.startsWith("/")
                              ? {}
                              : { target: "_blank", rel: "noopener noreferrer" })}
                          >
                            {l.label}
                          </a>
                        ))}
                      </span>
                    )}
                    <div className={styles.rowSub}>{item.note}</div>
                  </div>
                  <time className={styles.rowDate}>{item.dateShort}</time>
                </div>
              );
            })}
          </div>
          <a className={styles.allLink} href="/projects">
            All projects
          </a>
        </section>

        <footer className={`${styles.footer} ${styles.stagger}`} style={{ animationDelay: "0.46s" }}>
          <span>{localTime ? `${localTime} in Champaign, Illinois` : "Champaign, Illinois"}</span>
          <div className={styles.footerRight}>
            <ModeToggle className={`blog-theme-toggle ${styles.themeToggle}`} />
            <svg
              className={styles.markSvg}
              width="22"
              height="16"
              viewBox="0 0 24 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 13.5C5.2 13.5 6.8 11.2 9.5 11.2C11 11.2 11.8 6.4 13.8 3.6C13.6 7 14.8 9.8 16.4 11.2C18.4 11.2 19.6 13.5 22 13.5"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </footer>
      </main>
    </div>
  );
}
