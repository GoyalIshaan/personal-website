import { Icons } from "@/components/icons";
import { NAV_ITEMS, RESUME_HREF, SOCIAL_LINKS } from "@/data/navigation";

export const DATA = {
  name: "Ishaan Goyal",
  initials: "IG",
  url: "https://www.ishaangoyal.com/",
  location: "Champaign, IL",
  locationLink: "https://www.google.com/maps/place/champaign+illinois",
  description:
    "ML systems and developer tools by Ishaan Goyal: on-device audio inference, compiler research, GPU kernels, and coding-agent workflows. Computer science at UIUC.",
  summary:
    "I build ML systems and developer tools. I've worked on audio models that run on iPhones, compilers for neural-network verification, and coding agents whose work developers can inspect and control.",
  avatarUrl: "/pfp.webp",

  resume: {
    aiInfrastructure: RESUME_HREF,
  },

  skillGroups: [
    {
      title: "Languages",
      skills: [
        "C",
        "C++",
        "CUDA C++",
        "Python",
        "Go",
        "Java",
        "JavaScript/TypeScript",
        "Verilog",
        "Bash",
        "SQL",
      ],
    },
    {
      title: "ML and AI Systems",
      skills: [
        "PyTorch",
        "JAX",
        "Flax",
        "Optax",
        "TensorFlow",
        "Hugging Face",
        "MLX",
        "Core ML",
        "LoRA/PEFT",
        "MoE",
        "MTP",
        "Speculative Decoding",
        "KV Cache",
        "FlashAttention",
        "Quantization",
        "RLHF",
        "Pallas",
      ],
    },
    {
      title: "Inference and Kernel Optimization",
      skills: [
        "CUDA",
        "cuBLAS",
        "cuDNN",
        "NCCL",
        "WMMA",
        "Tensor Cores",
        "Pallas Kernels",
        "KV-Cache Management",
        "Batching",
        "Token Routing",
        "Prompt-Lookup Decoding",
        "INT4/INT8/FP8 Quantization",
      ],
    },
    {
      title: "Systems, Compiler, and Infrastructure",
      skills: [
        "Linux",
        "Slurm",
        "Docker",
        "Kubernetes",
        "Git",
        "CMake",
        "gdb",
        "perf",
        "Nsight",
        "nsys",
        "JIT Compilation",
        "Caching",
        "Profiling",
        "OpenMP",
        "MPI",
        "AWS",
        "GCP",
        "Redis",
        "PostgreSQL",
        "Elasticsearch",
        "Kafka",
        "gRPC",
        "Protobuf",
        "WebSockets",
        "RabbitMQ",
        "Apache Airflow",
      ],
    },
  ],

  navbar: NAV_ITEMS,

  contact: {
    email: "ishaan6@illinois.edu",
    tel: "+1 (217) 202-0293",
    social: SOCIAL_LINKS,
  },

  work: [
    {
      company: "A Vinyl Bar in Shibuya",
      href: "https://www.shibuyaaa.com/",
      badges: ["Python", "PyTorch", "MLX", "Quantization", "On-Device ML"],
      location: "Remote",
      title: "Founding Engineer Intern, ML",
      logoUrl: "/shibuya-logo.png", // Official brand mark: https://www.shibuyaaa.com/favicon.png
      start: "Feb 2026",
      end: "Aug 2026",
      summary:
        "Turned customer feedback into product improvements, fine-tuned and deployed BS-RoFormer for stem separation on iOS, and built an internal music ingestion pipeline for 1M+ songs.",
      description:
        "I helped build the ML and data systems behind interactive music products at a startup valued at $50M, working alongside Spotify's former Head of Innovation and turning customer feedback into product improvements. I fine-tuned BS-RoFormer for stem separation, optimized it with sparse attention and weight quantization, and deployed it for on-device inference on iOS. Alongside the model work, I built an internal ingestion pipeline for 1M+ songs. I liked moving between model behavior, device constraints, and product ideas with a team that wanted people to play with music.",
    },
    {
      company: "ADAPT Lab, UIUC",
      badges: [
        "Neural Network Verification",
        "Compiler Optimization",
        "JIT",
        "Caching",
        "GPU Architecture",
      ],
      location: "Champaign, IL",
      title: "Compiler Researcher",
      logoUrl: "/adaptLab.png",
      start: "May 2025",
      end: "Aug 2025",
      summary: "Worked on compiler performance for neural-network verification and coauthored the team’s tensor-compiler preprint.",
      description:
        "I worked on ConstraintFlow, a compiler that turns neural-network verification specifications into tensor computations. My focus was the compilation path: refactoring IR passes, adding caching and JIT compilation, and profiling more than 20 passes to find bottlenecks. I also coauthored the team’s compiler and runtime preprint and designed a roadmap for CPU–GPU synchronization and multi-GPU scaling.",
    },
  ],

  education: [
    {
      school: "University of Illinois Urbana-Champaign",
      degree: "Bachelor of Science in Computer Science",
      logoUrl: "/uiucLogo.png",
      start: "2022",
      end: "May 2027",
      summary:
        "Studies computer science with a focus on systems, architecture, and machine learning.",
      description:
        "Relevant coursework: Data Structures & Algorithms, Operating Systems, Systems Programming, Distributed Systems, Advanced Computer Architecture, Linear Algebra, Parallel Programming, ML Systems, and Generative AI.",
    },
  ],

  projects: [
    {
      title: "JAX Transformer + MoE Kernel Optimization",
      dates: "Jun 2026",
      active: true,
      featured: true,
      featuredRank: 2,
      category: "AI/ML",
      filterGroup: "AI and ML",
      summary:
        "I built and trained a Transformer, then added expert routing and a fused Pallas kernel to explore how MoE execution affects memory traffic.",
      impact:
        "Connected model training, expert routing, and custom kernel execution in one experiment.",
      description:
        "I built a decoder-only Transformer in JAX, Flax, and Optax for arithmetic reasoning, then extended it with top-1 mixture-of-experts routing. From there, I wrote a fused Pallas projection kernel to reduce activation memory traffic and compared it with a ragged-dot baseline. The project follows the same workload from model design down to accelerator execution.",
      technologies: ["JAX", "Flax", "Optax", "TPU", "Pallas", "MoE"],
      links: [],
      image: "/projects/jax-moe.webp",
      imageAlt:
        "Diagram of tokens routed through a top-1 MoE layer and a fused Pallas projection kernel.",
      video: "",
    },
    {
      title: "Speculative Decoding Runtime & GPU Kernel Lab",
      dates: "Apr 2026",
      active: true,
      featured: true,
      featuredRank: 1,
      category: "AI/ML",
      filterGroup: "AI and ML",
      summary:
        "I built a custom BF16 speculative-decoding runtime with CUDA graphs, rollback-safe KV caches, multi-GPU draft forecasting, and specialized Triton kernels.",
      impact:
        "Connected speculative execution, GPU kernels, cache-state management, and numerical/performance evaluation.",
      description:
        "I built a custom inference runtime for speculative decoding with fused GPU kernels, CUDA graph replay, and overlapping execution across GPUs. I implemented KV-cache rollback for rejected tokens, fixed cache-layout bugs, and investigated numerical mismatches caused by different execution shapes and reduction orders. In single-request Qwen2.5-7B tests on two H100s, speculative speculative decoding reached 229 tokens/s, versus 158 tokens/s for standard speculative decoding, including prefill.",
      technologies: ["Python", "PyTorch", "Triton", "CUDA", "C++", "CUDA Graphs", "Nsight Systems"],
      links: [],
      image: "/projects/speculative-decoding.webp",
      imageAlt:
        "Diagram of draft tokens that a larger model verifies during speculative decoding.",
      video: "",
    },
    {
      title: "Ren - Agentic IDE",
      href: "https://ren-ide.com/",
      dates: "Nov 2025 - Jan 2026",
      active: true,
      featured: true,
      featuredRank: 4,
      category: "Developer Tools",
      filterGroup: "Developer Tools and Web",
      summary:
        "I helped build and ship Ren to alpha users: a VS Code-based IDE with interactive coding agents, codebase retrieval, and a live view of their work and changes.",
      impact:
        "Connected code context, agent execution, and human review inside the editor.",
      description:
        "I helped build Ren on VS Code and ship it to alpha users. My work included codebase indexing and retrieval, interactive agent workflows, and agent orchestration. I also built views for agent activity, tasks, and file changes, alongside patch review and an execution timeline. The goal was to give developers enough context and visibility to stay involved as coding agents worked.",
      technologies: [
        "TypeScript",
        "VS Code",
        "Bun",
        "Hono",
        "Cloudflare Workers",
        "WebSockets",
        "Vector DB",
      ],
      links: [
        {
          type: "Demo",
          href: "https://ren-ide.com/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "IDE source",
          href: "https://github.com/RenCodeIDE/renide",
          icon: <Icons.github className="size-3" />,
        },
        {
          type: "Terminal source",
          href: "https://github.com/RenCodeIDE/ren_tui",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/projects/ren.webp",
      imageAlt:
        "Ren IDE interface with an agent panel, a code editor, and an architecture graph.",
      video: "",
    },
    {
      title: "GPT-2 Inference Optimization",
      dates: "Oct 2025 - Dec 2025",
      active: true,
      featured: true,
      featuredRank: 3,
      category: "AI/ML",
      filterGroup: "AI and ML",
      summary:
        "I used GPU profiles to guide GPT-2 inference work on an NVIDIA A40, tuning CUDA matrix multiplication and adding KV caching to reuse earlier computation.",
      impact:
        "Connected GPU profiling, CUDA kernel tuning, and reuse during generation.",
      description:
        "I profiled GPT-2 inference on an NVIDIA A40 to understand where GPU time was going, then focused on matrix multiplication. I explored shared-memory tiling, launch configuration, vectorized loads, and a WMMA path, and added KV caching for autoregressive generation. I compared kernel behavior with the full inference path to understand how local improvements carried through to the application.",
      technologies: [
        "C++",
        "CUDA",
        "Slurm",
        "Nsight",
        "WMMA",
        "KV Cache",
        "HPC",
      ],
      links: [],
      image: "/projects/gpt2-cuda.webp",
      imageAlt:
        "Diagram of GPT-2 inference with CUDA matrix multiplication and a key-value cache.",
      video: "",
    },
    {
      title: "Hephaestus AI Platform",
      dates: "Feb 2025",
      active: true,
      featured: false,
      featuredRank: null,
      category: "Web Dev",
      filterGroup: "Developer Tools and Web",
      summary:
        "I built a visual workspace for composing agents and workflows, with reusable tools, persistent context, and responses streamed as a run progresses.",
      impact:
        "Brought workflow composition, tools, session state, and streaming into one interface.",
      description:
        "I built a full-stack workspace that turns text prompts into agent workflows users can work with in a visual editor. Reusable tools provide actions, while persistent memory and session management carry context between interactions. WebSocket streaming exposes responses as they arrive, connecting the workflow-building interface to what happens during execution.",
      technologies: [
        "Next.js",
        "TypeScript",
        "LangChain",
        "OpenAPI",
        "WebSockets",
        "shadcn/ui",
        "AWS",
      ],
      links: [],
      image: "/projects/hephaestus.webp",
      imageAlt:
        "Hephaestus interface for composing an AI workflow with connected visual nodes.",
      video: "",
    },
    {
      title: "VidSmith",
      href: "https://github.com/GoyalIshaan/vidSmith",
      dates: "Jul 2025",
      active: true,
      featured: false,
      featuredRank: null,
      category: "Web Dev",
      filterGroup: "Developer Tools and Web",
      summary:
        "I built an event-driven video pipeline that turns multipart uploads into adaptive HLS streams. RabbitMQ coordinates Go workers for FFmpeg transcoding and captions, while GraphQL subscriptions keep the interface updated as jobs run.",
      impact:
        "Connected upload, asynchronous media processing, and adaptive playback in one system.",
      description:
        "I built an event-driven video pipeline that sends multipart uploads directly to S3 and turns them into adaptive HLS streams. RabbitMQ coordinates Go workers for FFmpeg transcoding and captions, while GraphQL subscriptions keep the interface updated as jobs run. The media processing runs in the background, separate from the interactive upload and playback flow.",
      technologies: [
        "Go",
        "RabbitMQ",
        "Docker",
        "Kubernetes",
        "S3",
        "GraphQL",
        "HLS",
        "FFmpeg",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/vidSmith",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/projects/vidsmith.webp",
      imageAlt:
        "VidSmith video platform interface with uploaded media and processing controls.",
      video: "",
    },
    {
      title: "Market Data Warehouse Pipeline",
      dates: "Apr 2025 - Jun 2025",
      active: true,
      featured: false,
      featuredRank: null,
      category: "HFT",
      filterGroup: "Systems, HFT, and Data",
      summary:
        "I built a pipeline that turns IEX packet captures into queryable records, connecting C++ decoding with Parquet storage and Airflow-managed ingestion.",
      impact:
        "Connected binary decoding, structured storage, processing metadata, and job orchestration.",
      description:
        "I built a C++ parser for IEX packet captures and connected it to a market-data pipeline with Parquet storage, SQLite bookkeeping, and multithreaded ingestion. Airflow coordinates the jobs around that data path. The project links low-level decoding to the storage and processing metadata needed to make captured market activity useful for later analysis.",
      technologies: [
        "C++",
        "Python",
        "Linux",
        "SQLite",
        "Apache Airflow",
        "PCAP",
        "Parquet",
        "Multithreading",
      ],
      links: [],
      image: "/projects/market-data.webp",
      imageAlt:
        "Diagram of PCAP market data flowing through a C++ parser, storage, and Airflow jobs.",
      video: "",
    },
    {
      title: "Docnest Collaborative Editor",
      href: "https://github.com/GoyalIshaan/docnest",
      dates: "Jun 2024 - Oct 2024",
      active: true,
      featured: false,
      featuredRank: null,
      category: "Web Dev",
      filterGroup: "Developer Tools and Web",
      summary:
        "I built a shared document workspace with Yjs-based synchronization, custom WebSockets, persisted document state, and document-linked chat.",
      impact:
        "Connected live document updates, saved state, sharing, and conversation.",
      description:
        "I built the synchronization and persistence layers behind a collaborative document workspace. Yjs updates travel over a custom WebSocket protocol, and the server saves document state to PostgreSQL through Prisma. Document sharing and chat sit around that core. The work connects initial synchronization, live updates, reconnects, and storage rather than stopping at the editing interface.",
      technologies: ["React", "TypeScript", "Node.js", "Yjs", "WebSockets", "PostgreSQL", "Prisma"],
      links: [
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/docnest",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/projects/docnest.webp",
      imageAlt:
        "Docnest collaborative document editor with a document list and editing workspace.",
      video: "",
    },
    {
      title: "QuickMark",
      href: "https://quickmark-one.vercel.app/",
      dates: "2024",
      active: true,
      featured: false,
      featuredRank: null,
      category: "Web Dev",
      filterGroup: "Developer Tools and Web",
      summary:
        "I built a publishing app that helps writers recover unfinished drafts, publish rich-text posts, and connect with readers through comments, saves, likes, and follows.",
      impact:
        "Connected draft recovery, publication, and reader interaction.",
      description:
        "I built QuickMark around the path from an unfinished draft to a published post. The rich-text editor saves drafts locally and lets writers restore them when they return. A TypeScript API built with Hono, shared Zod schemas, and Prisma connects publishing to PostgreSQL-backed profiles, comments, saves, likes, and follows. The result brings writing recovery and reader interaction into the same application.",
      technologies: ["TypeScript", "React", "Hono", "Prisma", "PostgreSQL", "Zod", "Cloudflare Workers"],
      links: [
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/quickmark",
          icon: <Icons.github className="size-3" />,
        },
        {
          type: "Demo",
          href: "https://quickmark-one.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/projects/quickmark.webp",
      imageAlt:
        "QuickMark publishing interface with a rich-text editor and posts.",
      video: "",
    },
    {
      title: "Aether - AI Email Client",
      dates: "Mar 2025",
      active: true,
      featured: false,
      featuredRank: null,
      category: "Web Dev",
      filterGroup: "Developer Tools and Web",
      summary:
        "I contributed database IPC handlers and read/unread inbox interactions to a team-built desktop email client with local AI summaries and reply drafts.",
      impact:
        "Contributed data access and inbox state interactions around a team-built local-AI email client.",
      description:
        "I contributed to Aether, a desktop email client built with Electron and React, with a local Flask and Ollama service for summaries and reply drafts. My work focused on database IPC handlers and read/unread inbox interactions: translating stored email records for the interface and connecting message selection to read-state updates. These contributions sit between the desktop process, application data, and everyday inbox behavior.",
      technologies: ["Electron", "React", "TypeScript", "Flask", "Ollama", "SQLite"],
      links: [{ type: "Source", href: "https://github.com/AdvaitTahilyani/Aether", icon: <Icons.github className="size-3" /> }],
      image: "/projects/aether.webp",
      imageAlt:
        "Aether email client interface with an inbox and AI-assisted email controls.",
      video: "",
    },
    {
      title: "Custom Unix Shell",
      dates: "2023",
      active: false,
      featured: false,
      featuredRank: null,
      category: "Low Level",
      filterGroup: "Systems, HFT, and Data",
      summary:
        "I built a shell in C to explore how pipes, redirection, background execution, and built-in commands turn a command line into coordinated process work.",
      impact:
        "Connected command composition, process management, and interactive shell behavior.",
      description:
        "I built a Unix shell in C with pipes, input/output redirection, background execution, and custom built-in commands. The project explores how commands connect and how the shell manages the processes behind them. It gave me a way to work directly with the process lifecycles and data flow that higher-level applications usually hide.",
      technologies: ["C", "Unix", "Systems Programming"],
      links: [],
      image: "/projects/unix-shell.webp",
      imageAlt:
        "Diagram of a Unix shell connecting commands through pipes, redirection, and background jobs.",
      video: "",
    },
    {
      title: "Memory Allocator in C",
      dates: "2023",
      active: false,
      featured: false,
      featuredRank: null,
      category: "Low Level",
      filterGroup: "Systems, HFT, and Data",
      summary:
        "I implemented malloc and free in C to explore the trade-offs between allocation overhead, fragmentation, and memory utilization.",
      impact:
        "Explored allocation behavior through a custom implementation of malloc and free.",
      description:
        "I implemented custom malloc and free primitives in C, working directly with how requests receive memory and how released space becomes available again. The project explores the tension between allocation overhead, fragmentation, and utilization. It made those competing goals concrete in a component most application code delegates to a library.",
      technologies: ["C", "Memory Management", "Performance Optimization"],
      links: [],
      image: "/projects/memory-manager.webp",
      imageAlt:
        "Diagram of a custom memory allocator splitting, allocating, and merging heap blocks.",
      video: "",
    },
    {
      title: "Nasdaq ITCH Market Data Decoder",
      href: "https://github.com/GoyalIshaan/itch-decoder",
      dates: "2024",
      active: true,
      featured: false,
      featuredRank: null,
      category: "HFT",
      filterGroup: "Systems, HFT, and Data",
      summary:
        "I built a C++ decoder that turns memory-mapped Nasdaq ITCH data into CSV records, using explicit binary layouts and message-specific handlers.",
      impact:
        "Connected binary protocol layouts, message dispatch, and CSV export.",
      description:
        "I built a C++ decoder for Nasdaq ITCH 5.0 files, connecting memory-mapped input to inspectable CSV output. A dispatch table routes records to message-specific handlers, while packed layouts and compile-time checks keep the protocol representation explicit. The implementation also tracks processing statistics and handles interruption, making the binary-to-record conversion path easier to inspect and measure.",
      technologies: ["C++", "mmap", "Binary Protocols", "Makefile", "CSV"],
      links: [
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/itch-decoder",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/projects/itch-decoder.webp",
      imageAlt:
        "Diagram of memory-mapped Nasdaq ITCH input moving through message handlers into CSV records.",
      video: "",
    },
  ],
} as const;
