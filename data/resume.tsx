import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

/**
 * Main resume data structure for Ishaan Goyal's personal website
 * This file contains all static data used across the website components
 * 
 * Structure:
 * - Personal information (name, location, description)
 * - Skills list
 * - Navigation configuration
 * - Contact information with social links
 * - Work experience history
 * - Research experience
 * - Education background
 * - Projects portfolio
 */
export const DATA = {
  // Personal Information
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

  // Technical Skills - categorized by programming languages, tools, frameworks
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

  // Navigation menu items for the website header
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/projects", icon: NotebookIcon, label: "Projects" },
  ],

  // Contact information including email, phone, and social media links
  contact: {
    email: "ishaan6@illinois.edu",
    tel: "+1 (217) 202-0293",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/GoyalIshaan",
        icon: Icons.github,
        navbar: true, // Whether to show in navigation bar
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

  // Work Experience - chronological order (most recent first)
  work: [
    {
      company: "Gies VR Metaverse (Gies School of Business, UIUC)",
      href: "https://business.illinois.edu/",
      badges: ["Unity", "C#", "Oculus SDK", "AI/ML"], // Technology tags
      location: "Champaign, IL",
      title: "Virtual Reality Developer Intern",
      logoUrl: "/uiucLogo.png", // Path to company logo image
      start: "Jan 2025", // Start date (formatted as Month YYYY)
      end: "May 2025", // End date or 'Present' for current role
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
      href: "#", // Use '#' if no external link available
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

  // Research Experience - academic research positions
  research: [
    {
      company: "ADAPT Lab, UIUC", 
      href: "https://arxiv.org/pdf/2507.20055", // Link to research paper or lab website
      badges: [
        "Neural Network Certification", 
        "Compiler Optimization", 
        "JIT", 
        "Caching", 
        "GPU Architecture"
      ],
      location: "Champaign, IL", 
      title:"Compiler Researcher", 
      logoUrl:"/adaptLab.png", 
       start:"May 2025", 
       end:"Aug 2025", // Current research position uses 'Present'
       description:
         `Optimized ConstraintFlow DSL compiler for neural network verification,
          refactoring core passes and creating15+ diagrams.
          Engineered multi-level caching and JIT compilation accelerating operations by45×.
          Built profiling instrumentation across20+ compilation stages,
          eliminating bottlenecks to reduce compile-time by30%.
          Co-authored published research paper on'A Tensor-Based Compiler and a Runtime for Neuron-Level DNN Certifier Specifications'
          introducing novel compiler framework for DNN verification.`,
     }
   ],

   // Education History 
   education:[{
       school:"University of Illinois Urbana-Champaign", 
       href:"https://illinois.edu", 
       degree:
         `Bachelor of Science in Computer Science (James Scholar Honors Program)`, 
       logoUrl:"/uiucLogo.png", 
       start:"2022", 
       end:"2027", 
       description:
         `Relevant Coursework:
          Data Structures,
          Algorithms,
          Operating System,
          Systems Programming,
          Advanced Computer Architecture,
          Calculus(I,
          II,
          III),
          Linear Algebra,
          Parallel Programming,
          High Frequency Trading`
     }
   ],

   // Projects Portfolio - showcase of technical projects with links,dates,and technologies used.
   projects: [
    {
      title: "GPT-2 Inference on NCSA Cluster",
      href: "#",
      dates: "Fall 2025",
      active: true,
      description: "Built and deployed a high-performance GPT-2 inference pipeline on UIUC’s NCSA HPC cluster using NVIDIA A40 GPUs. Implemented KV-cache optimizations, FlashAttention-style attention kernels, and Tensor Core–backed GEMMs, with profiling-driven iteration using Nsight to push latency and throughput close to hardware limits.",
      technologies: [
        "C++",
        "CUDA",
        "PyTorch",
        "MPI",
        "Slurm",
        "NVIDIA Nsight",
        "HPC"
      ],
      links: [
      ],
      image: "/default.jpg",
      video: "",
    },
    {
      title: "Ren – Agentic IDE",
      href: "#",
      dates: "Winter 2025",
      active: true,
      description: "Built Ren as a project exploring agentic developer workflows for large codebases. The system mapped codebases into interactive graphs, tracked AI-generated edits, and coordinated multiple AI agents while preserving human control and code provenance. The quality of the build and the underlying idea led to a YC interview.",
      technologies: [
        "TypeScript",
        "Next.js",
        "React",
        "Graph Theory",
        "LLMs",
        "Agentic Workflows"
      ],
      links: [
        {
          type: "Demo",
          href: "https://ren-ide.com/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/default.jpg",
      video: "",
    },
    {
       title:"VidSmith", 
       href:"https://github.com/ishaan/vidsmith", // Main project link (GitHub or live demo)
       dates:"Jul2025", // Date range or single date when project was completed.
       active :true ,// Whether project is actively maintained.
       description :
         `Scalable microservices video platform with secure ingestion,
          automated transcoding,and global CDN delivery.
          Built on AWS EKS with RabbitMQ messaging,
          achieving sub-50ms latencies at10k req/s.
          Optimized FFmpeg transcoding reducing processing time by40% ,
          and deployed CloudFront CDN cutting startup latency by70%.`,
       technologies :[
         `Go`,
         `RabbitMQ`,
         `Docker`,
         `Kubernetes`,
         `AWS EKS`,
         `AWS CloudFront`,
         `FFmpeg`,
         `Microservices`
       ],
       links:[{
           type:`Demo`,// Type of link (Demo ,Source ,Documentation etc.)
           href:`https://vidsmith.org/`,// URL for demo/live site.
           icon:<Icons.globe className="size-3"/>
         },{
           type:`Source`,// GitHub repository link.
           href:`https://github.com/GoyalIshaan/vidSmith`,// GitHub URL.
           icon:<Icons.github className="size-3"/>
         }
       ],
       image:`/vidSmith.png`,// Project screenshot/image path.
       video:``,// Optional video demo URL.
     },{
       title:`Market Data Warehouse Pipeline`, 
       href:`https://github.com/ishaan/market-data-pipeline`, 
       dates:`Apr2025-Jun2025`,// Date range format for multi-month projects.
       active :true ,
       description :
         `High-performance C++ PCAP parser processing IEX market data at1M+ msgs/s with sub-200µs latency.
          Built modular ingestion system with SQLite bookkeeper for1B+ record queries.
          Automated pipeline orchestration with Apache Airflow achieving99.9% uptime and3× throughput improvement.`,
       technologies :[
         `C++`,
         `Python`,
         `Linux`,
         `SQLite`,
         `Apache Airflow`,
         `PCAP`,
         `Parquet`,
         `Multithreading`
       ],
       links:[{
           type:`Source`,// GitLab repository link (alternative to GitHub).
           href:`https://gitlab.engr.illinois.edu/ie421_high_frequency_trading_spring_2025/ie421_hft_spring_2025_group_14/group_14_project`,// GitLab URL.
           icon:<Icons.github className="size-3"/>// Using GitHub icon for consistency.
         }
       ],
       image:`/default.jpg`,// Default placeholder image.
       video:``
     },{
       title:`Hephaestus AI Platform`, 
       href:`/`,// Internal link (points to homepage).
       dates:`Jan2024-Present`,// Ongoing project uses 'Present'.
       active :true ,
       description :
         `Built a comprehensive AI context/memory layer for LLM agents with modular OpenAPI tool schema and real-time execution streaming.
          Implemented advanced prompt engineering and multi-agent coordination systems.
          Designed scalable architecture handling10K+ concurrent AI conversations with sub-100ms response times.`,
       technologies :[
         `Next.js`,
         `TypeScript`,
         `LangChain`,
         `AWS`,
         `OpenAI`,
         `Redis`,
         `Postgres`,
         `Docker`
       ],
       links:[{
           type:`Source`,// GitHub repository link.
           href:`https://github.com/GoyalIshaan/hephaestus`,// GitHub URL.
           icon:<Icons.github className="size-3"/>
         }
       ],
       image:`/hephaestus.png`,// Project screenshot/image path.
       video:``
     },{
       title:`Docnest Collaborative Editor`, 
       href:`https://docnest.dev`,// Live demo URL.
       dates:`June2024-Oct2024`,// Date range format.
       active :true ,
       description :
         `Developed a real-time collaborative text editor with Yjs CRDT for conflict-free synchronization,
          custom WebSocket infrastructure,and AWS serverless deployment.
          Features include live cursors,document versioning,and multi-user editing with operational transforms.`,
       technologies :[
         `React`,
         `TypeScript`,
         `Node.js`,
         `WebSocket`,
         `AWS Lambda`,
         `Yjs`,
         `DynamoDB`,
         `CloudFormation`
       ],
       links:[{
           type:`Source`,// GitHub repository link.
           href:`https://github.com/GoyalIshaan/docnest`,// GitHub URL.
           icon:<Icons.github className="size-3"/>
         }
       ],
       image:`/docnest.png`,// Project screenshot/image path.
       video:``
     }
   ]
} as const;