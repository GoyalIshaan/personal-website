import LazyGitHubActivity from "@/components/lazy-github-activity";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DATA } from "@/data/resume";
import { ArrowRightIcon, FileTextIcon, MailIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const BLUR_FADE_DELAY = 0.04;
const PRIMARY_SKILL_COUNT = 6;

const featuredProjects = DATA.projects
  .filter((project) => project.featuredRank !== null)
  .sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99));

export default function Page() {
  return (
    <main className="flex min-h-[100dvh] flex-col gap-y-16 sm:gap-y-20">
      <section id="hero" aria-labelledby="hero-title">
        <div className="space-y-7">
          <div className="flex items-start justify-between gap-5 sm:gap-8">
            <div className="min-w-0 flex-1 space-y-3">
              <BlurFadeText
                delay={BLUR_FADE_DELAY}
                className="text-2xl font-bold tracking-tighter sm:text-4xl"
                yOffset={8}
                text={`Hi, I'm ${DATA.name.split(" ")[0]} 👋`}
              />
              <h1
                id="hero-title"
                className="max-w-[34rem] text-pretty text-2xl font-semibold leading-tight tracking-tight sm:text-4xl sm:leading-tight"
              >
                ML systems engineer focused on inference, GPU kernels, and
                compilers.
              </h1>
            </div>
            <BlurFade delay={BLUR_FADE_DELAY * 2}>
              <div className="relative size-20 overflow-hidden rounded-full border sm:size-28">
                <Image
                  src={DATA.avatarUrl}
                  alt={DATA.name}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(min-width: 640px) 112px, 80px"
                  className="object-cover"
                />
              </div>
            </BlurFade>
          </div>

          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="space-y-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>Founding Engineer Intern, ML at A Vinyl Bar in Shibuya.</p>
              <p>UIUC Computer Science, May 2027.</p>
            </div>
          </BlurFade>

          <BlurFade delay={BLUR_FADE_DELAY * 4}>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="min-h-11">
                <Link
                  href={DATA.resume.aiInfrastructure}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileTextIcon aria-hidden="true" />
                  Resume
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11">
                <Link href={`mailto:${DATA.contact.email}`}>
                  <MailIcon aria-hidden="true" />
                  Email Ishaan
                </Link>
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      <section id="work" aria-labelledby="work-title">
        <div className="flex min-h-0 flex-col gap-y-1">
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <h2 id="work-title" className="text-xl font-bold">
              Work Experience
            </h2>
          </BlurFade>
          {DATA.work.map((work, id) => (
            <BlurFade
              key={work.company}
              delay={BLUR_FADE_DELAY * 2.2 + Math.min(id, 3) * 0.02}
            >
              <ResumeCard
                logoUrl={work.logoUrl}
                altText={work.company}
                title={work.company}
                subtitle={work.title}
                href={"href" in work ? work.href : undefined}
                badges={work.badges}
                period={`${work.start} - ${work.end ?? "Present"}`}
                summary={work.summary}
                description={work.description}
              />
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="projects" aria-labelledby="projects-title">
        <div className="space-y-8">
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Featured Systems Work
                </p>
                <h2
                  id="projects-title"
                  className="text-3xl font-bold tracking-tighter sm:text-5xl"
                >
                  Selected projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center gap-1 self-start rounded-md px-1 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:self-auto"
              >
                View all 14 projects
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </BlurFade>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {featuredProjects.map((project, id) => (
              <BlurFade
                key={project.title}
                delay={BLUR_FADE_DELAY * 3 + Math.min(id, 3) * 0.02}
              >
                <ProjectCard
                  variant="featured"
                  href={"href" in project ? project.href : undefined}
                  title={project.title}
                  category={project.category}
                  summary={project.summary}
                  impact={project.impact}
                  description={project.description}
                  dates={project.dates}
                  tags={project.technologies.slice(0, 4)}
                  image={project.image}
                  imageAlt={project.imageAlt}
                  video={project.video}
                  links={project.links}
                />
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      <section id="education" aria-labelledby="education-title">
        <div className="flex min-h-0 flex-col gap-y-1">
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <h2 id="education-title" className="text-xl font-bold">
              Education
            </h2>
          </BlurFade>
          {DATA.education.map((education, id) => (
            <BlurFade
              key={education.school}
              delay={BLUR_FADE_DELAY * 2.2 + Math.min(id, 3) * 0.02}
            >
              <ResumeCard
                href={education.href}
                logoUrl={education.logoUrl}
                altText={education.school}
                title={education.school}
                subtitle={education.degree}
                period={`${education.start} - ${education.end}`}
                summary={education.summary}
                description={education.description}
              />
            </BlurFade>
          ))}
        </div>
      </section>

      <section id="skills" aria-labelledby="skills-title">
        <div className="space-y-5">
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <h2 id="skills-title" className="text-xl font-bold">
              Skills
            </h2>
          </BlurFade>

          <div className="grid gap-5 sm:grid-cols-2">
            {DATA.skillGroups.map((group, id) => (
              <BlurFade
                key={group.title}
                delay={BLUR_FADE_DELAY * 2.2 + Math.min(id, 3) * 0.02}
              >
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">{group.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.slice(0, PRIMARY_SKILL_COUNT).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>

          <details className="group border-t pt-3">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center rounded-md text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Show All Skills</span>
              <span className="hidden group-open:inline">
                Hide Additional Skills
              </span>
            </summary>
            <div className="grid gap-5 pt-4 sm:grid-cols-2">
              {DATA.skillGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h3 className="text-sm font-semibold">{group.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.slice(PRIMARY_SKILL_COUNT).map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      <section id="github-activity" aria-labelledby="github-title">
        <div className="space-y-6">
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <h2
              id="github-title"
              className="text-3xl font-bold tracking-tighter sm:text-5xl"
            >
              Recent GitHub Activity
            </h2>
          </BlurFade>
          <BlurFade delay={BLUR_FADE_DELAY * 3}>
            <div className="max-w-full overflow-x-auto pb-2">
              <LazyGitHubActivity />
            </div>
          </BlurFade>
        </div>
      </section>

      <section id="contact" aria-labelledby="contact-title">
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="space-y-4 border-t py-10 sm:py-12">
            <p className="text-sm font-medium text-muted-foreground">Contact</p>
            <h2
              id="contact-title"
              className="text-3xl font-bold tracking-tighter sm:text-5xl"
            >
              Build something ambitious.
            </h2>
            <p className="max-w-[36rem] text-pretty leading-relaxed text-muted-foreground">
              Send me an email about AI infrastructure, systems, or ambitious
              products.
            </p>
            <Button asChild variant="outline" className="min-h-11">
              <Link href={`mailto:${DATA.contact.email}`}>
                <MailIcon aria-hidden="true" />
                {DATA.contact.email}
              </Link>
            </Button>
          </div>
        </BlurFade>
      </section>
    </main>
  );
}
