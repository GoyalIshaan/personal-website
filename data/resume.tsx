import { Icons } from "@/components/icons";
import { NAV_ITEMS, SOCIAL_LINKS } from "@/data/navigation";

export const DATA = {
  name: "Ishaan Goyal",
  initials: "IG",
  url: "https://ishaangoyal.dev",
  location: "Champaign, IL",
  locationLink: "https://www.google.com/maps/place/champaign+illinois",
  description:
    "ML systems engineer focused on inference, GPU kernels, and compilers. Founding Engineer Intern, ML at A Vinyl Bar in Shibuya and UIUC computer science student.",
  summary:
    "I'm a UIUC computer science student focused on ML systems, compiler optimization, and high-performance infrastructure. My work spans production music ML, JAX and Pallas kernels, CUDA inference, agentic developer tools, and full-stack platforms.",
  avatarUrl: "/pfp.webp",

  resume: {
    aiInfrastructure: "/resumes/ishaan-goyal-ai-infrastructure.pdf",
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
      badges: ["Python", "PyTorch", "MLX", "Quantization", "On-Device ML"],
      location: "Remote",
      title: "Founding Engineer Intern, ML",
      logoUrl: "/favicon.svg",
      start: "Feb 2025",
      end: "Present",
      summary:
        "Built production music ML systems that support more than 1 million songs.",
      description:
        "Built production audio ML systems across music search, stem separation, and on-device inference alongside Spotify's former Head of Innovation. Created an end-to-end ETL pipeline for 1M+ songs, optimized BS-RoFormer to 9.65 average SDR on MUSDB18 with sparse attention and quantization, and built agentic workflows that reduced manual intervention by 60% while accelerating tasks by 2.5x.",
    },
    {
      company: "ADAPT Lab, UIUC",
      href: "https://arxiv.org/pdf/2507.20055",
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
      summary: "Accelerated a compiler critical path by 51 times.",
      description:
        "Co-authored research on ConstraintFlow DSL compiler optimization for neural network verification, refactored core IR passes, and created 15+ technical diagrams. Engineered multi-level caching and JIT compilation for a 51x critical-path speedup, designed a CPU-GPU synchronization and scaling roadmap, and reduced end-to-end compile time by 37% through profiling across 20+ passes.",
    },
  ],

  education: [
    {
      school: "University of Illinois Urbana-Champaign",
      href: "https://illinois.edu",
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
      featuredRank: 1,
      category: "AI/ML",
      filterGroup: "AI and ML",
      summary:
        "Built a decoder-only Transformer and a fused MoE projection kernel in JAX and Pallas.",
      impact:
        "Improved MoE forward-pass speed by approximately 1.3 times against the ragged-dot baseline.",
      description:
        "Built and trained an approximately 10M-parameter decoder-only Transformer from scratch in JAX, Flax, and Optax for algorithmic reasoning. Extended it with a top-1 MoE layer and a custom fused Pallas projection kernel, achieving approximately 1.3x faster MoE forward passes than the ragged-dot baseline.",
      technologies: ["JAX", "Flax", "Optax", "TPU", "Pallas", "MoE"],
      links: [],
      image: "/projects/jax-moe.webp",
      imageAlt:
        "Diagram of tokens routed through a top-1 MoE layer and a fused Pallas projection kernel.",
      video: "",
    },
    {
      title: "Speculative Decoding Systems Reproduction",
      dates: "Apr 2026",
      active: true,
      featured: true,
      featuredRank: 2,
      category: "AI/ML",
      filterGroup: "AI and ML",
      summary:
        "Built a draft-and-verify runtime for standard and Speculative2 decoding with Qwen3 models.",
      impact:
        "Raised throughput by 1.3 to 1.6 times and lowered latency by 15 to 20 percent.",
      description:
        "Reproduced autoregressive, standard speculative, and Speculative2 decoding with Qwen3-32B and Qwen3-8B. Built a custom draft-verify runtime and benchmarked batches 1-64, reaching 1.3-1.6x higher throughput and 15-20% lower latency while identifying diminishing returns beyond speculative depth 4.",
      technologies: ["PyTorch", "CUDA", "Qwen3", "KV Cache", "LLM Inference"],
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
        "Built a VS Code-based agentic IDE with multi-agent execution, indexing, review, and observability.",
      impact:
        "Supported more than 1,200 AI-assisted edits for more than 50 alpha users.",
      description:
        "Built an agentic IDE on a forked VS Code codebase with multi-agent execution, patch review, incremental indexing, vector search, live architecture graphs, Merkle-tree change detection, and an observability timeline. Onboarded 50+ alpha users and supported 1,200+ AI-assisted edits, with more than 60% reporting faster understanding and debugging.",
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
        "Optimized GPT-2 inference on an NVIDIA A40 with CUDA kernels and KV caching.",
      impact:
        "Reduced matmul latency by 10 to 13 percent and changed decode complexity from O(T^2) to O(T).",
      description:
        "Profiled GPT-2 inference on an NVIDIA A40 and found matmul consumed 97-99% of GPU time at only 1-4% of peak compute. Reduced matmul latency by 10-13% using higher CTA counts, shared-memory tiling, loop unrolling, and vectorized loads; implemented WMMA GEMM and KV caching to reduce autoregressive decode complexity from O(T^2) to O(T).",
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
        "Built a visual platform for composing AI agents, tools, memory, and workflows.",
      impact:
        "Unified visual agent composition, persistent memory, modular tools, and live streaming in one platform.",
      description:
        "Created a full-stack platform for composing AI agents and workflows from text prompts with a visual editor, persistent memory, and session management. Built a modular tool ecosystem and a WebSocket streaming engine for live responses.",
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
        "Built a microservices video platform with secure ingestion, transcoding, and CDN delivery.",
      impact:
        "Connected secure ingestion, automated transcoding, and global delivery across a microservices architecture.",
      description:
        "Built a microservices video platform with secure ingestion, automated FFmpeg transcoding, and global CloudFront delivery. Deployed the services through Docker and Kubernetes on AWS EKS with RabbitMQ message queues.",
      technologies: [
        "Go",
        "RabbitMQ",
        "Docker",
        "Kubernetes",
        "AWS EKS",
        "CloudFront",
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
        "Built a C++ pipeline that parses PCAP market data and stores queryable records.",
      impact:
        "Connected packet decoding, columnar storage, orchestration, and query bookkeeping in one data path.",
      description:
        "Built a high-performance C++ parser for IEX PCAP market data. Added Parquet storage, a SQLite bookkeeper, multithreaded ingestion, and Apache Airflow orchestration.",
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
        "Built a collaborative editor with CRDT synchronization and custom WebSocket infrastructure.",
      impact:
        "Enabled conflict-free multi-user editing with live cursors and document versioning.",
      description:
        "Developed a real-time collaborative editor with Yjs CRDT synchronization, custom WebSocket infrastructure, and an AWS serverless deployment. Added live cursors, document versioning, and conflict-free multi-user editing.",
      technologies: [
        "React",
        "TypeScript",
        "Node.js",
        "WebSocket",
        "AWS Lambda",
        "Yjs",
        "DynamoDB",
      ],
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
        "Built a lightweight note application with Markdown and real-time collaboration.",
      impact:
        "Combined fast note capture, structured organization, and shared editing in one interface.",
      description:
        "A streamlined note-taking application with Markdown support, real-time collaboration, and lightweight organization tools.",
      technologies: ["TypeScript", "React", "Markdown"],
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
        "QuickMark note-taking interface with a Markdown editor and organized notes.",
      video: "",
    },
    {
      title: "Aether - AI Email Client",
      dates: "2024",
      active: true,
      featured: false,
      featuredRank: null,
      category: "Web Dev",
      filterGroup: "Developer Tools and Web",
      summary:
        "Built an AI-first email client that runs language-model features on the user's device.",
      impact:
        "Kept email data private while providing fast AI-assisted email operations.",
      description:
        "An AI-first email client built around a local language model for privacy, data sovereignty, and fast on-device operations.",
      technologies: ["React", "TypeScript", "Local LLM", "Email"],
      links: [],
      image: "/projects/aether.webp",
      imageAlt:
        "Aether email client interface with an inbox and AI-assisted email controls.",
      video: "",
    },
    {
      title: "Custom Programming Language Interpreter",
      href: "https://github.com/GoyalIshaan/interpreter-in-go",
      dates: "2023",
      active: false,
      featured: false,
      featuredRank: null,
      category: "Low Level",
      filterGroup: "Systems, HFT, and Data",
      summary:
        "Built a complete interpreter in Go with a lexer, parser, evaluator, and REPL.",
      impact:
        "Supported first-class functions, closures, and interactive program evaluation.",
      description:
        "Built a complete interpreter in Go for a custom language, including a lexer, parser, evaluator, first-class functions, closures, and a REPL.",
      technologies: ["Go", "Compiler Design", "Language Design"],
      links: [
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/interpreter-in-go",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/projects/interpreter.webp",
      imageAlt:
        "Diagram of source code moving through a lexer, parser, evaluator, and interactive REPL.",
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
        "Built a Unix shell in C with pipes, redirection, background jobs, and built-in commands.",
      impact:
        "Implemented process creation, coordination, and job control through Unix system calls.",
      description:
        "Developed a Unix shell in C with piping, redirection, background processes, process management, and custom built-in commands.",
      technologies: ["C", "Unix", "Systems Programming"],
      links: [],
      image: "/projects/unix-shell.webp",
      imageAlt:
        "Diagram of a Unix shell connecting commands through pipes, redirection, and background jobs.",
      video: "",
    },
    {
      title: "High-Performance Memory Manager",
      dates: "2023",
      active: false,
      featured: false,
      featuredRank: null,
      category: "Low Level",
      filterGroup: "Systems, HFT, and Data",
      summary:
        "Built custom malloc and free primitives in C with an optimized allocation strategy.",
      impact:
        "Reduced allocation overhead and fragmentation while approaching the reference implementation.",
      description:
        "Implemented custom malloc and free primitives in C, optimizing allocation speed, fragmentation, and memory usage to approach the published reference implementation.",
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
        "Built a zero-copy C++ decoder for Nasdaq ITCH 5.0 binary market data.",
      impact:
        "Processed approximately 595,000 messages per second with 1.68 microseconds of latency.",
      description:
        "Built a zero-copy Nasdaq ITCH 5.0 binary decoder processing approximately 595,000 messages per second at 1.68 microseconds per message. Added profiling, validation, signal handling, and CSV export.",
      technologies: ["C++", "mmap", "Makefile", "perf", "valgrind", "CSV"],
      links: [
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/itch-decoder",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/projects/itch-decoder.webp",
      imageAlt:
        "Diagram of memory-mapped Nasdaq ITCH packets moving through a zero-copy decoder.",
      video: "",
    },
  ],
} as const;
