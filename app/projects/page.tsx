import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;
const filters = [
  "All",
  "AI and ML",
  "Developer Tools and Web",
  "Systems, HFT, and Data",
] as const;

type ProjectFilter = (typeof filters)[number];

interface ProjectsPageProps {
  searchParams: Promise<{ filter?: string | string[] }>;
}

function isProjectFilter(value: string): value is ProjectFilter {
  return filters.some((filter) => filter === value);
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const params = await searchParams;
  const requestedFilter = Array.isArray(params.filter)
    ? params.filter[0]
    : params.filter;
  const selectedFilter =
    requestedFilter && isProjectFilter(requestedFilter)
      ? requestedFilter
      : "All";

  const visibleProjects =
    selectedFilter === "All"
      ? DATA.projects
      : DATA.projects.filter(
          (project) => project.filterGroup === selectedFilter,
        );

  const featuredProjects = visibleProjects
    .filter((project) => project.featuredRank !== null)
    .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));
  const moreProjects = visibleProjects.filter(
    (project) => project.featuredRank === null,
  );

  return (
    <main className="min-h-screen space-y-16">
      <div className="space-y-6 sm:space-y-8">
        <BlurFade delay={BLUR_FADE_DELAY}>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
              Projects
            </h1>
            <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Systems work across ML inference, GPU kernels, developer tools,
              market data, and infrastructure.
            </p>
          </div>
        </BlurFade>

        <div className="space-y-3">
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <form action="/projects" method="get">
              <fieldset className="flex flex-wrap gap-2">
                <legend className="sr-only">Filter projects</legend>
                {filters.map((filter) => {
                  const isSelected = selectedFilter === filter;

                  return (
                    <button
                      key={filter}
                      type="submit"
                      name="filter"
                      value={filter}
                      aria-pressed={isSelected}
                      className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        isSelected
                          ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </fieldset>
            </form>
          </BlurFade>

          <p className="text-sm text-muted-foreground">
            Showing {visibleProjects.length} of {DATA.projects.length} projects.
          </p>
        </div>
      </div>

      {featuredProjects.length > 0 && (
        <section
          aria-labelledby="featured-projects-title"
          className="space-y-6"
        >
          <div className="space-y-1">
            <h2 id="featured-projects-title" className="text-xl font-bold">
              Featured Systems Work
            </h2>
            <p className="text-sm text-muted-foreground">
              Selected work in this project group.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-6">
            {featuredProjects.map((project, index) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 2 + Math.min(index, 3) * 0.02}
              >
                <ProjectCard
                  variant="archive"
                  href={"href" in project ? project.href : undefined}
                  title={project.title}
                  category={project.category}
                  summary={project.summary}
                  impact={project.impact}
                  description={project.description}
                  dates={project.dates}
                  tags={project.technologies}
                  image={project.image}
                  imageAlt={project.imageAlt}
                  video={project.video}
                  links={project.links}
                  priority={index === 0}
                />
              </BlurFade>
            ))}
          </div>
        </section>
      )}

      {moreProjects.length > 0 && (
        <section aria-labelledby="more-projects-title" className="space-y-6">
          <div className="space-y-1">
            <h2 id="more-projects-title" className="text-xl font-bold">
              More Projects
            </h2>
            <p className="text-sm text-muted-foreground">
              Earlier product, systems, and infrastructure work.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-6">
            {moreProjects.map((project, index) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 2 + Math.min(index, 3) * 0.02}
              >
                <ProjectCard
                  variant="archive"
                  href={"href" in project ? project.href : undefined}
                  title={project.title}
                  category={project.category}
                  summary={project.summary}
                  impact={project.impact}
                  description={project.description}
                  dates={project.dates}
                  tags={project.technologies}
                  image={project.image}
                  imageAlt={project.imageAlt}
                  video={project.video}
                  links={project.links}
                  priority={featuredProjects.length === 0 && index === 0}
                />
              </BlurFade>
            ))}
          </div>
        </section>
      )}

      {visibleProjects.length === 0 && (
        <p className="rounded-lg border p-6 text-sm text-muted-foreground">
          No projects match this filter.
        </p>
      )}
    </main>
  );
}
