"use client";

// app/projects/page.tsx
// Projects page for Ishaan Goyal's portfolio

import Link from "next/link";
import { useState } from "react";

const categories = ["All", "Web Dev", "HFT", "Low Level"];

const projects = [
  {
    title: "Hephaestus",
    description:
      "A custom AI context and shared memory layer enabling agents to persist knowledge across interactions, solving the challenge of context loss in LLM-based workflows.",
    tech: ["Next.js", "TypeScript", "LangChain"],
    code: "https://github.com/GoyalIshaan/hephaestus",
    demo: null,
    category: "Web Dev",
  },
  {
    title: "NFT Reality Marketplace",
    description:
      "VR-based NFT marketplace developed with a 10-member international team, integrating Unity-based VR interactions and 3D designs to forge an intuitive, immersive user experience.",
    tech: ["Unity", "VR", "3D Design"],
    code: "#",
    demo: null,
    category: "Web Dev",
  },
  {
    title: "Custom Programming Language Interpreter",
    description:
      "Built a complete interpreter in Go for a custom programming language, including lexer, parser, and evaluator. Implemented features such as first-class functions, closures, and a REPL.",
    tech: ["Go", "Compiler Design", "Language Design"],
    code: "https://github.com/GoyalIshaan/interpreter-in-go",
    demo: null,
    category: "Low Level",
  },
  {
    title: "Docnest",
    description:
      "A real-time text collaboration platform with collaborative editing, document management, in-document chat, and responsive UI. Deployed with AWS.",
    tech: ["React", "TypeScript", "Node.js"],
    code: "https://github.com/GoyalIshaan/docnest",
    demo: null,
    category: "Web Dev",
  },
  {
    title: "Custom Unix Shell",
    description:
      "Developed a fully functional Unix shell in C with support for piping, redirection, background processes, and custom built-in commands.",
    tech: ["C", "Unix", "Systems Programming"],
    code: "#",
    demo: null,
    category: "Low Level",
  },
  {
    title: "QuickMark",
    description:
      "A streamlined note-taking application with markdown support, real-time collaboration features, and intuitive organization tools.",
    tech: ["TypeScript", "React", "Markdown"],
    code: "#",
    demo: null,
    category: "Web Dev",
  },
  {
    title: "High-Performance Memory Manager",
    description:
      "Implemented a custom malloc/free implementation in C that achieves performance comparable to the official published version. Optimized for both speed and memory usage.",
    tech: ["C", "Memory Management", "Performance Optimization"],
    code: "#",
    demo: null,
    category: "Low Level",
  },
  {
    title: "Itch Decoder",
    description:
      "A specialized tool for decoding and analyzing Itch.io game files. Built with Python and C++, featuring efficient binary parsing, file format detection, and visualization tools.",
    tech: ["Python", "C++", "Binary Parsing"],
    code: "https://github.com/GoyalIshaan/itch-decoder",
    demo: null,
    category: "Low Level",
  },
  {
    title: "Nasdaq ITCH Market Data Decoder",
    description:
      "High-throughput binary decoder for Nasdaq ITCH 5.0 protocol (650K msgs/sec, 1.68µs latency), with zero-copy parsing, profiling, and CSV export.",
    tech: ["C++", "mmap", "Makefile", "perf", "valgrind", "CSV"],
    code: "#",
    demo: null,
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
    <main className="min-h-screen bg-white text-black flex flex-col items-center px-4 py-16">
      <h1 className="text-4xl font-extrabold mb-10 text-center">Projects</h1>
      <div className="flex gap-6 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`bg-transparent border-none p-0 m-0 text-base font-medium underline-offset-4 transition-colors duration-150 cursor-pointer ${
              selectedCategory === cat
                ? "text-blue-600 underline"
                : "text-gray-700 hover:underline"
            }`}
            style={{ background: "none" }}
          >
            {cat}
          </button>
        ))}
      </div>
      <ul className="w-full max-w-3xl space-y-8">
        {filteredProjects.map((project) => (
          <li key={project.title}>
            <div className="mb-1 text-lg font-bold">{project.title}</div>
            <div className="mb-2 text-sm text-gray-700">
              {project.description}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="bg-gray-200 text-xs px-2 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-4">
              {project.code && project.code !== "#" && (
                <Link
                  href={project.code}
                  className="underline text-blue-600 text-sm"
                  target="_blank"
                >
                  GitHub
                </Link>
              )}
              {project.demo && project.demo !== "#" && (
                <Link
                  href={project.demo}
                  className="underline text-blue-600 text-sm"
                  target="_blank"
                >
                  Demo
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
