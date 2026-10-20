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
<article className="entry">
<div className="entry-heading"><h3><a href="https://www.shibuyaaa.com/" target="_blank" rel="noopener noreferrer">A Vinyl Bar in Shibuya</a></h3><time>Feb–Aug 2026</time></div>
<p>I worked alongside Spotify&apos;s former Head of Innovation at a music software startup valued at $50M, turning customer feedback into product improvements with the team.</p>
<p>I fine-tuned and optimized BS-RoFormer for stem separation using sparse attention and weight quantization, and deployed it for on-device inference on iOS. I also built an internal music ingestion pipeline for 1M+ songs.</p>
<p>One of my favorite parts was experimenting with a collaborative team building new ways to play with music.</p>
</article>
<article className="entry"><div className="entry-heading"><h3>ADAPT Lab, UIUC</h3><time>May–Aug 2025</time></div><p>At UIUC&apos;s ADAPT Lab, I worked on ConstraintFlow, a language for neural-network verification. I refactored compiler IR passes and built caching and JIT compilation for tensor-heavy workloads. I also profiled more than 20 compilation passes to find bottlenecks and designed a roadmap for CPU–GPU synchronization and multi-GPU scaling.</p></article>
</section>
<section aria-labelledby="projects-title"><h2 id="projects-title">Selected projects</h2>
<article className="entry"><div className="entry-heading"><h3>Transformer &amp; MoE kernels</h3><span className="tech">JAX · Pallas</span></div><p>Built a Transformer from scratch, added top-1 expert routing, and wrote a fused projection kernel to reduce activation memory traffic.</p></article>
<article className="entry"><div className="entry-heading"><h3>GPT-2 inference</h3><span className="tech">CUDA · C++</span></div><p>Profiled and optimized GPU inference with shared-memory tiling, Tensor Core kernels, and KV caching.</p></article>
<article className="entry"><div className="entry-heading"><h3>Speculative decoding</h3><span className="tech">PyTorch · CUDA · Qwen3</span></div><p>I reproduced standard speculative decoding and Speculative2 with Qwen3-8B and Qwen3-32B, building a custom draft-and-verify runtime. I benchmarked batch sizes and speculative depths to study when drafting more tokens helps and when the overhead outweighs the benefit.</p></article>
<article className="entry"><div className="entry-heading"><h3><a href="https://ren-ide.com/" target="_blank" rel="noopener noreferrer">Ren</a></h3><span className="tech">TypeScript · VS Code</span></div><p>I built and shipped a VS Code-based agentic IDE to alpha users, with interactive coding agents and orchestration for running multiple agents in parallel. I built codebase indexing and retrieval to give agents context, plus patch review and a live execution timeline so users could follow their work and decide which changes to keep.</p><div className="project-meta"><a href="https://github.com/RenCodeIDE/renide" target="_blank" rel="noopener noreferrer">IDE source</a><a href="https://github.com/RenCodeIDE/ren_tui" target="_blank" rel="noopener noreferrer">Terminal source</a><a href="https://github.com/RenCodeIDE/web" target="_blank" rel="noopener noreferrer">Website source</a></div></article>
<article className="entry"><div className="entry-heading"><h3><a href="https://github.com/GoyalIshaan/vidSmith" target="_blank" rel="noopener noreferrer">VidSmith</a></h3><span className="tech">Go · Kubernetes</span></div><p>A video platform with asynchronous processing, FFmpeg transcoding, and RabbitMQ coordination across services.</p></article>
<a className="projects-button" href="/projects">View all projects</a>
</section>
<footer><span>Champaign, Illinois</span><a href="mailto:ishaan6@illinois.edu">ishaan6@illinois.edu</a><button className="motion-toggle" type="button" aria-pressed="false">Pause background</button></footer>
</main>
 );
}
