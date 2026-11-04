export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  dateLabel: string;
  description: string;
};

export const HBM3E_POST: BlogPost = {
  slug: "inside-hbm3e",
  title: "Inside HBM3E",
  date: "2025-10",
  dateLabel: "October 2025",
  description:
    "Core DRAM dies, the base die, TSVs, the interposer, and how the data moves through all of it.",
};

// Add each new article here; the blog index lists posts by date, newest first.
export const SPECULATIVE_DECODING_POST: BlogPost = {
  slug: "speculative-decoding",
  title: "My speculative decoder got slower",
  date: "2026-04",
  dateLabel: "April 2026",
  description:
    "Two GPUs, three decoders, one stride bug, and what it took to reach 697 tokens/sec on one short request.",
};

export const BLOG_POSTS: readonly BlogPost[] = [SPECULATIVE_DECODING_POST, HBM3E_POST];
