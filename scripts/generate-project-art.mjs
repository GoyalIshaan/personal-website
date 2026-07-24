import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outputDir = path.join(root, "public", "projects");

await mkdir(outputDir, { recursive: true });

const WIDTH = 1600;
const HEIGHT = 900;

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const text = (x, y, value, options = {}) => {
  const {
    size = 28,
    weight = 600,
    color = "#e9ece8",
    anchor = "start",
    opacity = 1,
    letterSpacing = 0,
  } = options;

  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" fill-opacity="${opacity}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${letterSpacing}">${escapeXml(value)}</text>`;
};

const node = (x, y, width, height, label, accent, detail) => `
  <g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="22" fill="#181d20" stroke="#343b3f" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="6" height="${height}" rx="3" fill="${accent}"/>
    ${text(x + 30, y + (detail ? 48 : height / 2 + 10), label, { size: 26, weight: 650 })}
    ${detail ? text(x + 30, y + 82, detail, { size: 18, weight: 500, color: "#9da6a2" }) : ""}
  </g>`;

const arrow = (x1, y1, x2, y2, accent) => `
  <g stroke="${accent}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M ${x1} ${y1} L ${x2 - 18} ${y2}" opacity="0.78"/>
    <path d="M ${x2 - 32} ${y2 - 12} L ${x2 - 18} ${y2} L ${x2 - 32} ${y2 + 12}"/>
  </g>`;

const metric = (x, y, value, label, accent, width = 350) => `
  <g>
    <rect x="${x}" y="${y}" width="${width}" height="82" rx="20" fill="${accent}" fill-opacity="0.10" stroke="${accent}" stroke-opacity="0.55" stroke-width="2"/>
    ${text(x + 24, y + 36, value, { size: 26, weight: 750, color: accent })}
    ${text(x + 24, y + 62, label, { size: 15, weight: 650, color: "#c0c7c3", letterSpacing: 1.1 })}
  </g>`;

const canvas = ({ title, eyebrow, accent, body }) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f1214"/>
      <stop offset="1" stop-color="#151a1d"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="34"/>
    </filter>
  </defs>
  <rect width="1600" height="900" fill="url(#background)"/>
  <rect width="1600" height="900" fill="url(#grid)"/>
  <circle cx="1390" cy="-60" r="340" fill="${accent}" fill-opacity="0.12" filter="url(#softGlow)"/>
  <rect x="72" y="62" width="1456" height="776" rx="30" fill="none" stroke="#ffffff" stroke-opacity="0.075" stroke-width="2"/>
  ${text(98, 118, eyebrow.toUpperCase(), { size: 17, weight: 700, color: accent, letterSpacing: 2.4 })}
  ${text(96, 182, title, { size: 48, weight: 740 })}
  <line x1="98" y1="218" x2="1502" y2="218" stroke="#ffffff" stroke-opacity="0.09" stroke-width="2"/>
  ${body}
