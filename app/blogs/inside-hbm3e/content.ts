// Prose lives in content/blogs/inside-hbm3e.md.
export type RowState = "precharged" | "sensing" | "open";
export type OrganizationLevel = "cell" | "row" | "columns" | "burst" | "banks" | "groups" | "activations" | "channels" | "pseudo" | "ranks" | "address";
export type FigureType = "memory-interfaces" | "channels" | "burst" | "bandwidth" | "power" | "coalescing" | "read-path";
export type BlockMeta = { id: string; focus?: number; rowState?: RowState; organizationLevel?: OrganizationLevel };
export type Block = BlockMeta & ({ type: "p"; text: string } | { type: "equation"; lines: string[]; note?: string } | { type: FigureType });
export type ArticleSection = { id: string; title: string; focus: number; blocks: Block[] };
export type ArticleReference = { id: number; title: string; url: string; detail: string };
export type ArticleDocument = { title: string; intro: Block[]; sections: ArticleSection[]; references: ArticleReference[]; definitions: string; wordCount: number; contentKey: string };
