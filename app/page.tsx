import Image from "next/image";
import { DATA } from "@/data/resume";
import { ProjectEntry } from "@/components/project-entry";

const selectedTitles: Record<string, string> = {
  "Speculative Decoding Runtime & GPU Kernel Lab": "Speculative decoding & GPU kernels",
  "JAX Transformer + MoE Kernel Optimization": "Transformer & MoE kernels",
  "GPT-2 Inference Optimization": "GPT-2 inference",
  "Ren - Agentic IDE": "Ren",
  VidSmith: "VidSmith",
};
const selectedProjects = Object.keys(selectedTitles).map((title) => {
  const project = DATA.projects.find((item) => item.title === title);
  if (!project) throw new Error(`Missing selected project: ${title}`);
  return project;
});

export default function Page() {
 return (
<main>
<header>
<div className="identity"><h1>Ishaan Goyal</h1><p>Computer Science at UIUC</p></div>
<Image className="portrait" src="/pfp.webp" alt="Ishaan Goyal" width="64" height="64" />
</header>
<div className="intro"><p>{DATA.summary}</p></div>
<nav aria-label="Contact and profiles"><a href="mailto:ishaan6@illinois.edu">Email</a><a href="https://github.com/GoyalIshaan" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://www.linkedin.com/in/ishaan-goyal" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="/resumes/ishaan-goyal-ai-infrastructure.pdf" target="_blank" rel="noopener">Résumé <span>PDF</span></a></nav>
<section aria-labelledby="experience-title"><h2 id="experience-title">Experience</h2>
<article className="entry">
<div className="entry-heading"><h3><a href="https://www.shibuyaaa.com/" target="_blank" rel="noopener noreferrer">A Vinyl Bar in Shibuya</a></h3><time>Feb–Aug 2026</time></div>
<p>I helped build the ML and data systems behind interactive music products at a startup valued at $50M, working alongside Spotify&apos;s former Head of Innovation and turning customer feedback into product improvements.</p>
<p>I fine-tuned BS-RoFormer for stem separation, optimized it with sparse attention and weight quantization, and deployed it for on-device inference on iOS. Alongside the model work, I built an internal ingestion pipeline for 1M+ songs.</p>
<p>I liked moving between model behavior, device constraints, and product ideas with a team that wanted people to play with music.</p>
</article>
<article className="entry"><div className="entry-heading"><h3>ADAPT Lab, UIUC</h3><time>May–Aug 2025</time></div>
<p>{DATA.work[1].description}</p>
</article>
</section>
<section aria-labelledby="projects-title"><h2 id="projects-title">Selected projects</h2>
{selectedProjects.map((project) => <ProjectEntry key={project.title} project={project} title={selectedTitles[project.title]} />)}
<a className="projects-button" href="/projects">View all projects</a>
</section>
<footer><span>Champaign, Illinois</span><a href="mailto:ishaan6@illinois.edu">ishaan6@illinois.edu</a><button className="motion-toggle" type="button" aria-pressed="false">Pause background</button></footer>
</main>
 );
}
