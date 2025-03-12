"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleScrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    const aboutSection = document.querySelector("#about");
    if (aboutSection) {
      window.scrollTo({
        top: aboutSection.getBoundingClientRect().top + window.scrollY - 80,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-12 px-4"
    >
      {/* Background base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background z-0" />

      {/* Animated gradient blob */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-60 z-0"
        animate={{
          x: [mousePosition.x - 400, mousePosition.x - 400],
          y: [mousePosition.y - 400, mousePosition.y - 400],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          repeat: Number.POSITIVE_INFINITY,
        }}
      />

      {/* Animated particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              backgroundColor:
                i % 3 === 0
                  ? "hsl(var(--primary))"
                  : i % 3 === 1
                  ? "hsl(var(--secondary))"
                  : "hsl(var(--muted-foreground))",
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [
                Math.random() * 0.5 + 0.2,
                0,
                Math.random() * 0.5 + 0.2,
              ],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Animated circles */}
      <div className="absolute inset-0 z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/20"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container relative z-20">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter relative">
              Hi, I'm{" "}
              <span className="text-primary font-bold">Ishaan Goyal</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl">
              Computer Science Student at UIUC | Software Developer | Problem
              Solver | James Scholar
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto relative group overflow-hidden"
              onClick={(e) => {
                e.preventDefault();
                const projectsSection = document.querySelector("#projects");
                if (projectsSection) {
                  window.scrollTo({
                    top:
                      projectsSection.getBoundingClientRect().top +
                      window.scrollY -
                      80,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <span className="relative z-10">View My Work</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto relative group overflow-hidden border-primary/20"
              onClick={(e) => {
                e.preventDefault();
                const contactSection = document.querySelector("#contact");
                if (contactSection) {
                  window.scrollTo({
                    top:
                      contactSection.getBoundingClientRect().top +
                      window.scrollY -
                      80,
                    behavior: "smooth",
                  });
                }
              }}
            >
              <span className="relative z-10">Contact Me</span>
              <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
      >
        <Button variant="ghost" size="icon" onClick={handleScrollToAbout}>
          <ArrowDown className="h-6 w-6" />
        </Button>
      </motion.div>
    </section>
  );
}
