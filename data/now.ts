export type CurrentWorkItem = {
  title: string;
  note: string;
  mailSubject: string;
  href?: string;
  hrefLabel?: string;
};

export const CURRENTLY = {
  updatedLabel: "Nov 2026",
  items: [
    {
      title: "Agent sandboxes & trajectory evals",
      note: "OS-level sandboxes and multi-grader evals that show where coding agents actually waste tokens.",
      mailSubject: "Agent sandboxes & evals",
    },
    {
      title: "Jen's Son",
      note: "Tightening RTL verification and area models for my batch-1 Qwen3.5-9B inference chip.",
      mailSubject: "Jen's Son inference chip",
      href: "/blogs/jens-son",
      hrefLabel: "essay",
    },
    {
      title: "Per-token attention vs. MLP routing",
      note: "Testing on proof generation whether fresh per-token routing helps multi-step deduction generalize.",
      mailSubject: "Attention vs. MLP routing",
    },
  ] satisfies CurrentWorkItem[],
} as const;

export type SelectedItem = {
  year: string;
  dateShort: string; // MM/YY or YYYY MMM
  dateFull: string;
  title: string;
  note: string;
  href?: string;
  isNew?: boolean;
  links?: { label: string; href: string }[];
};

export const WRITING_ITEMS: SelectedItem[] = [
  {
    year: "2026",
    dateShort: "11/26",
    dateFull: "2026 Nov",
    title: "I made the best inference chip in the world",
    note: "Designing a batch-1 Qwen3.5-9B chip in SystemVerilog, its 4-slot VLIW ISA, and its simulators.",
    href: "/blogs/jens-son",
    isNew: true,
    links: [{ label: "code", href: "https://github.com/GoyalIshaan/jens-son" }],
  },
  {
    year: "2026",
    dateShort: "04/26",
    dateFull: "2026 Apr",
    title: "My speculative decoder got slower",
    note: "Two B300s, a KV-cache stride bug, custom Triton matmuls, and reaching 697 tok/s.",
    href: "/blogs/speculative-decoding",
    links: [{ label: "code", href: "https://github.com/GoyalIshaan/speculative-decoding-lab" }],
  },
  {
    year: "2025",
    dateShort: "10/25",
    dateFull: "2025 Oct",
    title: "Inside HBM3E",
    note: "Interactive walkthrough from a DRAM capacitor through TSVs and the interposer to the GPU.",
    href: "/blogs/inside-hbm3e",
  },
];

export const PROJECT_ITEMS: SelectedItem[] = [
  {
    year: "2026",
    dateShort: "11/26",
    dateFull: "2026 Nov",
    title: "Jen's Son",
    note: "Batch-1 Qwen3.5-9B inference chip in SystemVerilog; 90.3 decode tok/s at 32K context (1 GHz sim).",
    href: "/blogs/jens-son",
    links: [
      { label: "essay", href: "/blogs/jens-son" },
      { label: "code", href: "https://github.com/GoyalIshaan/jens-son" },
    ],
  },
  {
    year: "2026",
    dateShort: "06/26",
    dateFull: "2026 Jun",
    title: "JAX Transformer + Pallas MoE kernel",
    note: "Decoder-only Transformer with top-1 MoE routing and a fused Pallas projection kernel on TPU.",
  },
  {
    year: "2026",
    dateShort: "04/26",
    dateFull: "2026 Apr",
    title: "Speculative decoding runtime",
    note: "Multi-GPU runtime with CUDA graphs, rollback-safe KV caches, and Triton kernels (697 tok/s, 128K ctx).",
    href: "/blogs/speculative-decoding",
    links: [
      { label: "essay", href: "/blogs/speculative-decoding" },
      { label: "code", href: "https://github.com/GoyalIshaan/speculative-decoding-lab" },
    ],
  },
  {
    year: "2026",
    dateShort: "01/26",
    dateFull: "2025 Nov",
    title: "Ren",
    note: "VS Code-based agentic IDE shipped to alpha users with codebase retrieval and live patch review.",
    href: "https://ren-ide.com/",
    links: [
      { label: "site", href: "https://ren-ide.com/" },
      { label: "code", href: "https://github.com/RenCodeIDE/renide" },
    ],
  },
  {
    year: "2025",
    dateShort: "12/25",
    dateFull: "2025 Oct",
    title: "GPT-2 inference on A40",
    note: "Nsight-guided CUDA matmul (tiling, vectorized loads, WMMA) and KV caching.",
  },
  {
    year: "2025",
    dateShort: "07/25",
    dateFull: "2025 Jul",
    title: "VidSmith",
    note: "Event-driven S3, RabbitMQ, Go, and Kubernetes pipeline for adaptive HLS transcoding.",
    href: "https://github.com/GoyalIshaan/vidSmith",
    links: [{ label: "code", href: "https://github.com/GoyalIshaan/vidSmith" }],
  },
];
