import { Fragment } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { visit } from "unist-util-visit";
import type { Root, PhrasingContent, Text } from "mdast";
import styles from "./article.module.css";

function citations() {
  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (index === undefined || !parent || parent.type === "link" || !/\[\d+\]/.test(node.value)) return;
      const parts: PhrasingContent[] = [];
      let last = 0;
      for (const match of Array.from(node.value.matchAll(/\[(\d+)\]/g))) {
        if (match.index! > last) parts.push({ type: "text", value: node.value.slice(last, match.index) });
        parts.push({ type: "link", url: `#source-${match[1]}`, children: [{ type: "text", value: match[0] }] });
        last = match.index! + match[0].length;
      }
      if (last < node.value.length) parts.push({ type: "text", value: node.value.slice(last) });
      parent.children.splice(index, 1, ...parts);
      return index + parts.length;
    });
  };
}
const remarkPlugins = [remarkGfm, remarkMath, citations];
export function ArticleMarkdown({ text, inline = false, definitions = "" }: { text: string; inline?: boolean; definitions?: string }) {
  return <ReactMarkdown skipHtml remarkPlugins={remarkPlugins} rehypePlugins={[[rehypeKatex, { trust: false, throwOnError: false, maxExpand: 1000, maxSize: 20 }]]} components={{
    p: ({ children }) => inline ? <Fragment>{children}</Fragment> : <p>{children}</p>,
    a: ({ href, children }) => /^#source-\d+$/.test(href ?? "") ? <sup><a href={href} aria-label={`Source ${href!.slice(8)}`}>{children}</a></sup> : <a href={href} className={href?.startsWith("#") ? styles.termLink : undefined}>{children}</a>,
    table: ({ children }) => <div className={styles.tableScroll}><table>{children}</table></div>,
  }}>{definitions ? `${text}\n\n${definitions}` : text}</ReactMarkdown>;
}
