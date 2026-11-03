"use client";

/* Native links open the complete article outside the draft iframe. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ArticleSnapshot } from "./editor-types";
import styles from "./editor.module.css";

const API = "/api/local-article";
const PREVIEW = "/blogs/inside-hbm3e/preview";
const RECOVERY_VERSION = 1;

function isSnapshot(value: unknown): value is ArticleSnapshot {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.markdown === "string" && typeof item.revision === "string" && typeof item.modifiedAt === "string";
}

function errorMessage(value: unknown, fallback: string): string {
  if (value && typeof value === "object" && "error" in value && typeof value.error === "string") return value.error;
  return fallback;
}

type Recovery = { version: number; markdown: string; baseline: ArticleSnapshot };

export function ArticleEditor({ initial, token, filePath }: { initial: ArticleSnapshot; token: string; filePath: string }) {
  const [baseline, setBaseline] = useState(initial);
  const [markdown, setMarkdown] = useState(initial.markdown);
  const [remote, setRemote] = useState<ArticleSnapshot | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [recoveryWarning, setRecoveryWarning] = useState("");
  const [recovered, setRecovered] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [confirmLoad, setConfirmLoad] = useState(false);
  const [activePanel, setActivePanel] = useState<"write" | "preview">("write");
  const [previewError, setPreviewError] = useState("");
  const [previewPending, setPreviewPending] = useState(false);
  const [previewSession, setPreviewSession] = useState(0);
  const [savedTime, setSavedTime] = useState("");
  const draftRef = useRef(markdown);
  const baselineRef = useRef(baseline);
  const remoteRef = useRef(remote);
  const savingRef = useRef(false);
  const saveGeneration = useRef(0);
  const latestServerRevision = useRef(initial.revision);
  const iframe = useRef<HTMLIFrameElement>(null);
  const previewSequence = useRef(0);
  const mounted = useRef(true);
  const storageKey = `hbm3e-editor-draft:v1:${filePath}`;
  const dirty = markdown !== baseline.markdown;
  const fileName = filePath.split(/[\\/]/).pop() || "Article Markdown";

  const updateBaseline = useCallback((next: ArticleSnapshot) => {
    baselineRef.current = next;
    setBaseline(next);
  }, []);
  const updateDraft = useCallback((text: string) => {
    draftRef.current = text;
    setMarkdown(text);
  }, []);
  const updateRemote = useCallback((next: ArticleSnapshot | null) => {
    remoteRef.current = next;
    setRemote(next);
    setConfirmLoad(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const value: unknown = JSON.parse(stored);
        if (value && typeof value === "object") {
          const item = value as Partial<Recovery>;
          if (item.version === RECOVERY_VERSION && typeof item.markdown === "string" && isSnapshot(item.baseline) && item.markdown !== initial.markdown) {
            updateBaseline(item.baseline.revision === initial.revision ? initial : item.baseline);
            updateDraft(item.markdown);
            if (item.baseline.revision !== initial.revision) updateRemote(initial);
            setRecovered(true);
          }
        }
      }
    } catch {
      setRecoveryWarning("Browser draft recovery is unavailable. Keep this tab open until you save your edits to the file.");
    }
    setRecoveryReady(true);
  }, [initial, storageKey, updateBaseline, updateDraft, updateRemote]);

  const persistDraft = useCallback(() => {
    try {
      if (draftRef.current === baselineRef.current.markdown) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify({ version: RECOVERY_VERSION, markdown: draftRef.current, baseline: baselineRef.current } satisfies Recovery));
    } catch {
      if (mounted.current) setRecoveryWarning("This browser could not keep a recovery copy. Save your edits to the file before closing the tab.");
    }
  }, [storageKey]);

  useEffect(() => {
    if (!recoveryReady) return;
    const timer = window.setTimeout(persistDraft, 400);
    return () => window.clearTimeout(timer);
  }, [markdown, baseline, recoveryReady, persistDraft]);

  useEffect(() => {
    const protectDraft = (event: BeforeUnloadEvent) => {
      persistDraft();
      if (draftRef.current !== baselineRef.current.markdown) { event.preventDefault(); event.returnValue = ""; }
    };
    const visibility = () => { if (document.visibilityState === "hidden") persistDraft(); };
    window.addEventListener("beforeunload", protectDraft);
    document.addEventListener("visibilitychange", visibility);
    return () => { window.removeEventListener("beforeunload", protectDraft); document.removeEventListener("visibilitychange", visibility); };
  }, [persistDraft]);

  useEffect(() => {
    const parsed = new Date(baseline.modifiedAt);
    setSavedTime(Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  }, [baseline.modifiedAt]);

  useEffect(() => {
    let active = true;
    let checking = false;
    let controller: AbortController | undefined;
    const checkFile = async () => {
      if (checking || savingRef.current || document.visibilityState === "hidden") return;
      checking = true;
      const generation = saveGeneration.current;
      controller = new AbortController();
      try {
        const response = await fetch(API, { headers: { "x-article-editor-token": token, "If-None-Match": `"${latestServerRevision.current}"` }, cache: "no-store", signal: controller.signal });
        if (!active || savingRef.current || generation !== saveGeneration.current) return;
        if (response.status === 304) { setConnectionError(""); return; }
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok || !isSnapshot(body)) throw new Error(errorMessage(body, "Could not check the file. Your draft is still here."));
        latestServerRevision.current = body.revision;
        setConnectionError("");
        if (body.revision === baselineRef.current.revision) return;
        if (draftRef.current === baselineRef.current.markdown || draftRef.current === body.markdown) {
          updateBaseline(body); updateDraft(body.markdown); updateRemote(null); setSaveError("");
        } else updateRemote(body);
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) setConnectionError(error instanceof Error ? error.message : "Could not check the file. Your draft is still here.");
      } finally { checking = false; }
    };
    void checkFile();
    const interval = window.setInterval(() => { void checkFile(); }, 2000);
    const focus = () => { void checkFile(); };
    const visible = () => { if (document.visibilityState === "visible") void checkFile(); };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visible);
    return () => { active = false; window.clearInterval(interval); controller?.abort(); window.removeEventListener("focus", focus); document.removeEventListener("visibilitychange", visible); };
  }, [token, updateBaseline, updateDraft, updateRemote]);

  const save = useCallback(async () => {
    if (savingRef.current || remoteRef.current || draftRef.current === baselineRef.current.markdown) return;
    const submitted = draftRef.current;
    const baseRevision = baselineRef.current.revision;
    savingRef.current = true;
    saveGeneration.current += 1;
    setSaving(true); setSaveError("");
    try {
      const response = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json", "x-article-editor-token": token }, body: JSON.stringify({ markdown: submitted, baseRevision }) });
      const body: unknown = await response.json().catch(() => null);
      if (!mounted.current) return;
      if (response.status === 409) {
        const current = body && typeof body === "object" && "current" in body ? body.current : null;
        if (isSnapshot(current)) { latestServerRevision.current = current.revision; updateRemote(current); }
        setSaveError(errorMessage(body, "The file changed before this save. Your draft has been kept."));
        return;
      }
      if (!response.ok || !isSnapshot(body)) throw new Error(errorMessage(body, "Could not save the file. Your draft has been kept."));
      latestServerRevision.current = body.revision;
      updateBaseline(body); updateRemote(null); setRecovered(false); setConnectionError("");
      // A response acknowledges the submitted text, not anything typed after the request began.
      if (draftRef.current === submitted) updateDraft(body.markdown);
      persistDraft();
    } catch (error) {
      if (mounted.current) setSaveError(error instanceof Error ? error.message : "Could not save the file. Your draft has been kept.");
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  }, [token, updateBaseline, updateDraft, updateRemote, persistDraft]);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void save(); }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [save]);

  const sendPreview = useCallback((text: string) => {
    const target = iframe.current?.contentWindow;
    if (!target) return;
    previewSequence.current += 1;
    target.postMessage({ type: "hbm-draft", markdown: text, sequence: previewSequence.current }, window.location.origin);
    setPreviewPending(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => sendPreview(markdown), 300);
    return () => window.clearTimeout(timer);
  }, [markdown, sendPreview]);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow || !event.data) return;
      if (event.data.type === "hbm-preview-ready") { sendPreview(draftRef.current); return; }
      if (event.data.type !== "hbm-draft-result" || event.data.sequence !== previewSequence.current) return;
      if (event.data.error !== null && typeof event.data.error !== "string") return;
      setPreviewPending(false);
      setPreviewError(event.data.error ?? "");
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [sendPreview]);

  useEffect(() => {
    if (!previewPending) return;
    const timer = window.setTimeout(() => { setPreviewPending(false); setPreviewError("The preview did not respond. Your Markdown is still here; reload the preview to reconnect."); }, 8000);
    return () => window.clearTimeout(timer);
  }, [previewPending, markdown, previewSession]);

  const useFileVersion = () => {
    const current = remoteRef.current;
    if (!current) return;
    updateBaseline(current); updateDraft(current.markdown); updateRemote(null);
    setRecovered(false); setSaveError(""); persistDraft();
  };
  const keepDraft = () => {
    const current = remoteRef.current;
    if (!current) return;
    updateBaseline(current); updateRemote(null); setSaveError(""); persistDraft();
  };
  const status = saving ? "Saving…" : remote ? "File changed" : dirty ? "Unsaved edits" : "Saved";

  return <main className={styles.editor}>
    <header className={styles.header}>
      <div className={styles.heading}><h1>Edit HBM3E</h1><span className={styles.status} role="status" aria-live="polite">{status}{!dirty && !remote && savedTime ? ` at ${savedTime}` : ""}</span></div>
      <div className={styles.headerActions}><a href="/blogs/inside-hbm3e" target="_blank" rel="noopener noreferrer">Open article ↗</a><button type="button" className={styles.saveButton} disabled={!dirty || saving || Boolean(remote)} onClick={() => { void save(); }}>Save file</button></div>
    </header>
    <div className={styles.fileLine}><span>Editing <strong>{fileName}</strong></span><details><summary>File location</summary><code>{filePath}</code></details><span className={styles.shortcut}>⌘ / Ctrl S to save</span></div>
    {remote && <div className={styles.notice} role="alert">
      <p>The file changed on your laptop. Your unsaved draft is still here. Choose which version to continue with before saving.</p>
      {confirmLoad ? <div className={styles.confirm}><p>Replace this draft with the file version? This discards the unsaved edits shown here.</p><button type="button" onClick={useFileVersion}>Load file version</button><button type="button" onClick={() => setConfirmLoad(false)}>Cancel</button></div> : <div className={styles.noticeActions}><button type="button" onClick={() => setConfirmLoad(true)}>Load file version…</button><button type="button" onClick={keepDraft}>Keep my draft</button><span>Keeping your draft lets you save it over the latest file version.</span></div>}
    </div>}
    {saveError && <p className={styles.error} role="alert">{saveError}</p>}
    {connectionError && <p className={styles.warning} role="status">{connectionError}</p>}
    {recoveryWarning && <p className={styles.warning} role="status">{recoveryWarning}</p>}
    {recovered && <div className={styles.recovered}><p>Recovered unsaved edits from this browser.</p><button type="button" onClick={() => setRecovered(false)}>Dismiss</button></div>}
    <nav className={styles.viewTabs} aria-label="Editor views"><button type="button" aria-pressed={activePanel === "write"} aria-controls="hbm-source-panel" onClick={() => setActivePanel("write")}>Write</button><button type="button" aria-pressed={activePanel === "preview"} aria-controls="hbm-preview-panel" onClick={() => setActivePanel("preview")}>Preview</button></nav>
    <div className={styles.workspace} data-active-panel={activePanel}>
      <section id="hbm-source-panel" className={styles.sourcePanel} aria-label="Article source"><div className={styles.panelHeading}><label htmlFor="hbm-markdown">Markdown</label><span>{markdown.length.toLocaleString()} characters</span></div><textarea id="hbm-markdown" className={styles.textarea} value={markdown} onChange={event => { updateDraft(event.target.value); setSaveError(""); }} spellCheck={false} autoCapitalize="off" autoCorrect="off" aria-describedby="hbm-editor-help" /></section>
      <section id="hbm-preview-panel" className={styles.previewPanel} aria-label="Draft preview"><div className={styles.panelHeading}><span>Preview</span><span role="status" aria-live="polite">{previewPending ? "Updating…" : previewError ? "Last valid preview" : "Draft preview"}</span><button type="button" onClick={() => { setPreviewError(""); setPreviewSession(value => value + 1); }}>Reload</button></div>{previewError && <p className={styles.previewError} role="alert">{previewError} The last valid preview is kept below.</p>}<iframe key={previewSession} ref={iframe} className={styles.iframe} src={PREVIEW} title="Article preview" onLoad={() => sendPreview(draftRef.current)} /></section>
    </div>
    <div className={styles.bottomTools}><details id="hbm-editor-help" className={styles.help}><summary>Markdown, equations and diagram notes</summary><div><p>Use <code>##</code> for section headings, <code>**bold**</code> for emphasis, and <code>[text](url)</code> for links. Blank lines separate paragraphs.</p><p>Write inline math as <code>{"$B = W \\times R$"}</code>, or put <code>$$</code> on separate lines around a displayed equation.</p><p>Keep the <code>{"<!-- hbm:… -->"}</code> notes with their paragraphs and headings. They connect the writing to the HBM diagram. Edit the prose underneath them as usual.</p><p>The preview follows your draft. Save file writes it to the Markdown file on your laptop.</p></div></details><button className="motion-toggle" type="button" aria-pressed="false">Pause background</button></div>
  </main>;
}
