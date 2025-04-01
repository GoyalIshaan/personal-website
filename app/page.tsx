import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Code, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { ExperienceCard } from "@/components/experience-card";
import { SkillBadge } from "@/components/skill-badge";
import { HeroSection } from "@/components/hero-section";
import { ProjectCategories } from "@/components/project-categories";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />

      {/* About Section */}
      <section
        id="about"
        className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">About Me</h2>
            <p className="text-muted-foreground mb-6">
              I'm a sophomore studying Computer Science at the University of
              Illinois Urbana-Champaign as part of the James Scholar Honors
              Program. I'm passionate about software development, creating
              impactful technology solutions, and solving complex problems.
            </p>
            <p className="text-muted-foreground mb-6">
              My coursework includes Data Structures, Computer Architecture,
              Systems Programming, and advanced mathematics. I'm constantly
              expanding my skills through hands-on projects and professional
              experiences.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="#contact">Get in Touch</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#projects">View Projects</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-xl bg-muted overflow-hidden">
              <img
                src="/pfp.jpg"
                alt="Ishaan Goyal"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <img src="/uiuc.png" alt="UIUC Logo" className="w-6 h-6" />
                <div>
                  <p className="font-bold">UIUC '26</p>
                  <p>Computer Science</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section
        id="skills"
        className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/50"
      >
        <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
          Skills & Technologies
        </h2>

        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="core">Core Skills</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="tech">Technologies</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="soft">Soft Skills</TabsTrigger>
          </TabsList>
          <TabsContent value="core" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <SkillBadge name="Full-Stack Development" level={95} />
              <SkillBadge name="MERN" level={95} />
              <SkillBadge name="Systems Programming" level={95} />
              <SkillBadge name="Interpreters" level={95} />
              <SkillBadge name="WebSockets" level={95} />
              <SkillBadge name="CRDT" level={95} />
              <SkillBadge name="Yjs" level={95} />
              <SkillBadge name="D3.js" level={95} />
              <SkillBadge name="Data Visualization" level={95} />
              <SkillBadge name="UI/UX Design" level={95} />
              <SkillBadge name="Markdown" level={95} />
              <SkillBadge name="GRPC" level={95} />
            </div>
          </TabsContent>
          <TabsContent value="languages" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <SkillBadge name="JavaScript" level={95} />
              <SkillBadge name="TypeScript" level={95} />
              <SkillBadge name="Python" level={95} />
              <SkillBadge name="C" level={95} />
              <SkillBadge name="C++" level={95} />
              <SkillBadge name="Go" level={95} />
              <SkillBadge name="HTML" level={95} />
              <SkillBadge name="CSS" level={95} />
              <SkillBadge name="SQL" level={95} />
            </div>
          </TabsContent>
          <TabsContent value="tech" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <SkillBadge name="React" level={95} />
              <SkillBadge name="Next.js" level={95} />
              <SkillBadge name="Vite" level={95} />
              <SkillBadge name="Tailwind CSS" level={95} />
              <SkillBadge name="ShadCN" level={95} />
              <SkillBadge name="Node.js" level={95} />
              <SkillBadge name="Express" level={95} />
              <SkillBadge name="MongoDB" level={95} />
              <SkillBadge name="PostgreSQL" level={95} />
              <SkillBadge name="Git" level={95} />
              <SkillBadge name="Docker" level={95} />
              <SkillBadge name="AWS" level={95} />
              <SkillBadge name="Linux" level={95} />
              <SkillBadge name="Unity" level={95} />
              <SkillBadge name="VR" level={95} />
              <SkillBadge name="TensorFlow" level={95} />
              <SkillBadge name="PyTorch" level={95} />
              <SkillBadge name="LangChain" level={95} />
            </div>
          </TabsContent>
          <TabsContent value="tools" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <SkillBadge name="GitHub" level={95} />
              <SkillBadge name="Cloudflare Edge Functions" level={95} />
            </div>
          </TabsContent>
          <TabsContent value="soft" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <SkillBadge name="Leadership" level={95} />
              <SkillBadge name="Team Collaboration" level={95} />
              <SkillBadge name="Problem Solving" level={95} />
              <SkillBadge name="Effective Communication" level={95} />
              <SkillBadge name="Project Management" level={95} />
              <SkillBadge name="Technical Documentation" level={95} />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Experience Section */}
      <section
        id="experience"
        className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
          Experience
        </h2>

        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          <ExperienceCard
            title="Software Developer Intern"
            company="Jinship (Disruption Lab)"
            date="Sep 2024 - Dec 2024"
            description="Led the design and implementation of a feedback system for Jinship, improving data collection efficiency and enhancing user experience across key chatbot workflows. Optimized client-side code, integrating graph-based recommendations and precomputed embeddings, resulting in a 25% improvement in response times."
            skills={["React", "TypeScript", "Data Visualization", "UI/UX"]}
          />

          <ExperienceCard
            title="Software Developer"
            company="Illinois Space Society"
            date="Sep 2023 - Dec 2023"
            description="Reengineered ISS flight monitoring system, transforming Flask-based codebase into high-performance React application with code splitting, lazy loading, yielding 70% improvement in site performance. Orchestrated UI/UX redesign using Figma, collaborating with 3-member team to craft intuitive, responsive interface."
            skills={["React", "Flask", "Figma", "D3.js", "UI/UX"]}
          />

          <ExperienceCard
            title="Founder"
            company="NFT Reality"
            date="Dec 2021 - Feb 2023"
            description="Spearheaded development by founding, managing 10-member international team, leveraging diverse range of tools to rapidly launch VR-based NFT marketplace. Executed UI/UX design principles in collaboration with international team, integrating Unity-based VR interactions, 3D designs to forge intuitive, immersive user experience."
            skills={["Unity", "VR", "UI/UX", "Team Leadership", "3D Design"]}
          />
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto bg-muted/50"
      >
        <h2 className="text-3xl font-bold tracking-tight mb-12 text-center">
          Projects
        </h2>

        <ProjectCategories />
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            Get In Touch
          </h2>
          <p className="text-muted-foreground mb-10">
            I'm always open to new opportunities, collaborations, or just a
            friendly chat about technology. Feel free to reach out through any
            of the channels below.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2"
            >
              <Mail className="h-5 w-5" />
              <span>ishaan6@illinois.edu</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2"
              asChild
            >
              <Link href="https://www.linkedin.com/in/ishaan-goyal/">
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2"
              asChild
            >
              <Link href="https://github.com/GoyalIshaan">
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6" />
            <span className="font-bold text-lg">Ishaan Goyal</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Ishaan Goyal. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