</svg>`;

const diagrams = [
  {
    file: "jax-moe.webp",
    title: "JAX Transformer + MoE",
    eyebrow: "Fused expert projection",
    accent: "#d6a85f",
    body: ({ accent }) => `
      ${node(100, 330, 250, 116, "TOKENS", accent, "[batch × sequence × d]")}
      ${arrow(350, 388, 455, 388, accent)}
      ${node(455, 330, 250, 116, "TOP-1 ROUTER", accent, "expert dispatch")}
      ${arrow(705, 388, 810, 388, accent)}
      ${node(810, 276, 230, 94, "EXPERT 0", accent)}
      ${node(810, 390, 230, 94, "EXPERT 1", accent)}
      ${node(810, 504, 230, 94, "EXPERT 2", accent)}
      ${arrow(1040, 438, 1150, 438, accent)}
      ${node(1150, 330, 330, 216, "PALLAS KERNEL", accent, "fused up/down projection")}
      ${metric(100, 672, "≈1.3×", "FASTER MOE FORWARD PASS", accent, 410)}
      ${metric(530, 672, "10M", "PARAMETER TRANSFORMER", accent, 360)}
      ${metric(910, 672, "TOP-1", "SPARSE EXPERT ROUTING", accent, 380)}
    `,
  },
  {
    file: "speculative-decoding.webp",
    title: "Speculative Decoding Runtime",
    eyebrow: "Draft · verify · commit",
    accent: "#75b6a2",
    body: ({ accent }) => `
      ${node(100, 344, 230, 112, "PROMPT", accent, "shared prefix")}
      ${arrow(330, 400, 430, 400, accent)}
      ${node(430, 300, 280, 200, "DRAFT MODEL", accent, "Qwen3-8B\npropose k tokens")}
      ${arrow(710, 400, 820, 400, accent)}
      ${node(820, 300, 300, 200, "VERIFIER", accent, "Qwen3-32B\nbatched acceptance")}
      ${arrow(1120, 400, 1230, 400, accent)}
      ${node(1230, 344, 260, 112, "COMMIT", accent, "accept or rollback")}
      <path d="M 1360 490 C 1360 590, 570 590, 570 520" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="9 12" opacity="0.55"/>
      ${metric(100, 672, "1.3–1.6×", "HIGHER THROUGHPUT", accent, 410)}
      ${metric(530, 672, "15–20%", "LOWER LATENCY", accent, 360)}
      ${metric(910, 672, "BATCH 1–64", "BENCHMARK RANGE", accent, 380)}
    `,
  },
  {
    file: "gpt2-cuda.webp",
    title: "GPT-2 CUDA Inference",
    eyebrow: "A40 profiling and kernel work",
    accent: "#c68d78",
    body: ({ accent }) => `
      ${node(100, 326, 240, 132, "TOKEN", accent, "autoregressive step")}
      ${arrow(340, 392, 440, 392, accent)}
      ${node(440, 326, 270, 132, "KV CACHE", accent, "O(T) decode path")}
      ${arrow(710, 392, 810, 392, accent)}
      ${node(810, 294, 300, 196, "WMMA GEMM", accent, "shared-memory tiling\nvectorized loads")}
      ${arrow(1110, 392, 1210, 392, accent)}
      ${node(1210, 326, 280, 132, "LOGITS", accent, "next-token scores")}
      ${metric(100, 672, "97–99%", "GPU TIME IN MATMUL", accent, 410)}
      ${metric(530, 672, "10–13%", "LOWER MATMUL LATENCY", accent, 410)}
      ${metric(960, 672, "NVIDIA A40", "PROFILE TARGET", accent, 400)}
    `,
  },
  {
    file: "market-data.webp",
    title: "Market Data Warehouse",
    eyebrow: "Packet capture to query layer",
    accent: "#8ba6c9",
    body: ({ accent }) => `
      ${node(100, 344, 230, 112, "PCAP", accent, "IEX feed")}
      ${arrow(330, 400, 430, 400, accent)}
      ${node(430, 320, 260, 160, "C++ PARSER", accent, "multithreaded decode")}
      ${arrow(690, 400, 790, 400, accent)}
      ${node(790, 320, 260, 160, "PARQUET", accent, "columnar records")}
      ${arrow(1050, 400, 1150, 400, accent)}
      ${node(1150, 320, 330, 160, "WAREHOUSE", accent, "SQLite bookkeeper")}
      ${metric(100, 672, "AIRFLOW", "PIPELINE ORCHESTRATION", accent, 410)}
      ${metric(530, 672, "PCAP → SQL", "END-TO-END DATA FLOW", accent, 410)}
      ${metric(960, 672, "C++", "HOT-PATH PARSING", accent, 400)}
    `,
  },
  {
    file: "interpreter.webp",
    title: "Programming Language Interpreter",
    eyebrow: "Source to evaluation",
    accent: "#a995ca",
    body: ({ accent }) => `
      ${node(100, 344, 210, 112, "SOURCE", accent, "Monkey syntax")}
      ${arrow(310, 400, 390, 400, accent)}
      ${node(390, 344, 210, 112, "LEXER", accent, "token stream")}
      ${arrow(600, 400, 680, 400, accent)}
      ${node(680, 344, 210, 112, "PARSER", accent, "Pratt grammar")}
      ${arrow(890, 400, 970, 400, accent)}
      ${node(970, 344, 210, 112, "AST", accent, "program tree")}
      ${arrow(1180, 400, 1260, 400, accent)}
      ${node(1260, 344, 230, 112, "EVALUATOR", accent, "closures + REPL")}
      ${metric(100, 672, "LEXER", "TOKENIZATION", accent, 300)}
      ${metric(420, 672, "PARSER", "SYNTAX TREE", accent, 300)}
      ${metric(740, 672, "EVALUATOR", "RUNTIME", accent, 340)}
      ${metric(1100, 672, "GO", "IMPLEMENTATION", accent, 390)}
    `,
  },
  {
    file: "unix-shell.webp",
    title: "Custom Unix Shell",
    eyebrow: "Command and process control",
    accent: "#79a989",
    body: ({ accent }) => `
      ${node(100, 344, 240, 112, "$ COMMAND", accent, "interactive input")}
      ${arrow(340, 400, 440, 400, accent)}
      ${node(440, 320, 260, 160, "PARSE", accent, "pipes + redirection")}
      ${arrow(700, 400, 800, 400, accent)}
      ${node(800, 320, 260, 160, "FORK", accent, "process groups")}
      ${arrow(1060, 400, 1160, 400, accent)}
      ${node(1160, 320, 320, 160, "EXEC / WAIT", accent, "foreground + background")}
      ${metric(100, 672, "PIPE", "PROCESS COMPOSITION", accent, 410)}
      ${metric(530, 672, "REDIRECT", "FILE DESCRIPTORS", accent, 410)}
      ${metric(960, 672, "C", "SYSTEM CALLS", accent, 400)}
    `,
  },
  {
    file: "memory-manager.webp",
    title: "High-Performance Memory Manager",
    eyebrow: "Allocate · split · coalesce",
    accent: "#d09963",
    body: ({ accent }) => `
      ${text(100, 306, "HEAP LAYOUT", { size: 18, weight: 700, color: accent, letterSpacing: 1.8 })}
      <rect x="100" y="340" width="1390" height="172" rx="22" fill="#181d20" stroke="#343b3f" stroke-width="2"/>
      <rect x="120" y="366" width="260" height="120" rx="14" fill="${accent}" fill-opacity="0.24" stroke="${accent}"/>
      <rect x="394" y="366" width="170" height="120" rx="14" fill="#22282b" stroke="#566064" stroke-dasharray="8 8"/>
      <rect x="578" y="366" width="360" height="120" rx="14" fill="${accent}" fill-opacity="0.16" stroke="${accent}"/>
      <rect x="952" y="366" width="250" height="120" rx="14" fill="#22282b" stroke="#566064" stroke-dasharray="8 8"/>
      <rect x="1216" y="366" width="254" height="120" rx="14" fill="${accent}" fill-opacity="0.20" stroke="${accent}"/>
      ${text(250, 438, "ALLOCATED", { size: 21, anchor: "middle" })}
      ${text(480, 438, "FREE", { size: 21, anchor: "middle", color: "#aeb6b2" })}
      ${text(758, 438, "ALLOCATED", { size: 21, anchor: "middle" })}
      ${text(1077, 438, "FREE", { size: 21, anchor: "middle", color: "#aeb6b2" })}
      ${text(1343, 438, "ALLOCATED", { size: 21, anchor: "middle" })}
      ${metric(100, 672, "SPLIT", "RIGHT-SIZE BLOCKS", accent, 410)}
      ${metric(530, 672, "COALESCE", "REDUCE FRAGMENTATION", accent, 410)}
      ${metric(960, 672, "FREE LIST", "FAST REUSE", accent, 400)}
    `,
  },
  {
    file: "itch-decoder.webp",
    title: "Nasdaq ITCH 5.0 Decoder",
    eyebrow: "Zero-copy binary data path",
    accent: "#70a8b8",
    body: ({ accent }) => `
      ${node(100, 344, 230, 112, "ITCH FILE", accent, "binary feed")}
      ${arrow(330, 400, 430, 400, accent)}
      ${node(430, 320, 260, 160, "MMAP", accent, "zero-copy reads")}
      ${arrow(690, 400, 790, 400, accent)}
      ${node(790, 320, 270, 160, "PACKED PARSER", accent, "layout checks")}
      ${arrow(1060, 400, 1160, 400, accent)}
      ${node(1160, 320, 320, 160, "DISPATCH", accent, "message handlers")}
      ${metric(100, 672, "256-WAY", "TYPE DISPATCH", accent, 410)}
      ${metric(530, 672, "1.68 µs", "REPORTED LATENCY", accent, 410)}
      ${metric(960, 672, "C++", "PACKED STRUCTS", accent, 400)}
    `,
  },
];

for (const diagram of diagrams) {
  const svg = canvas({
    ...diagram,
    body: diagram.body({ accent: diagram.accent }),
  });

  await sharp(Buffer.from(svg))
    .resize(WIDTH, HEIGHT)
    .webp({ quality: 82, smartSubsample: true })
    .toFile(path.join(outputDir, diagram.file));
}

const screenshotConversions = [
  ["hephaestus.png", "hephaestus.webp"],
  ["vidSmith.png", "vidsmith.webp"],
  ["docnest.png", "docnest.webp"],
  ["quickmark.png", "quickmark.webp"],
  ["aether.png", "aether.webp"],
];

for (const [source, destination] of screenshotConversions) {
  await sharp(path.join(root, "public", source))
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "top" })
    .webp({ quality: 80, smartSubsample: true })
    .toFile(path.join(outputDir, destination));
}

await sharp(path.join(root, "public", "pfp.jpg"))
  .resize(256, 256, { fit: "cover" })
  .webp({ quality: 82, smartSubsample: true })
  .toFile(path.join(root, "public", "pfp.webp"));

console.log(
  `Generated ${diagrams.length + screenshotConversions.length} project assets and one optimized avatar in ${outputDir}`,
);
