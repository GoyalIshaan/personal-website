/* Native links intentionally reload the page so the decorative rain script has a fresh lifecycle. */
/* eslint-disable @next/next/no-html-link-for-pages */
export const metadata = { title: "Projects" };

export default function Page() {
 return (
<main>
<nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span aria-current="page">Projects</span></nav>
<header className="projects-header"><div className="identity"><h1>Projects</h1><p>ML systems, developer tools, and infrastructure.</p></div></header>
<section aria-labelledby="ml-systems"><h2 id="ml-systems" className="category-heading">ML systems <span>3</span></h2>
<article className="entry"><div className="entry-heading"><h3>JAX Transformer + MoE Kernel Optimization</h3><span className="tech">Jun 2026</span></div><p>Built a decoder-only Transformer and a fused MoE projection kernel in JAX and Pallas.</p><div className="project-meta"><span>JAX · Flax · Optax</span></div></article>
<article className="entry"><div className="entry-heading"><h3>Speculative Decoding Systems Reproduction</h3><span className="tech">Apr 2026</span></div><p>Built a draft-and-verify runtime for standard and Speculative2 decoding with Qwen3 models.</p><div className="project-meta"><span>PyTorch · CUDA · Qwen3</span></div></article>
<article className="entry"><div className="entry-heading"><h3>GPT-2 Inference Optimization</h3><span className="tech">Oct 2025 - Dec 2025</span></div><p>Optimized GPT-2 inference on an NVIDIA A40 with CUDA kernels and KV caching.</p><div className="project-meta"><span>C++ · CUDA · Slurm</span></div></article>
</section>
<section aria-labelledby="developer-tools"><h2 id="developer-tools" className="category-heading">Developer tools &amp; web <span>6</span></h2>
<article className="entry"><div className="entry-heading"><h3>Ren - Agentic IDE</h3><span className="tech">Nov 2025 - Jan 2026</span></div><p>Built a VS Code-based agentic IDE with multi-agent execution, indexing, review, and observability.</p><div className="project-meta"><span>TypeScript · VS Code · Bun</span><a href="https://ren-ide.com/" target="_blank" rel="noopener noreferrer">Demo</a></div></article>
<article className="entry"><div className="entry-heading"><h3>Hephaestus AI Platform</h3><span className="tech">Feb 2025</span></div><p>Built a visual platform for composing AI agents, tools, memory, and workflows.</p><div className="project-meta"><span>Next.js · TypeScript · LangChain</span></div></article>
<article className="entry"><div className="entry-heading"><h3>VidSmith</h3><span className="tech">Jul 2025</span></div><p>Built a microservices video platform with secure ingestion, transcoding, and CDN delivery.</p><div className="project-meta"><span>Go · RabbitMQ · Docker</span><a href="https://github.com/GoyalIshaan/vidSmith" target="_blank" rel="noopener noreferrer">Source</a></div></article>
<article className="entry"><div className="entry-heading"><h3>Docnest Collaborative Editor</h3><span className="tech">Jun 2024 - Oct 2024</span></div><p>Built a collaborative editor with CRDT synchronization and custom WebSocket infrastructure.</p><div className="project-meta"><span>React · TypeScript · Node.js</span><a href="https://github.com/GoyalIshaan/docnest" target="_blank" rel="noopener noreferrer">Source</a></div></article>
<article className="entry"><div className="entry-heading"><h3>QuickMark</h3><span className="tech">2024</span></div><p>Built a lightweight note application with Markdown and real-time collaboration.</p><div className="project-meta"><span>TypeScript · React · Markdown</span><a href="https://github.com/GoyalIshaan/quickmark" target="_blank" rel="noopener noreferrer">Source</a> <a href="https://quickmark-one.vercel.app/" target="_blank" rel="noopener noreferrer">Demo</a></div></article>
<article className="entry"><div className="entry-heading"><h3>Aether - AI Email Client</h3><span className="tech">2024</span></div><p>Built an AI-first email client that runs language-model features on the user&#x27;s device.</p><div className="project-meta"><span>React · TypeScript · Local LLM</span></div></article>
</section>
<section aria-labelledby="systems"><h2 id="systems" className="category-heading">Systems &amp; data <span>5</span></h2>
<article className="entry"><div className="entry-heading"><h3>Market Data Warehouse Pipeline</h3><span className="tech">Apr 2025 - Jun 2025</span></div><p>Built a C++ pipeline that parses PCAP market data and stores queryable records.</p><div className="project-meta"><span>C++ · Python · Linux</span></div></article>
<article className="entry"><div className="entry-heading"><h3>Custom Programming Language Interpreter</h3><span className="tech">2023</span></div><p>Built a complete interpreter in Go with a lexer, parser, evaluator, and REPL.</p><div className="project-meta"><span>Go · Compiler Design · Language Design</span><a href="https://github.com/GoyalIshaan/interpreter-in-go" target="_blank" rel="noopener noreferrer">Source</a></div></article>
<article className="entry"><div className="entry-heading"><h3>Custom Unix Shell</h3><span className="tech">2023</span></div><p>Built a Unix shell in C with pipes, redirection, background jobs, and built-in commands.</p><div className="project-meta"><span>C · Unix · Systems Programming</span></div></article>
<article className="entry"><div className="entry-heading"><h3>High-Performance Memory Manager</h3><span className="tech">2023</span></div><p>Built custom malloc and free primitives in C with an optimized allocation strategy.</p><div className="project-meta"><span>C · Memory Management · Performance Optimization</span></div></article>
<article className="entry"><div className="entry-heading"><h3>Nasdaq ITCH Market Data Decoder</h3><span className="tech">2024</span></div><p>Built a zero-copy C++ decoder for Nasdaq ITCH 5.0 binary market data.</p><div className="project-meta"><span>C++ · mmap · Makefile</span><a href="https://github.com/GoyalIshaan/itch-decoder" target="_blank" rel="noopener noreferrer">Source</a></div></article>
</section>
<footer><a href="/">Home</a><a href="https://github.com/GoyalIshaan" target="_blank" rel="noopener noreferrer">More on GitHub</a><button className="motion-toggle" type="button" aria-pressed="false">Pause background</button></footer>
</main>
 );
}
