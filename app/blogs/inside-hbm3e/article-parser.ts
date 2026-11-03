import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import katex from "katex";
import type { RootContent, List, Link } from "mdast";
import type { ArticleDocument, ArticleReference, ArticleSection, Block, BlockMeta, FigureType, OrganizationLevel, RowState } from "./content";

export const MAX_ARTICLE_BYTES = 512_000;
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath);
const levels = new Set(["cell", "row", "columns", "burst", "banks", "groups", "activations", "channels", "pseudo", "ranks", "address"]);
const figures = new Set(["memory-interfaces", "channels", "burst", "bandwidth", "power", "coalescing", "read-path", "equation"]);
function fingerprint(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(36);
}
function plain(node: { type: string; value?: string; children?: unknown[] }): string {
  return typeof node.value === "string" ? node.value : (node.children ?? []).map(child => plain(child as Parameters<typeof plain>[0])).join("");
}

export function parseArticle(markdown: string): ArticleDocument {
  if (typeof markdown !== "string" || markdown.length > MAX_ARTICLE_BYTES) throw new Error("The article is too large (maximum 512 KB).");
  const tree = processor.parse(markdown);
  const used = new Set<string>(["article-body", "sources"]);
  const intro: Block[] = [], sections: ArticleSection[] = [];
  const references: ArticleReference[] = [];
  let title = "";
  let section: ArticleSection | undefined, pending: Record<string, unknown> | undefined, pendingSection: Record<string, unknown> | undefined;
  let sourcesNext = false, inSources = false;
  const raw = (node: RootContent) => markdown.slice(node.position?.start.offset ?? 0, node.position?.end.offset ?? 0);
  const id = (value: unknown) => {
    if (typeof value !== "string" || !/^[a-z][a-z0-9-]*$/.test(value)) throw new Error("Diagram IDs must use lowercase letters, numbers and hyphens.");
    if (used.has(value)) throw new Error(`The diagram ID “${value}” is used twice.`);
    used.add(value); return value;
  };
  const focus = (value: unknown, fallback = 0) => {
    if (value === undefined) return fallback;
    if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > 13) throw new Error("Diagram focus must be a number from 0 to 13.");
    return Number(value);
  };
  const meta = (props: Record<string, unknown>, fallbackId?: string): BlockMeta => {
    const value: BlockMeta = { id: id(props.id ?? fallbackId) };
    if (props.focus !== undefined) value.focus = focus(props.focus);
    if (props.rowState !== undefined) {
      if (!["precharged", "sensing", "open"].includes(String(props.rowState))) throw new Error("Unknown row state in a diagram note.");
      value.rowState = props.rowState as RowState;
    }
    if (props.organizationLevel !== undefined) {
      if (!levels.has(String(props.organizationLevel))) throw new Error("Unknown memory organization level in a diagram note.");
      value.organizationLevel = props.organizationLevel as OrganizationLevel;
    }
    return value;
  };
  const add = (block: Block) => (section ? section.blocks : intro).push(block);
  const readSources = (list: List) => list.children.map((item, index): ArticleReference => {
    const first = item.children[0];
    const link = first?.type === "paragraph" ? first.children.find(child => child.type === "link") as Link | undefined : undefined;
    if (!link || !/^https?:\/\//.test(link.url)) throw new Error("Each source needs a Markdown link with an http or https URL.");
    const number = (list.start ?? 1) + index;
    if (used.has(`source-${number}`)) throw new Error(`The ID source-${number} is already in use.`);
    used.add(`source-${number}`);
    return { id: number, title: plain(link), url: link.url, detail: item.children.slice(1).map(node => raw(node)).join("\n\n").trim() };
  });
  for (const node of tree.children) {
    if (node.type === "html") {
      const directive = /^<!--\s*hbm:(section|paragraph|figure|sources)(?:\s+([\s\S]*?))?\s*-->$/.exec(node.value);
      if (!directive) continue;
      let props: Record<string, unknown> = {};
      if (directive[2]) {
        try { const value: unknown = JSON.parse(directive[2]); if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(); props = value as Record<string, unknown>; }
        catch { throw new Error(`Invalid JSON in the ${directive[1]} diagram note near line ${node.position?.start.line ?? "?"}.`); }
      }
      if (pending || pendingSection) throw new Error("A diagram note must be followed by its paragraph or heading.");
      if (directive[1] === "section") pendingSection = props;
      else if (directive[1] === "paragraph") pending = props;
      else if (directive[1] === "sources") sourcesNext = true;
      else {
        if (!figures.has(String(props.type))) throw new Error("Unknown interactive figure in a diagram note.");
        const metadata = meta(props);
        if (props.type === "equation") {
          if (!Array.isArray(props.lines) || !props.lines.every(line => typeof line === "string") || (props.note !== undefined && typeof props.note !== "string")) throw new Error("Equation notes need text lines and an optional caption.");
          add({ ...metadata, type: "equation", lines: props.lines as string[], note: props.note as string | undefined });
        } else add({ ...metadata, type: props.type as FigureType });
      }
      continue;
    }
    if (node.type === "heading" && node.depth === 1) {
      if (title || section) throw new Error("Use one # title at the start of the article.");
      title = plain(node); continue;
    }
    if (node.type === "heading" && node.depth === 2) {
      if (pending) throw new Error("A paragraph diagram note cannot be followed by a heading.");
      if (sourcesNext) { inSources = true; sourcesNext = false; section = undefined; continue; }
      inSources = false;
      const text = plain(node), slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
      section = { id: id(pendingSection?.id ?? slug), title: text, focus: focus(pendingSection?.focus), blocks: [] };
      sections.push(section); pendingSection = undefined; continue;
    }
    if (node.type === "definition") continue;
    if (pendingSection || sourcesNext) throw new Error("A section note must be followed by a ## heading.");
    if (inSources) {
      if (node.type === "list" && node.ordered) references.push(...readSources(node));
      else throw new Error("Sources should be a numbered Markdown list of links and descriptions.");
      continue;
    }
    const text = raw(node);
    let generated = `${section?.id ?? "intro"}-added-${fingerprint(text)}`;
    while (used.has(generated)) generated += "-copy";
    add({ ...meta(pending ?? {}, generated), type: "p", text }); pending = undefined;
  }
  if (pending || pendingSection || sourcesNext) throw new Error("The last diagram note needs its paragraph or heading.");
  if (!title.trim() || !sections.length) throw new Error("Keep a # title and at least one ## section in the article.");
  if (!references.length) throw new Error("Keep the Sources section and its numbered links.");
  const sourceIds = new Set(references.map(ref => ref.id));
  const text = [...intro, ...sections.flatMap(s => s.blocks)].flatMap(block => block.type === "p" ? [block.text] : []).join(" ");
  const checkCitations = (node: { type: string; value?: string; depth?: number; children?: unknown[] }) => {
    if (["code", "inlineCode", "math", "inlineMath", "definition", "html", "link", "linkReference"].includes(node.type) || (node.type === "heading" && (node.depth ?? 0) < 3)) return;
    if (node.type === "text" && node.value) for (const citation of Array.from(node.value.matchAll(/\[(\d+)\]/g))) {
      if (!sourceIds.has(Number(citation[1]))) throw new Error(`Source ${citation[1]} is cited but missing from the Sources list.`);
    }
    node.children?.forEach(child => checkCitations(child as Parameters<typeof checkCitations>[0]));
  };
  checkCitations(tree);
  const checkMath = (node: { type: string; value?: string; children?: unknown[] }) => {
    if ((node.type === "math" || node.type === "inlineMath") && node.value) {
      try { katex.renderToString(node.value, { displayMode: node.type === "math", throwOnError: true, trust: false, maxExpand: 1000, maxSize: 20 }); }
      catch (error) { throw new Error(`LaTeX: ${error instanceof Error ? error.message : "invalid expression"}`); }
    }
    node.children?.forEach(child => checkMath(child as Parameters<typeof checkMath>[0]));
  };
  checkMath(tree);
  const prose = text.replace(/\[([^\]]+)\]\(#[a-z0-9-]+\)/g, "$1").replace(/\[\d+\]/g, "");
  const definitions = tree.children.filter(node => node.type === "definition").map(raw).join("\n");
  return { title, intro, sections, references, definitions, wordCount: prose.split(/\s+/).filter(Boolean).length, contentKey: fingerprint(markdown) };
}
