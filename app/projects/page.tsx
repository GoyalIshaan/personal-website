"use client";

import { Badge } from "@/components/ui/badge";
import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { Icons } from "@/components/icons";
import { useState } from "react";

const BLUR_FADE_DELAY = 0.04;

const categories = ["All", "Web Dev", "HFT", "Low Level"];

const projects = [
  {
    title: "VidSmith",
    href: "https://github.com/GoyalIshaan/vidSmith",
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
    category: "Web Dev",
  },
  {
    title: "Market Data Warehouse Pipeline",
    href: "https://github.com/GoyalIshaan/market-data-pipeline",
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
        href: "https://github.com/GoyalIshaan/market-data-pipeline",
        icon: <Icons.github className="size-3" />,
      },
    ],
    image: "/default.jpg",
    video: "",
    category: "HFT",
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
    category: "Web Dev",
  },
  {
    title: "QuickMark",
    href: "#",
    dates: "2024",
    active: true,
    description:
      "A streamlined note-taking application with markdown support, real-time collaboration features, and intuitive organization tools.",
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
    image: "/quickmark.png",
    video: "",
    category: "Web Dev",
  },
  {
    title: "Aether - AI Email Client",
    href: "#",
    dates: "2024",
    active: true,
    description:
      "An AI-first email client with a local LLM for maximum security, data sovereignty, and lightning-fast operations.",
    technologies: ["React", "TypeScript", "LLM", "Email"],
    links: [
      {
        type: "Source",
        href: "https://github.com/GoyalIshaan/aether",
        icon: <Icons.github className="size-3" />,
      },
    ],
    image: "/aether.png",
    video: "",
    category: "Web Dev",
  },
  {
    title: "Custom Programming Language Interpreter",
    href: "#",
    dates: "2023",
    active: false,
    description:
      "Built a complete interpreter in Go for a custom programming language, including lexer, parser, and evaluator. Implemented features such as first-class functions, closures, and a REPL.",
    technologies: ["Go", "Compiler Design", "Language Design"],
    links: [
      {
        type: "Source",
        href: "https://github.com/GoyalIshaan/interpreter-in-go",
        icon: <Icons.github className="size-3" />,
      },
    ],
    image: "/default.jpg",
    video: "",
    category: "Low Level",
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
    category: "Web Dev",
  },
  {
    title: "Custom Unix Shell",
    href: "#",
    dates: "2023",
    active: false,
    description:
      "Developed a fully functional Unix shell in C with support for piping, redirection, background processes, and custom built-in commands.",
    technologies: ["C", "Unix", "Systems Programming"],
    links: [],
    image: "/default.jpg",
    video: "",
    category: "Low Level",
  },

  {
    title: "High-Performance Memory Manager",
    href: "#",
    dates: "2023",
    active: false,
    description:
      "Implemented a custom malloc/free implementation in C that achieves performance comparable to the official published version. Optimized for both speed and memory usage.",
    technologies: ["C", "Memory Management", "Performance Optimization"],
    links: [],
    image: "/default.jpg",
    video: "",
    category: "Low Level",
  },
  {
    title: "Itch Decoder",
    href: "#",
    dates: "2024",
    active: true,
    description:
      "A specialized tool for decoding and analyzing Itch.io game files. Built with Python and C++, featuring efficient binary parsing, file format detection, and visualization tools.",
    technologies: ["Python", "C++", "Binary Parsing"],
    links: [
      {
        type: "Source",
        href: "https://github.com/GoyalIshaan/itch-decoder",
        icon: <Icons.github className="size-3" />,
      },
    ],
    image: "/default.jpg",
    video: "",
    category: "Low Level",
  },
  {
    title: "Nasdaq ITCH Market Data Decoder",
    href: "#",
    dates: "2024",
    active: true,
    description:
      "High-throughput binary decoder for Nasdaq ITCH 5.0 protocol (650K msgs/sec, 1.68µs latency), with zero-copy parsing, profiling, and CSV export.",
    technologies: ["C++", "mmap", "Makefile", "perf", "valgrind", "CSV"],
    links: [],
    image: "/default.jpg",
    video: "",
    category: "HFT",
  },
];

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <main className="min-h-screen bg-background font-sans antialiased max-w-2xl mx-auto py-1 sm:py-1 px-6">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none mb-8">
          Projects
        </h1>
      </BlurFade>

      <BlurFade delay={BLUR_FADE_DELAY * 2}>
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </BlurFade>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto">
        {filteredProjects.map((project, idx) => (
          <BlurFade
            key={project.title}
            delay={BLUR_FADE_DELAY * 3 + idx * 0.05}
          >
            <ProjectCard
              href={project.href}
              key={project.title}
              title={project.title}
              description={project.description}
              dates={project.dates}
              tags={project.technologies}
              image={project.image}
              video={project.video}
              links={project.links}
            />
          </BlurFade>
        ))}
      </div>
    </main>
  );
}
