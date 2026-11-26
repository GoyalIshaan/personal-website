import { Icons } from "@/components/icons";
import { JENS_SON_POST } from "@/data/blogs";
import { NAV_ITEMS, SOCIAL_LINKS } from "@/data/navigation";

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
  avatarUrl: "/profile-x.webp",

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
      title: "Founding Engineer, ML",
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
      title: "Jen's Son",
      dates: "Nov 2026",
      active: true,
      featured: true,
      featuredRank: 0,
      category: "AI/ML",
      filterGroup: "AI and ML",
      summary:
        "I designed a batch-1 inference chip for Qwen3.5-9B with custom matrix, vector, and Gated DeltaNet units.",
      impact:
        "A timing simulator calibrated with RTL measurements estimates 90.3 decode tokens/s at 32K context, assuming a 1 GHz clock.",
      description:
        "I designed Jen’s Son for running Qwen3.5-9B one request at a time. A four-slot VLIW core dispatches commands to custom matrix, vector, and Gated DeltaNet units, with a bit-exact reference model for checking the RTL. The timing simulator, calibrated with RTL measurements, estimates 90.3 decode tokens/s at 32K context assuming a 1 GHz clock.",
      technologies: ["SystemVerilog", "Verilator", "Python", "VLIW", "GDDR7"],
      links: [
        {
          type: "Blog",
          href: `/blogs/${JENS_SON_POST.slug}`,
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/jens-son",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      imageAlt: "",
      video: "",
    },
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
        "I built a speculative-decoding runtime with CUDA graphs, rollback-safe KV caches, multi-GPU draft forecasting, and custom Triton kernels, reaching 697 tokens/s on a single request.",
      impact:
        "Connected speculative execution, GPU kernels, cache-state management, and numerical/performance evaluation.",
      description:
        "I built an inference runtime for speculative and speculative speculative decoding with fused GPU kernels, CUDA graph replay, and execution overlapped across two GPUs. With Qwen2.5-7B in FP8 and a trained EAGLE-3 drafter, it reached 697 decode tokens/s on one request on two B300s, about 2× my tuned autoregressive baseline, and ran a single request to 128,000 tokens. Along the way I built an exact-match test suite, tracked down a KV-cache stride bug, and found new matmul schedules worth 17–21% end to end.",
      technologies: ["Python", "PyTorch", "Triton", "CUDA", "C++", "CUDA Graphs", "Nsight Systems"],
      links: [
        {
          type: "Blog",
          href: "/blogs/speculative-decoding",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/speculative-decoding-lab",
          icon: <Icons.github className="size-3" />,
        },
      ],
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
        "I built a C++ parser for IEX packet captures and connected it to a market-data pipeline with Parquet storage, SQLite bookkeeping, and multithreaded ingestion. Airflow coordinates the jobs around that data path. In related earlier work, I built a C++ decoder that memory-mapped Nasdaq ITCH 5.0 files and used a dispatch table and compile-time layout checks to turn binary messages into CSV records.",
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
  ],
} as const;
