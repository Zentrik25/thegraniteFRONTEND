"use client";

import { useRef, useEffect, useCallback } from "react";

interface RichTextEditorProps {
  defaultValue?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

interface ToolbarButton {
  cmd: string;
  value?: string;
  label: string;
  title: string;
  style?: React.CSSProperties;
}

type ToolbarItem = ToolbarButton | null;

const TOOLBAR: ToolbarItem[] = [
  { cmd: "bold",      label: "B",  title: "Bold (Ctrl+B or **text**)",    style: { fontWeight: 700 } },
  { cmd: "italic",    label: "I",  title: "Italic (Ctrl+I or *text*)",    style: { fontStyle: "italic" } },
  { cmd: "underline", label: "U",  title: "Underline (Ctrl+U)", style: { textDecoration: "underline" } },
  null,
  { cmd: "formatBlock", value: "h2",         label: "H2", title: "Heading 2 (## )" },
  { cmd: "formatBlock", value: "h3",         label: "H3", title: "Heading 3 (### )" },
  { cmd: "formatBlock", value: "p",          label: "¶",  title: "Paragraph" },
  null,
  { cmd: "insertUnorderedList", label: "• List",  title: "Bullet list (- )" },
  { cmd: "insertOrderedList",   label: "1. List", title: "Numbered list" },
  { cmd: "formatBlock", value: "blockquote", label: "❝",  title: "Blockquote (> )" },
  null,
  { cmd: "createLink", label: "Link",   title: "Insert link" },
  { cmd: "unlink",     label: "Unlink", title: "Remove link" },
  null,
  { cmd: "removeFormat", label: "Clear", title: "Clear formatting" },
];

/**
 * Strip dangerous/noisy attributes from pasted HTML while keeping clean structure.
 */
function cleanPastedHtml(html: string): string {
  try {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    const REMOVE_TAGS = new Set(["script", "style", "head", "meta", "link", "noscript", "iframe"]);

    function walk(node: Element) {
      const toRemove: Element[] = [];
      Array.from(node.children).forEach((child) => {
        const tag = child.tagName.toLowerCase();
        if (REMOVE_TAGS.has(tag)) { toRemove.push(child); return; }
        Array.from(child.attributes).forEach((attr) => {
          const keep =
            (tag === "a" && attr.name === "href") ||
            (tag === "img" && (attr.name === "src" || attr.name === "alt" || attr.name === "width" || attr.name === "height"));
          if (!keep) child.removeAttribute(attr.name);
        });
        if (tag === "b" || tag === "i") {
          const replacement = document.createElement(tag === "b" ? "strong" : "em");
          while (child.firstChild) replacement.appendChild(child.firstChild);
          child.parentNode?.replaceChild(replacement, child);
          walk(replacement);
          return;
        }
        walk(child);
      });
      toRemove.forEach((el) => el.remove());
    }

    walk(tmp);
    return tmp.innerHTML
      .replace(/<p>\s*<\/p>/gi, "")
      .replace(/\n{3,}/g, "\n\n");
  } catch {
    return html;
  }
}

/**
 * Apply inline markdown shortcuts in the current text node.
 * Handles: **bold**, *italic*, `code`
 * Returns true if a replacement was made.
 */
function applyInlineMarkdown(editor: HTMLDivElement): boolean {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return false;

  const { startContainer } = sel.getRangeAt(0);
  if (startContainer.nodeType !== Node.TEXT_NODE) return false;

  const text = startContainer.textContent ?? "";

  const patterns: Array<{ re: RegExp; tag: "strong" | "em" | "code" }> = [
    { re: /\*\*([^*\n]+)\*\*/, tag: "strong" },
    { re: /(?<!\*)\*([^*\n]+)\*(?!\*)/, tag: "em" },
    { re: /`([^`\n]+)`/, tag: "code" },
  ];

  for (const { re, tag } of patterns) {
    const m = re.exec(text);
    if (!m) continue;

    const before = text.slice(0, m.index);
    const inner = m[1];
    const after = text.slice(m.index + m[0].length);

    const parent = startContainer.parentNode;
    if (!parent) continue;

    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));
    const el = document.createElement(tag);
    el.textContent = inner;
    frag.appendChild(el);
    const afterNode = document.createTextNode(after);
    frag.appendChild(afterNode);
    parent.replaceChild(frag, startContainer);

    // Place cursor at start of remaining text (after the formatted element)
    const newRange = document.createRange();
    newRange.setStart(afterNode, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    return true;
  }

  return false;
}

/**
 * Apply block-level markdown shortcuts at the start of a block.
 * Handles: # H2, ## H3, ### H3, > blockquote, - or * bullet list
 * Triggered when Space is pressed.
 * Returns true if a replacement was made.
 */
function applyBlockMarkdown(editor: HTMLDivElement): boolean {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return false;

  const range = sel.getRangeAt(0);
  let node = range.startContainer;

  // Walk up to the block-level parent
  while (node && node !== editor) {
    const parent = node.parentElement;
    if (!parent) break;
    const display = window.getComputedStyle(parent).display;
    if (display === "block" || display === "list-item" || parent === editor) break;
    node = parent;
  }

  if (!node || node.nodeType !== Node.TEXT_NODE) return false;

  const text = node.textContent ?? "";
  const blockPatterns: Array<{ re: RegExp; cmd: string; value?: string; strip: number }> = [
    { re: /^###\s$/, cmd: "formatBlock", value: "h3", strip: 4 },
    { re: /^##\s$/,  cmd: "formatBlock", value: "h3", strip: 3 },
    { re: /^#\s$/,   cmd: "formatBlock", value: "h2", strip: 2 },
    { re: /^>\s$/,   cmd: "formatBlock", value: "blockquote", strip: 2 },
    { re: /^[-*]\s$/, cmd: "insertUnorderedList", strip: 2 },
  ];

  for (const { re, cmd, value, strip } of blockPatterns) {
    if (!re.test(text)) continue;

    // Remove the markdown syntax characters
    node.textContent = "";

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand(cmd, false, value);

    // Suppress the space character that triggered this
    return true;
  }

  return false;
}

export function RichTextEditor({
  defaultValue = "",
  onChange,
  placeholder = "Write article content here…",
  minHeight = 420,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = defaultValue;
      isInitialized.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Run inline markdown detection after every input (fires AFTER character is inserted)
    applyInlineMarkdown(editor);
    onChange(editor.innerHTML);
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    let toInsert: string;
    if (html) {
      toInsert = cleanPastedHtml(html);
    } else if (text) {
      toInsert = text
        .split(/\n\n+/)
        .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
        .join("");
    } else {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand("insertHTML", false, toInsert);
    handleInput();
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Space: check for block-level markdown (# , > , - )
    if (e.key === " ") {
      if (applyBlockMarkdown(editor)) {
        e.preventDefault();
        handleInput();
        return;
      }
    }

  }, [handleInput]);

  function execCmd(cmd: string, value?: string) {
    editorRef.current?.focus();
    if (cmd === "createLink") {
      const url = window.prompt("Enter URL:", "https://");
      if (!url) return;
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.execCommand("createLink", false, url);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.execCommand(cmd, false, value);
    }
    handleInput();
  }

  const btnBase: React.CSSProperties = {
    background: "transparent",
    border: "none",
    padding: "0.25rem 0.45rem",
    cursor: "pointer",
    fontSize: "0.8rem",
    borderRadius: "3px",
    color: "#444",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "4px", overflow: "hidden", background: "#fff" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "2px",
          padding: "0.35rem 0.5rem",
          borderBottom: "1px solid #e8e8e8",
          background: "#f8f8f8",
        }}
      >
        {TOOLBAR.map((item, i) => {
          if (item === null) {
            return (
              <span
                key={`sep-${i}`}
                aria-hidden="true"
                style={{ width: 1, height: 18, background: "#ddd", display: "inline-block", margin: "0 3px", flexShrink: 0 }}
              />
            );
          }
          return (
            <button
              key={item.cmd + (item.value ?? "")}
              type="button"
              title={item.title}
              style={{ ...btnBase, ...item.style }}
              onMouseDown={(e) => {
                e.preventDefault();
                execCmd(item.cmd, item.value);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Markdown hint */}
      <div style={{ padding: "0.3rem 1rem", background: "#fffbf0", borderBottom: "1px solid #f0e8c8", fontSize: "0.7rem", color: "#8a7340" }}>
        <strong>**bold**</strong> &nbsp; <em>*italic*</em> &nbsp; <code>`code`</code> &nbsp;
        <strong># </strong>H2 &nbsp; <strong>## </strong>H3 &nbsp; <strong>&gt; </strong>quote &nbsp; <strong>- </strong>list
        &nbsp;— type then <kbd style={{ background: "#eee", border: "1px solid #ccc", borderRadius: "2px", padding: "0 3px" }}>Space</kbd>
      </div>

      {/* Editing surface */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        style={{
          minHeight,
          padding: "0.875rem 1rem",
          outline: "none",
          fontSize: "0.95rem",
          lineHeight: 1.7,
          color: "#222",
          fontFamily: "inherit",
          overflowY: "auto",
        }}
      />

      <style>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #bbb;
          pointer-events: none;
          display: block;
        }
        [contenteditable] h2 { font-size: 1.3rem; font-weight: 700; margin: 1em 0 0.4em; }
        [contenteditable] h3 { font-size: 1.1rem; font-weight: 700; margin: 0.9em 0 0.35em; }
        [contenteditable] p  { margin: 0 0 0.75em; }
        [contenteditable] blockquote {
          border-left: 3px solid #981b1e;
          margin: 1em 0;
          padding-left: 1rem;
          color: #555;
          font-style: italic;
        }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.5rem; margin: 0.5em 0 0.75em; }
        [contenteditable] li { margin-bottom: 0.25em; }
        [contenteditable] a  { color: #981b1e; text-decoration: underline; }
        [contenteditable] code { background: #f4f4f4; border: 1px solid #e0e0e0; border-radius: 3px; padding: 0.1em 0.35em; font-family: monospace; font-size: 0.88em; }
        [contenteditable] strong { font-weight: 700; }
        [contenteditable] em { font-style: italic; }
      `}</style>
    </div>
  );
}
