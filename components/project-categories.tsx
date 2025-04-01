"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Project data with categories
const projects = [
  {
    id: 1,
    title: "Hephaestus",
    description:
      "A custom AI context and shared memory layer enabling agents to persist knowledge across interactions, solving the challenge of context loss in LLM-based workflows. Implemented with Next.js, TypeScript, LangChain, OpenAPI, WebSockets, ShadCN, and AWS.",
    tags: [
      "Next.js",
      "TypeScript",
      "LangChain",
      "OpenAPI",
      "WebSockets",
      "AWS",
    ],
    image: "/hephaestus.png",
    githubUrl: "#",
    demoUrl: "#",
    category: "ai",
  },
  {
    id: 5,
    title: "NFT Reality Marketplace",
    description:
      "VR-based NFT marketplace developed with a 10-member international team, integrating Unity-based VR interactions and 3D designs to forge an intuitive, immersive user experience.",
    tags: ["Unity", "VR", "3D Design", "UI/UX", "Blockchain"],
    image: "/nft_reality_cover.jpg",
    githubUrl: "https://github.com/GoyalIshaan/NFT-Reality",
    category: "blockchain",
  },
  {
    id: 9,
    title: "Custom Programming Language Interpreter",
    description:
      "Built a complete interpreter in Go for a custom programming language, including lexer, parser, and evaluator. Implemented features such as first-class functions, closures, and a comprehensive standard library.",
    tags: ["Go", "Compiler Design", "Language Design", "Interpreters"],
    image: "/placeholder.svg?height=300&width=500",
    githubUrl: "https://github.com/GoyalIshaan/interpreter-in-go",
    category: "lowlevel",
  },
  {
    id: 2,
    title: "Docnest",
    description:
      "A real-time text collaboration platform with collaborative editing, document management, in-document chat, and responsive UI. Deployed with AWS EC2, Ubuntu, SSH, Nginx reverse proxy, enhancing application security and performance.",
    tags: ["React", "TypeScript", "Node.js", "WebSocket", "PostgreSQL", "AWS"],
    image: "/docnest.jpeg",
    githubUrl: "https://github.com/GoyalIshaan/docnest",
    demoUrl: "#",
    category: "webdev",
  },
  {
    id: 7,
    title: "Custom Unix Shell",
    description:
      "Developed a fully functional Unix shell in C with support for piping, redirection, background processes, and custom built-in commands. Implemented robust signal handling and process management.",
    tags: ["C", "Unix", "Systems Programming", "Process Management"],
    image: "/placeholder.svg?height=300&width=500",
    githubUrl: "#",
    category: "lowlevel",
  },
  {
    id: 10,
    title: "QuickMark",
    description:
      "A streamlined note-taking application with markdown support, real-time collaboration features, and intuitive organization tools. Designed for students and professionals who need to capture and organize information quickly.",
    tags: ["TypeScript", "React", "Markdown", "Collaboration"],
    image: "/quickmark.jpeg",
    githubUrl: "https://github.com/GoyalIshaan/quickmark",
    demoUrl: "#",
    category: "webdev",
  },
  {
    id: 8,
    title: "High-Performance Memory Allocator",
    description:
      "Implemented a custom malloc/free implementation in C that achieves performance comparable to the official published version. Optimized for both speed and memory efficiency using advanced memory management techniques.",
    tags: [
      "C",
      "Memory Management",
      "Performance Optimization",
      "Systems Programming",
    ],
    image: "/placeholder.svg?height=300&width=500",
    githubUrl: "#",
    category: "lowlevel",
  },
  {
    id: 11,
    title: "WorldWise",
    description:
      "An interactive travel companion app that helps users track and share their global adventures. Features include interactive maps, trip logging, and personalized travel statistics.",
    tags: ["JavaScript", "React", "Maps API", "Local Storage"],
    image: "/worldwise.jpeg",
    githubUrl: "https://github.com/GoyalIshaan/WorldWise",
    demoUrl: "#",
    category: "webdev",
  },
  {
    id: 12,
    title: "Itch Decoder",
    description:
      "A specialized tool for decoding and analyzing itch.io game files. Built with Python and C++, featuring efficient binary parsing, file format detection, and comprehensive metadata extraction.",
    tags: ["Python", "C++", "Binary Parsing", "File Analysis"],
    image: "/placeholder.svg?height=300&width=500",
    githubUrl: "https://github.com/GoyalIshaan/itch-decoder",
    category: "lowlevel",
  },
];

// Category definitions
const categories = [
  { id: "all", label: "All Projects" },
  { id: "ai", label: "AI & Machine Learning" },
  { id: "webdev", label: "Web Development" },
  { id: "lowlevel", label: "Low-Level & Systems" },
  { id: "blockchain", label: "Blockchain & VR" },
];

export function ProjectCategories() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter projects based on active category
  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <div className="space-y-8">
      <Tabs
        defaultValue="all"
        onValueChange={setActiveCategory}
        className="w-full"
      >
        <div className="flex justify-center">
          <TabsList className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="px-3 py-1.5 text-sm"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
              >
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    title={project.title}
                    description={project.description}
                    tags={project.tags}
                    image={project.image}
                    githubUrl={project.githubUrl}
                    demoUrl={project.demoUrl}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-center mt-12">
        <Button variant="outline" className="gap-2">
          <Link
            href="https://github.com/GoyalIshaan?tab=repositories"
            className="flex items-center gap-2"
          >
            View All Projects <Github className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
