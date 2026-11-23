"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import styles from "./shark-companion.module.css";

// One short visit, then eight quiet seconds before the next peek.
export function SharkCompanion({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"enter" | "wink" | "leave" | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timers: ReturnType<typeof setTimeout>[] = [];
    let disposed = false;
    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
      setPhase(null);
    };
    const later = (callback: () => void, delay: number) => {
      timers.push(setTimeout(callback, delay));
    };
    const visit = () => {
      setPhase("enter");
      later(() => setPhase("wink"), 1100);
      later(() => setPhase("leave"), 3650);
      later(() => setPhase(null), 4800);
      later(visit, 12800);
    };
    const sync = () => {
      clear();
      if (!disposed && !paused && !motion.matches && !document.hidden) later(visit, 1800);
    };
    // Warm the animation cache before its first appearance.
    const preload = new window.Image();
    preload.src = "/sharks/shocked-to-wink.webp";
    preload.onload = sync;
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true;
      preload.onload = null;
      clear();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  return (
    <button
      type="button"
      className={styles.portrait}
      onClick={() => setPaused((value) => !value)}
      aria-label={paused ? "Resume shark animation" : "Pause shark animation"}
      title={paused ? "Resume shark animation" : "Pause shark animation"}
    >
      <span className={`${styles.turn} ${phase ? styles.active : ""}`}>
      <span className={styles.photo}>{children}</span>
      {phase && (
        <span className={styles.shark} aria-hidden="true">
          <Image
            src={phase === "wink" ? "/sharks/shocked-to-wink.webp" : `/sharks/${phase === "enter" ? "happy" : "wink"}-final.png`}
            alt=""
            width={112}
            height={112}
            unoptimized
          />
        </span>
      )}
      </span>
    </button>
  );
}
