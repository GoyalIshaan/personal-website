import Link from "next/link";
import GitHubActivity from "@/components/GitHubActivity";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center px-4 py-16">
      {/* Profile Picture and Name */}
      <div className="flex flex-col items-center mb-10">
        <img
          src="/pfp.jpg"
          alt="Ishaan Goyal"
          className="w-32 h-32 rounded-full mb-6 border border-gray-200 shadow-sm object-cover"
        />
        <h1 className="text-4xl font-extrabold mb-2 text-center">
          Hey, I'm Ishaan
        </h1>
        <p className="text-lg text-center max-w-xl mb-4">
          I'm a CS student @ UIUC, passionate about building impactful
          technology and solving complex problems. I love working across the
          stack, from real-time web apps to AI-powered tools.
        </p>
        <div className="flex gap-6 mt-2">
          <Link
            href="mailto:ishaan6@illinois.edu"
            className="underline hover:text-blue-600"
          >
            Email
          </Link>
          <Link
            href="https://www.linkedin.com/in/ishaan-goyal/"
            className="underline hover:text-blue-600"
            target="_blank"
          >
            LinkedIn
          </Link>
          <Link
            href="https://github.com/GoyalIshaan"
            className="underline hover:text-blue-600"
            target="_blank"
          >
            GitHub
          </Link>
          <Link
            href="https://x.com/IshaanGoyal05"
            className="underline hover:text-blue-600"
            target="_blank"
          >
            Twitter
          </Link>
        </div>
      </div>

      {/* Experience */}
      <section className="w-full max-w-2xl mb-12">
        <h2 className="text-2xl font-bold mb-4">Experience</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <span className="font-semibold">
              Giest VR Metaverse, Gies School of Business (UIUC)
            </span>{" "}
            (Jan 2025 - May 2025): Developed and designed a VR-based platform to
            help teach students in a virtual environment. Focused on environment
            design and reducing latency for real-time conversations with an
            avatar of a renowned UIUC business professor.
          </li>
          <li>
            <span className="font-semibold">
              Software Developer Intern, Jinship (Disruption Lab)
            </span>{" "}
            (Sep 2024 - Dec 2024): Led feedback system design, improved chatbot
            workflows, and optimized client-side code for 25% faster responses.
          </li>
          <li>
            <span className="font-semibold">
              Software Developer, Illinois Space Society
            </span>{" "}
            (Sep 2023 - Dec 2023): Rebuilt flight monitoring system in React,
            boosting performance by 70% and leading a UI/UX redesign.
          </li>
          <li>
            <span className="font-semibold">Founder, NFT Reality</span> (Dec
            2021 - Feb 2023): Launched a VR-based NFT marketplace, managed a
            10-member team, and built a community of 700+ members.
          </li>
        </ul>
      </section>

      {/* Projects */}
      <section className="w-full max-w-2xl mb-4">
        <h2 className="text-2xl font-bold mb-4">Projects</h2>
        <ul className="list-disc pl-6 space-y-6">
          <li>
            <span className="font-semibold">Hephaestus</span>: AI context/memory
            layer for LLM agents, modular OpenAPI tool schema, and real-time
            execution streaming. (Next.js, TypeScript, LangChain, AWS)
          </li>
          <li>
            <span className="font-semibold">Docnest</span>: Real-time
            collaborative text editor with Yjs CRDT, custom WebSocket layer, and
            AWS deployment. (React, TypeScript, Node.js)
          </li>
          <li>
            <span className="font-semibold">
              Nasdaq ITCH Market Data Decoder
            </span>
            : High-throughput binary decoder for Nasdaq ITCH 5.0 protocol (650K
            msgs/sec, 1.68µs latency), with zero-copy parsing, profiling, and
            CSV export. (C++, mmap, Makefile, perf, valgrind, CSV)
          </li>
        </ul>
      </section>
      <div className="w-full max-w-2xl mb-12 flex justify-center">
        <Link
          href="/projects"
          className="text-sm underline text-gray-500 hover:text-blue-600"
        >
          See more projects →
        </Link>
      </div>

      {/* GitHub Activity Graph */}
      <section className="w-full max-w-2xl mb-12 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">GitHub Activity</h2>
        <GitHubActivity />
      </section>

      {/* Education */}
      <section className="w-full max-w-2xl mb-12">
        <h2 className="text-2xl font-bold mb-4">Education</h2>
        <p className="mb-1">
          <span className="font-semibold">
            University of Illinois Urbana-Champaign
          </span>{" "}
          (BS in Computer Science, James Scholar Honors Program, May 2026)
        </p>
        <p className="text-sm text-gray-600">
          Relevant coursework: Data Structures, Computer Architecture, Systems
          Programming, Linear Algebra, Discrete Math, Probability & Statistics.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Ishaan Goyal
      </footer>
    </main>
  );
}
