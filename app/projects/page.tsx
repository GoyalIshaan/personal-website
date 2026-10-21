/* Native links intentionally reload the page so the decorative rain script has a fresh lifecycle. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { DATA } from "@/data/resume";
import { ProjectEntry } from "@/components/project-entry";

export const metadata = { title: "Projects" };

export default function Page() {
 return (
<main>
<nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Projects</span></nav>
<header className="projects-header"><div className="identity"><h1>Projects</h1><p>Models, compilers, agent workflows, and the systems behind them.</p></div></header>
{[
  { id: "ml-systems", title: "ML systems", group: "AI and ML" },
  { id: "developer-tools", title: "Developer tools & web", group: "Developer Tools and Web" },
  { id: "systems", title: "Systems & data", group: "Systems, HFT, and Data" },
].map((category) => {
  const projects = DATA.projects.filter((project) => project.filterGroup === category.group);
  return <section key={category.id} aria-labelledby={category.id}>
    <h2 id={category.id} className="category-heading">{category.title} <span>{projects.length}</span></h2>
    {projects.map((project) => <ProjectEntry key={project.title} project={project} showDate />)}
  </section>;
})}
<footer><a href="/">Home</a><a href="https://github.com/GoyalIshaan" target="_blank" rel="noopener noreferrer">More on GitHub</a><button className="motion-toggle" type="button" aria-pressed="false">Pause background</button></footer>
</main>
 );
}
