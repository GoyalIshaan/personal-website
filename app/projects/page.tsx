import Link from "next/link";
import type { Metadata } from "next";
import { ModeToggle } from "@/components/mode-toggle";
import { DATA } from "@/data/resume";
import styles from "./projects.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description: "Models, compilers, inference hardware, agent workflows, and systems by Ishaan Goyal.",
};

const CATEGORIES = [
  { id: "ml-systems", title: "ML systems & hardware", group: "AI and ML" },
  { id: "developer-tools", title: "Developer tools & web", group: "Developer Tools and Web" },
  { id: "systems", title: "Systems & data", group: "Systems, HFT, and Data" },
] as const;

export default function ProjectsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topVeil} aria-hidden="true" />
      <main className={styles.container}>
        <nav className={styles.topBar} aria-label="Breadcrumb">
          <Link className={styles.backLink} href="/">
            ← Ishaan Goyal
          </Link>
          <div className={styles.topRight}>
            <Link href="/blogs">Writing</Link>
          </div>
        </nav>

        <header className={styles.header}>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>
            Inference hardware, GPU kernels, agent tooling, and distributed systems.
          </p>
        </header>

        {CATEGORIES.map((category) => {
          const projects = DATA.projects.filter(
            (project) => project.filterGroup === category.group
          );
          return (
            <section
              key={category.id}
              className={styles.section}
              aria-labelledby={category.id}
            >
              <h2 id={category.id} className={styles.sectionLabel}>
                {category.title}
              </h2>
              <div className={styles.list}>
                {projects.map((project) => (
                  <article key={project.title} className={styles.row}>
                    <div className={styles.rowHead}>
                      <div className={styles.rowTitleWrap}>
                        <span className={styles.rowTitle}>{project.title}</span>
                        {project.links.length > 0 && (
                          <span className={styles.inlineLinks}>
                            {project.links.map((link) => (
                              <a
                                key={link.href}
                                href={link.href}
                                {...(link.href.startsWith("/")
                                  ? {}
                                  : { target: "_blank", rel: "noopener noreferrer" })}
                              >
                                {link.type.toLowerCase()}
                              </a>
                            ))}
                          </span>
                        )}
                      </div>
                      <span className={styles.rowDate}>{project.dates}</span>
                    </div>
                    <p className={styles.rowDesc}>{project.description}</p>
                    <div className={styles.rowTech}>{project.technologies.join(" · ")}</div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link href="/">Home</Link>
            <Link href="/blogs">Writing</Link>
            <a
              href="https://github.com/GoyalIshaan"
              target="_blank"
              rel="noopener noreferrer"
            >
              More on GitHub
            </a>
          </div>
          <ModeToggle className={`blog-theme-toggle ${styles.themeToggle}`} />
        </footer>
      </main>
    </div>
  );
}
