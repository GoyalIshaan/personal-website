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
export const BLOG_POSTS: readonly BlogPost[] = [HBM3E_POST];
