import type { DATA } from "@/data/resume";

type Project = (typeof DATA.projects)[number];

export function ProjectEntry({
  project,
  title = project.title,
  showDate = false,
}: {
  project: Project;
  title?: string;
  showDate?: boolean;
}) {
  return (
    <article className="entry">
      <div className="entry-heading">
        <h3>{title}</h3>
        {showDate && <span className="tech">{project.dates}</span>}
      </div>
      <div className="entry-tech">{project.technologies.join(" · ")}</div>
      <p>{project.description}</p>
      {project.links.length > 0 && (
        <div className="project-meta">
          {project.links.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.type}
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
