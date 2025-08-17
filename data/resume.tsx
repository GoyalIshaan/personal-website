import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Ishaan Goyal",
  initials: "IG",
  url: "https://ishaangoyal.dev",
  location: "Champaign, IL",
  locationLink: "https://www.google.com/maps/place/champaign+illinois",
  description:
    "CS student @ UIUC passionate about AI systems, low-level programming, and building high-performance infrastructure. Currently researching compiler optimization for neural networks and working on scalable AI platforms.",
  summary:
    "I'm a CS student @ UIUC specializing in AI systems, compiler optimization, and high-performance computing. Currently researching compiler optimization for neural network verification at ADAPT Lab, with experience building scalable AI platforms, market data pipelines, and VR applications. Passionate about the intersection of AI, low-level systems, and performance engineering.",
  avatarUrl: "/pfp.jpg",
  skills: [
    "C",
    "C++",
    "C#",
    "Go",
    "Python",
    "Java",
    "JavaScript/TypeScript",
    "Linux",
    "Docker",
    "Kubernetes",
    "AWS",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Elasticsearch",
    "TensorFlow",
    "PyTorch",
    "gRPC",
    "GraphQL",
    "RabbitMQ",
    "WebSockets",
    "Apache Airflow",
    "Prometheus",
    "Verilog",
    "MIPS",
    "Compilers",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/projects", icon: NotebookIcon, label: "Projects" },
  ],
  contact: {
    email: "ishaan6@illinois.edu",
    tel: "+1 (217) 202-0293",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/GoyalIshaan",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/ishaan-goyal/",
        icon: Icons.linkedin,
        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/IshaanGoyal05",
        icon: Icons.x,
        navbar: true,
      },
      email: {
        name: "Send Email",
        url: "mailto:ishaan6@illinois.edu",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "Gies VR Metaverse (Gies School of Business, UIUC)",
      href: "https://business.illinois.edu/",
      badges: ["Unity", "C#", "Oculus SDK", "AI/ML"],
      location: "Champaign, IL",
      title: "Virtual Reality Developer Intern",
      logoUrl: "/uiucLogo.png",
      start: "Jan 2025",
      end: "May 2025",
      description:
        "Coordinated with a 6-member interdisciplinary team to architect and refine immersive 3D learning environments in Unity and Blender, elevating visual fidelity and interactive engagement. Optimized the AI-driven avatar pipeline, reducing end-to-end inference latency by 75% (to sub-100 ms) and cutting operational costs by 50% through dynamic model serving and resource scaling.",
    },
    {
      company: "Jinship (Disruption Lab)",
      badges: ["React", "TypeScript", "OpenAI API", "Firebase"],
      href: "https://disruptionlab.org/",
      location: "Remote",
      title: "Software Developer Intern",
      logoUrl: "/dLab.jpg",
      start: "Sep 2024",
      end: "Dec 2024",
      description:
        "Led the implementation of a feedback system using Firebase Firestore, sustaining 200+ req/s with <100ms write latency and 100% data reliability. Built real-time analytics dashboards in React/TypeScript, querying Firebase Analytics and Firestore to surface key metrics (session duration, drop-off rates) with sub-100 ms response times.",
    },
    {
      company: "NFT Reality",
      href: "#",
      badges: ["Blockchain", "Web3", "Leadership"],
      location: "Remote",
      title: "Founder",
      logoUrl: "/nftReality.jpeg",
      start: "Dec 2021",
      end: "Feb 2023",
      description:
        "Launched a VR-based NFT marketplace, managed a 10-member team, and built a community of 700+ members. Designed and implemented smart contracts, developed full-stack web applications, and established strategic partnerships. Led product development from concept to launch with strong focus on user experience.",
    },
  ],
  research: [
    {
      company: "ADAPT Lab, UIUC",
      href: "https://arxiv.org/pdf/2507.20055",
      badges: [
        "Neural Network Certification",
        "Compiler Optimization",
        "JIT",
        "Caching",
        "GPU Architecture",
      ],
      location: "Champaign, IL",
      title: "Compiler Researcher",
      logoUrl: "/adaptLab.png",
      start: "May 2025",
      end: "Present",
      description:
        "Optimized ConstraintFlow DSL compiler for neural network verification, refactoring core passes and creating 15+ diagrams. Engineered multi-level caching and JIT compilation accelerating operations by 45×. Built profiling instrumentation across 20+ compilation stages, eliminating bottlenecks to reduce compile-time by 30%. Co-authored published research paper on 'A Tensor-Based Compiler and a Runtime for Neuron-Level DNN Certifier Specifications' introducing novel compiler framework for DNN verification.",
    },
  ],
  education: [
    {
      school: "University of Illinois Urbana-Champaign",
      href: "https://illinois.edu",
      degree:
        "Bachelor of Science in Computer Science (James Scholar Honors Program)",
      logoUrl: "/uiucLogo.png",
      start: "2022",
      end: "2027",
      description:
        "Relevant Coursework: Data Structures, Algorithms, Operating System, Systems Programming, Advanced Computer Architecture, Calculus (I, II, III), Linear Algebra, Parallel Programming, High Frequency Trading",
    },
  ],
  projects: [
    {
      title: "VidSmith",
      href: "https://github.com/ishaan/vidsmith",
      dates: "Jul 2025",
      active: true,
      description:
        "Scalable microservices video platform with secure ingestion, automated transcoding, and global CDN delivery. Built on AWS EKS with RabbitMQ messaging, achieving sub-50ms latencies at 10k req/s. Optimized FFmpeg transcoding reducing processing time by 40%, and deployed CloudFront CDN cutting startup latency by 70%.",
      technologies: [
        "Go",
        "RabbitMQ",
        "Docker",
        "Kubernetes",
        "AWS EKS",
        "AWS CloudFront",
        "FFmpeg",
        "Microservices",
      ],
      links: [
        {
          type: "Demo",
          href: "https://vidsmith.org/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/vidSmith",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/vidSmith.png",
      video: "",
    },
    {
      title: "Market Data Warehouse Pipeline",
      href: "https://github.com/ishaan/market-data-pipeline",
      dates: "Apr 2025 - Jun 2025",
      active: true,
      description:
        "High-performance C++ PCAP parser processing IEX market data at 1M+ msgs/s with sub-200µs latency. Built modular ingestion system with SQLite bookkeeper for 1B+ record queries. Automated pipeline orchestration with Apache Airflow achieving 99.9% uptime and 3× throughput improvement.",
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
      links: [
        {
          type: "Source",
          href: "https://gitlab.engr.illinois.edu/ie421_high_frequency_trading_spring_2025/ie421_hft_spring_2025_group_14/group_14_project",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/default.jpg",
      video: "",
    },
    {
      title: "Hephaestus AI Platform",
      href: "/",
      dates: "Jan 2024 - Present",
      active: true,
      description:
        "Built a comprehensive AI context/memory layer for LLM agents with modular OpenAPI tool schema and real-time execution streaming. Implemented advanced prompt engineering and multi-agent coordination systems. Designed scalable architecture handling 10K+ concurrent AI conversations with sub-100ms response times.",
      technologies: [
        "Next.js",
        "TypeScript",
        "LangChain",
        "AWS",
        "OpenAI",
        "Redis",
        "Postgres",
        "Docker",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/hephaestus",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/hephaestus.png",
      video: "",
    },
    {
      title: "Docnest Collaborative Editor",
      href: "https://docnest.dev",
      dates: "June 2024 - Oct 2024",
      active: true,
      description:
        "Developed a real-time collaborative text editor with Yjs CRDT for conflict-free synchronization, custom WebSocket infrastructure, and AWS serverless deployment. Features include live cursors, document versioning, and multi-user editing with operational transforms.",
      technologies: [
        "React",
        "TypeScript",
        "Node.js",
        "WebSocket",
        "AWS Lambda",
        "Yjs",
        "DynamoDB",
        "CloudFormation",
      ],
      links: [
        {
          type: "Source",
          href: "https://github.com/GoyalIshaan/docnest",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/docnest.png",
      video: "",
    },
  ],
} as const;
