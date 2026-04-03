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

type ToolbarItem = ToolbarButton | null; // null = separator

const TOOLBAR: ToolbarItem[] = [
  { cmd: "bold",      label: "B",  title: "Bold (Ctrl+B)",    style: { fontWeight: 700 } },
  { cmd: "italic",    label: "I",  title: "Italic (Ctrl+I)",  style: { fontStyle: "italic" } },
  { cmd: "underline", label: "U",  title: "Underline (Ctrl+U)", style: { textDecoration: "underline" } },
  null,
  { cmd: "formatBlock", value: "h2",         label: "H2", title: "Heading 2" },
  { cmd: "formatBlock", value: "h3",         label: "H3", title: "Heading 3" },
  { cmd: "formatBlock", value: "p",          label: "¶",  title: "Paragraph" },
  null,
  { cmd: "insertUnorderedList", label: "• List",  title: "Bullet list" },
  { cmd: "insertOrderedList",   label: "1. List", title: "Numbered list" },
  { cmd: "formatBlock", value: "blockquote", label: "❝",  title: "Blockquote" },
  null,
  { cmd: "createLink", label: "Link",   title: "Insert link" },
  { cmd: "unlink",     label: "Unlink", title: "Remove link" },
  null,
  { cmd: "removeFormat", label: "Clear", title: "Clear formatting" },
];

/**
 * Strip dangerous/noisy attributes from pasted HTML while keeping clean structure.
 * Walks all elements and removes style, class, id, and other presentation attrs.
 * Preserves: href on <a>, src/alt on <img>.
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
        if (REMOVE_TAGS.has(tag)) {
          toRemove.push(child);
          return;
        }
        // Remove all attributes except semantic ones
        Array.from(child.attributes).forEach((attr) => {
          const keep =
            (tag === "a" && attr.name === "href") ||
            (tag === "img" && (attr.name === "src" || attr.name === "alt" || attr.name === "width" || attr.name === "height"));
          if (!keep) child.removeAttribute(attr.name);
        });
        // Rename <b> → <strong>, <i> → <em>
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
    // Collapse empty <p> tags and excessive whitespace
    return tmp.innerHTML
      .replace(/<p>\s*<\/p>/gi, "")
      .replace(/\n{3,}/g, "\n\n");
  } catch {
    return html;
  }
}

export function RichTextEditor({
  defaultValue = "",
  onChange,
  placeholder = "Write article content here…",
  minHeight = 420,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Set initial content once on mount
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = defaultValue;
      isInitialized.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");

    let toInsert: string;
    if (html) {
      toInsert = cleanPastedHtml(html);
    } else if (text) {
      // Convert plain text to paragraphs
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
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "4px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
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
                style={{
                  width: 1,
                  height: 18,
                  background: "#ddd",
                  display: "inline-block",
                  margin: "0 3px",
                  flexShrink: 0,
                }}
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
                // Prevent editor from losing focus
                e.preventDefault();
                execCmd(item.cmd, item.value);
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Editing surface */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
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

      {/* Placeholder via CSS injected inline via a style tag trick — no JSX-only approach */}
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
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 1.5rem;
          margin: 0.5em 0 0.75em;
        }
        [contenteditable] li { margin-bottom: 0.25em; }
        [contenteditable] a  { color: #981b1e; text-decoration: underline; }
      `}</style>
    </div>
  );
}
