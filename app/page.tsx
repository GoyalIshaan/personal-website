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
              I am a sophomore studying Computer Science at the University of
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

        <Tabs defaultValue="competencies" className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-4 mb-8 overflow-auto">
            <TabsTrigger value="competencies">Core Skills</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="tools">Tools & Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="competencies" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <SkillBadge name="Full-Stack Development" level={90} />
              <SkillBadge name="MERN Stack" level={85} />
              <SkillBadge name="PERN Stack" level={85} />
              <SkillBadge name="RESTful APIs" level={90} />
              <SkillBadge name="Object-Oriented Programming" level={85} />
              <SkillBadge name="Functional Programming" level={80} />
              <SkillBadge name="Responsive Web Design" level={90} />
              <SkillBadge name="Cloud Computing" level={75} />
              <SkillBadge name="Version Control" level={90} />
              <SkillBadge name="Leadership" level={85} />
              <SkillBadge name="Design" level={80} />
              <SkillBadge name="Team Collaboration" level={90} />
              <SkillBadge name="System Architecture" level={80} />
              <SkillBadge name="Effective Communication" level={85} />
              <SkillBadge name="Innovation" level={85} />
              <SkillBadge name="Flexibility" level={90} />
              <SkillBadge name="Perseverance" level={95} />
            </div>
          </TabsContent>

          <TabsContent value="languages" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <SkillBadge name="JavaScript" level={90} />
              <SkillBadge name="TypeScript" level={95} />
              <SkillBadge name="Java" level={80} />
              <SkillBadge name="Python" level={95} />
              <SkillBadge name="C" level={95} />
              <SkillBadge name="C++" level={95} />
              <SkillBadge name="SQL (PostgreSQL)" level={80} />
              <SkillBadge name="HTML" level={95} />
              <SkillBadge name="CSS" level={90} />
              <SkillBadge name="Go" level={55} />
              <SkillBadge name="Rust" level={50} />
            </div>
          </TabsContent>

          <TabsContent value="domains" className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Frontend</h3>
              <div className="flex flex-wrap gap-3">
                <SkillBadge name="React" level={90} />
                <SkillBadge name="Vite" level={85} />
                <SkillBadge name="Tailwind" level={90} />
                <SkillBadge name="ShadCn" level={85} />
                <SkillBadge name="Framer Motion" level={75} />
                <SkillBadge name="Material-UI" level={80} />
                <SkillBadge name="Responsive Design" level={90} />
                <SkillBadge name="Next.js" level={85} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Backend</h3>
              <div className="flex flex-wrap gap-3">
                <SkillBadge name="Node.js" level={85} />
                <SkillBadge name="Express" level={85} />
                <SkillBadge name="MongoDB" level={80} />
                <SkillBadge name="PostgreSQL" level={80} />
                <SkillBadge name="Mongoose" level={80} />
                <SkillBadge name="JWT" level={85} />
                <SkillBadge name="Prisma ORM" level={80} />
                <SkillBadge name="WebSocket" level={75} />
                <SkillBadge name="Hono" level={70} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                AI & Machine Learning
              </h3>
              <div className="flex flex-wrap gap-3">
                <SkillBadge name="TensorFlow" level={45} />
                <SkillBadge name="PyTorch" level={40} />
                <SkillBadge name="LangChain" level={60} />
                <SkillBadge name="OpenAI API" level={75} />
                <SkillBadge name="Data Visualization" level={70} />
                <SkillBadge name="Python Libraries" level={75} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Blockchain & VR</h3>
              <div className="flex flex-wrap gap-3">
                <SkillBadge name="Blockchain Development" level={50} />
                <SkillBadge name="Unity" level={65} />
                <SkillBadge name="VR Interactions" level={60} />
                <SkillBadge name="3D Design" level={55} />
                <SkillBadge name="Smart Contracts" level={45} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Low-Level & Systems
              </h3>
              <div className="flex flex-wrap gap-3">
                <SkillBadge name="Linux" level={75} />
                <SkillBadge name="TCP" level={70} />
                <SkillBadge name="Memory Management" level={75} />
                <SkillBadge name="Process Management" level={70} />
                <SkillBadge name="Systems Programming" level={75} />
                <SkillBadge name="Compiler Design" level={65} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Developer Tools</h3>
              <div className="flex flex-wrap gap-3">
                <SkillBadge name="Git" level={90} />
                <SkillBadge name="AWS" level={75} />
                <SkillBadge name="Cloudflare Edge Functions" level={70} />
                <SkillBadge name="Postman" level={85} />
                <SkillBadge name="VS Code" level={95} />
                <SkillBadge name="PyCharm" level={80} />
                <SkillBadge name="IntelliJ" level={80} />
                <SkillBadge name="Firebase" level={80} />
                <SkillBadge name="Docker" level={70} />
                <SkillBadge name="Zod" level={80} />
                <SkillBadge name="Cloudflare Workers" level={75} />
                <SkillBadge name="Yjs" level={75} />
                <SkillBadge name="CRDT" level={70} />
                <SkillBadge name="PayPal" level={65} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Open to Learn</h3>
              <div className="flex flex-wrap gap-3">
                <SkillBadge name="GraphQL" level={50} />
                <SkillBadge name="Spring Boot" level={40} />
                <SkillBadge name="Redis" level={45} />
                <SkillBadge name="Apache Kafka" level={35} />
                <SkillBadge name="Kubernetes" level={40} />
                <SkillBadge name="Microservices" level={55} />
                <SkillBadge name="AWS Lambda" level={50} />
                <SkillBadge name="Azure Functions" level={40} />
                <SkillBadge name="Game Development" level={45} />
              </div>
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
