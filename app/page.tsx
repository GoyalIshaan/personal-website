import Image from "next/image";

export default function Page() {
 return (
<main>
<header>
<div className="identity"><h1>Ishaan Goyal</h1><p>Computer Science at UIUC</p></div>
<Image className="portrait" src="/pfp.webp" alt="Ishaan Goyal" width="64" height="64" />
</header>
<div className="intro"><p>I work on ML systems, compilers, and GPU performance. I also build developer tools and the infrastructure behind them.</p></div>
<nav aria-label="Contact and profiles"><a href="mailto:ishaan6@illinois.edu">Email</a><a href="https://github.com/GoyalIshaan" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://www.linkedin.com/in/ishaan-goyal" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="/resumes/ishaan-goyal-ai-infrastructure.pdf" target="_blank" rel="noopener">Résumé <span>PDF</span></a></nav>
<section aria-labelledby="experience-title"><h2 id="experience-title">Experience</h2>
<article className="entry"><div className="entry-heading"><h3>A Vinyl Bar in Shibuya</h3><time>Feb–Aug 2026</time></div><p>Audio ML: music search, stem separation, on-device inference, and data pipelines.</p></article>
<article className="entry"><div className="entry-heading"><h3>ADAPT Lab, UIUC</h3><time>May–Aug 2025</time></div><p>Compiler research on ConstraintFlow for neural-network verification. Worked on IR passes, profiling, caching, and JIT compilation.</p></article>
</section>
<section aria-labelledby="projects-title"><h2 id="projects-title">Selected projects</h2>
<article className="entry"><div className="entry-heading"><h3>Transformer &amp; MoE kernels</h3><span className="tech">JAX · Pallas</span></div><p>Built a Transformer from scratch, added top-1 expert routing, and wrote a fused projection kernel to reduce activation memory traffic.</p></article>
<article className="entry"><div className="entry-heading"><h3>GPT-2 inference</h3><span className="tech">CUDA · C++</span></div><p>Profiled and optimized GPU inference with shared-memory tiling, Tensor Core kernels, and KV caching.</p></article>
<article className="entry"><div className="entry-heading"><h3>Ren</h3><span className="tech">TypeScript · VS Code</span></div><p>An agentic IDE with codebase indexing, multi-agent execution, patch review, and an execution timeline.</p></article>
<article className="entry"><div className="entry-heading"><h3><a href="https://github.com/GoyalIshaan/vidSmith" target="_blank" rel="noopener noreferrer">VidSmith</a></h3><span className="tech">Go · Kubernetes</span></div><p>A video platform with asynchronous processing, FFmpeg transcoding, and RabbitMQ coordination across services.</p></article>
<a className="projects-button" href="/projects">View all projects</a>
</section>
<footer><span>Champaign, Illinois</span><a href="mailto:ishaan6@illinois.edu">ishaan6@illinois.edu</a><button className="motion-toggle" type="button" aria-pressed="false">Pause background</button></footer>
</main>
 );
}
