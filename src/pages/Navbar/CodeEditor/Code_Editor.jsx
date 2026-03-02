import { useEffect, useState, useRef, useCallback } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";

const DEFAULT_FILES = [
  {
    filename: "index.html",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <div class="container">
      <h1>Hello, World! 🌱</h1>
      <p>Edit the files to see live changes.</p>
      <button onclick="sayHi()">Click Me</button>
    </div>
    <script src="app.js"></script>
  </body>
</html>`
  },
  {
    filename: "style.css",
    language: "css",
    content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #07080f;
  color: #eeeaf4;
  font-family: 'Syne', system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.container {
  text-align: center;
  padding: 40px;
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #34d399, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
}

p {
  color: rgba(238,234,244,0.5);
  margin-bottom: 24px;
  font-family: monospace;
  font-size: 14px;
}

button {
  padding: 12px 28px;
  background: linear-gradient(135deg, #34d399, #10b981);
  border: none;
  border-radius: 12px;
  color: #07080f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(52,211,153,0.4);
}`
  },
  {
    filename: "app.js",
    language: "javascript",
    content: `function sayHi() {
  const btn = document.querySelector('button');
  btn.textContent = '🎉 Hello!';
  btn.style.transform = 'scale(1.1)';
  setTimeout(() => {
    btn.textContent = 'Click Me';
    btn.style.transform = '';
  }, 1000);
}

console.log('App loaded! 🚀');`
  }
];

const LANG_CONFIG = {
  html:       { icon: "🌐", color: "#f97316", label: "HTML"       },
  css:        { icon: "🎨", color: "#818cf8", label: "CSS"        },
  javascript: { icon: "⚡", color: "#fbbf24", label: "JS"         },
  python:     { icon: "🐍", color: "#34d399", label: "Python"     },
  java:       { icon: "☕", color: "#fb7185", label: "Java"       },
  typescript: { icon: "📘", color: "#60a5fa", label: "TS"         },
  json:       { icon: "📋", color: "#a78bfa", label: "JSON"       },
  markdown:   { icon: "📝", color: "#94a3b8", label: "MD"         },
};

const EXT_MAP = {
  html: "html", css: "css", js: "javascript",
  ts: "typescript", py: "python", java: "java",
  json: "json", md: "markdown", txt: "text"
};

const getUserId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw)?._id || null;
  } catch { return null; }
};

// ── Simple syntax highlighter (CSS-only, no deps)
function highlight(code, lang) {
  if (!code) return "";
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (lang === "html") {
    escaped = escaped
      .replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#f97316">$2</span>')
      .replace(/([\w-]+=)(\"[^\"]*\")/g, '<span style="color:#818cf8">$1</span><span style="color:#34d399">$2</span>')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color:#6b7280">$1</span>');
  } else if (lang === "css") {
    escaped = escaped
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6b7280">$1</span>')
      .replace(/([.#]?[\w-]+)(\s*\{)/g, '<span style="color:#818cf8">$1</span>$2')
      .replace(/([\w-]+)(\s*:)([^;{]+)/g, '<span style="color:#60a5fa">$1</span>$2<span style="color:#34d399">$3</span>');
  } else if (lang === "javascript" || lang === "typescript") {
    escaped = escaped
      .replace(/(\/\/[^\n]*)/g, '<span style="color:#6b7280">$1</span>')
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|new|this|typeof|instanceof|true|false|null|undefined)\b/g, '<span style="color:#818cf8">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span style="color:#34d399">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#fbbf24">$1</span>');
  } else if (lang === "python") {
    escaped = escaped
      .replace(/(#[^\n]*)/g, '<span style="color:#6b7280">$1</span>')
      .replace(/\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|True|False|None|print|self|with|as|try|except|finally|raise|pass|break|continue|lambda|yield)\b/g, '<span style="color:#818cf8">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|"""[\s\S]*?""")/g, '<span style="color:#34d399">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#fbbf24">$1</span>');
  }

  return escaped;
}

export default function CodeEditor() {
  const userId = getUserId();

  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [srcDoc, setSrcDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [newFileModal, setNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [renameIdx, setRenameIdx] = useState(null);
  const [renameName, setRenameName] = useState("");
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [showLineNums, setShowLineNums] = useState(true);
  const [previewSize, setPreviewSize] = useState(45);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef(null);
  const editorWrapRef = useRef(null);
  const highlightRef = useRef(null);
  const dragRef = useRef(null);

  const activeFile = files[activeIndex] || files[0];
  const langConf = LANG_CONFIG[activeFile?.language] || { icon: "📄", color: "#94a3b8", label: "TXT" };

  /* ── LOAD FROM DB ── */
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${BASE_URL}/code/my`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId })
    })
      .then(r => r.json())
      .then(data => {
        if (data.status === "success" && data.files?.length > 0) {
          setFiles(data.files);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  /* ── LIVE PREVIEW ── */
  useEffect(() => {
    const html = files.filter(f => f.language === "html").map(f => f.content).join("");
    const css  = files.filter(f => f.language === "css").map(f => `<style>${f.content}</style>`).join("");
    const js   = files.filter(f => f.language === "javascript").map(f => `<script>${f.content}<\/script>`).join("");
    setSrcDoc(`<!DOCTYPE html><html><head>${css}</head><body>${html}${js}</body></html>`);
  }, [files]);

  /* ── SYNC SCROLL highlight ── */
  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  /* ── TAB KEY ── */
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = activeFile.content;
      const newVal = val.substring(0, start) + "  " + val.substring(end);
      updateContent(newVal);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
  }, [activeFile]);

  /* ── UPDATE CONTENT ── */
  const updateContent = (value) => {
    setFiles(prev => {
      const updated = [...prev];
      updated[activeIndex] = { ...updated[activeIndex], content: value };
      return updated;
    });
  };

  /* ── CREATE FILE ── */
  const createFile = () => {
    const name = newFileName.trim();
    if (!name) return;
    const ext = name.split(".").pop().toLowerCase();
    const language = EXT_MAP[ext] || "text";
    setFiles(prev => {
      const updated = [...prev, { filename: name, language, content: "" }];
      setActiveIndex(updated.length - 1);
      return updated;
    });
    setNewFileName("");
    setNewFileModal(false);
  };

  /* ── DELETE FILE ── */
  const deleteFile = (index) => {
    if (files.length === 1) return;
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setActiveIndex(Math.min(activeIndex, updated.length - 1));
      return updated;
    });
  };

  /* ── RENAME FILE ── */
  const doRename = () => {
    if (renameIdx === null || !renameName.trim()) return;
    const ext = renameName.trim().split(".").pop().toLowerCase();
    setFiles(prev => {
      const updated = [...prev];
      updated[renameIdx] = {
        ...updated[renameIdx],
        filename: renameName.trim(),
        language: EXT_MAP[ext] || updated[renameIdx].language
      };
      return updated;
    });
    setRenameIdx(null);
    setRenameName("");
  };

  /* ── SAVE ── */
  const handleSave = async () => {
    if (!userId) { setSaveStatus("nologin"); setTimeout(() => setSaveStatus(""), 2000); return; }
    setSaveStatus("saving");
    try {
      const res = await fetch(`${BASE_URL}/code/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, files })
      });
      const data = await res.json();
      setSaveStatus(data.status === "saved" ? "saved" : "error");
    } catch { setSaveStatus("error"); }
    setTimeout(() => setSaveStatus(""), 2500);
  };

  /* ── RESIZE DIVIDER DRAG ── */
  const onDividerMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = e.clientX;
    const startSize = previewSize;

    const onMove = (e) => {
      const total = editorWrapRef.current?.offsetWidth || window.innerWidth;
      const delta = ((e.clientX - dragRef.current) / total) * 100;
      setPreviewSize(Math.min(70, Math.max(20, startSize - delta)));
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  /* ── LINE NUMBERS ── */
  const lineCount = (activeFile?.content || "").split("\n").length;

  /* ── SAVE BUTTON ── */
  const saveLabel =
    saveStatus === "saving" ? "Saving..." :
    saveStatus === "saved"  ? "✓ Saved"   :
    saveStatus === "error"  ? "✕ Failed"  :
    saveStatus === "nologin"? "Login first" :
    "Save";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ce-root {
          height: 100vh;
          background: #07080f;
          color: #eeeaf4;
          font-family: 'Syne', sans-serif;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .ce-root::before {
          content: '';
          position: fixed; inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 5% 0%, rgba(52,211,153,0.05), transparent 50%),
            radial-gradient(ellipse 40% 30% at 95% 100%, rgba(99,102,241,0.04), transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── TITLEBAR ── */
        .ce-titlebar {
          position: relative;
          z-index: 10;
          height: 52px;
          flex-shrink: 0;
          background: rgba(13,14,26,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          gap: 12px;
        }

        .ce-titlebar::after {
          content: '';
          position: absolute;
          bottom: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.2), transparent);
        }

        .ce-logo {
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0;
        }

        .ce-logo-icon {
          width: 32px; height: 32px;
          background: rgba(52,211,153,0.1);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
        }

        .ce-logo-text {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #eeeaf4, #a8a0c8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ce-logo-text span {
          background: linear-gradient(135deg, #34d399, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ce-titlebar-center {
          display: flex; align-items: center; gap: 6px;
          flex: 1; justify-content: center;
        }

        .ce-file-pill {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          padding: 5px 12px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.6);
        }

        .ce-titlebar-right {
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0;
        }

        .ce-tb-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(238,234,244,0.6);
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .ce-tb-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #eeeaf4;
          border-color: rgba(255,255,255,0.15);
        }

        .ce-tb-btn.active {
          background: rgba(52,211,153,0.1);
          border-color: rgba(52,211,153,0.3);
          color: #34d399;
        }

        .ce-save-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 18px;
          border-radius: 9px;
          border: none;
          background: linear-gradient(135deg, #34d399, #10b981);
          color: #07080f;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 14px rgba(52,211,153,0.3);
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }

        .ce-save-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent 60%);
        }

        .ce-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(52,211,153,0.45);
        }

        .ce-save-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .ce-save-btn.saved {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .ce-save-btn.error {
          background: linear-gradient(135deg, #f87171, #ef4444);
        }

        /* ── MAIN LAYOUT ── */
        .ce-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        /* ── SIDEBAR ── */
        .ce-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: rgba(13,14,26,0.8);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        .ce-sidebar.closed { width: 0; }

        .ce-sidebar-header {
          padding: 12px 14px 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }

        .ce-sidebar-title {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(238,234,244,0.3);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .ce-new-file-btn {
          width: 24px; height: 24px;
          border-radius: 7px;
          border: 1px solid rgba(52,211,153,0.25);
          background: rgba(52,211,153,0.08);
          color: #34d399;
          font-size: 14px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .ce-new-file-btn:hover {
          background: rgba(52,211,153,0.15);
          border-color: rgba(52,211,153,0.4);
        }

        .ce-file-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          scrollbar-width: thin;
          scrollbar-color: rgba(52,211,153,0.15) transparent;
        }

        .ce-file-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 10px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.18s;
          group: true;
          position: relative;
        }

        .ce-file-item:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.06);
        }

        .ce-file-item.active {
          background: rgba(52,211,153,0.08);
          border-color: rgba(52,211,153,0.2);
        }

        .ce-file-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .ce-file-name {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.65);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.18s;
        }

        .ce-file-item.active .ce-file-name { color: #34d399; }

        .ce-file-actions {
          display: flex; gap: 3px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .ce-file-item:hover .ce-file-actions { opacity: 1; }

        .ce-file-action-btn {
          width: 20px; height: 20px;
          border-radius: 5px;
          border: none;
          background: transparent;
          color: rgba(238,234,244,0.35);
          font-size: 11px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ce-file-action-btn:hover { background: rgba(255,255,255,0.1); color: #eeeaf4; }
        .ce-file-action-btn.del:hover { background: rgba(248,113,113,0.15); color: #f87171; }

        /* ── EDITOR ZONE ── */
        .ce-editor-zone {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        /* TABS */
        .ce-tabs {
          display: flex;
          align-items: center;
          background: rgba(7,8,15,0.95);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          overflow-x: auto;
          flex-shrink: 0;
          scrollbar-width: none;
          height: 38px;
        }

        .ce-tabs::-webkit-scrollbar { display: none; }

        .ce-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 14px;
          height: 100%;
          border-right: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          white-space: nowrap;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(238,234,244,0.4);
          transition: all 0.15s;
          position: relative;
          flex-shrink: 0;
        }

        .ce-tab:hover { color: rgba(238,234,244,0.7); background: rgba(255,255,255,0.03); }

        .ce-tab.active {
          color: #eeeaf4;
          background: rgba(255,255,255,0.04);
        }

        .ce-tab.active::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #34d399, #10b981);
        }

        .ce-tab-close {
          width: 14px; height: 14px;
          border-radius: 4px;
          border: none; background: transparent;
          color: rgba(238,234,244,0.3);
          font-size: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.15s;
          padding: 0;
        }

        .ce-tab-close:hover { background: rgba(248,113,113,0.2); color: #f87171; }

        /* EDITOR + PREVIEW CONTAINER */
        .ce-editor-preview {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        /* CODE EDITOR */
        .ce-code-area {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
          min-width: 0;
        }

        /* LINE NUMBERS */
        .ce-line-nums {
          width: 48px;
          flex-shrink: 0;
          background: rgba(13,14,26,0.6);
          border-right: 1px solid rgba(255,255,255,0.05);
          padding: 16px 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          padding-right: 10px;
          user-select: none;
        }

        .ce-line-num {
          font-family: 'DM Mono', monospace;
          font-size: var(--ce-fontsize, 14px);
          line-height: 1.7;
          color: rgba(238,234,244,0.15);
          white-space: pre;
        }

        .ce-line-num.active { color: rgba(52,211,153,0.5); }

        /* HIGHLIGHT + TEXTAREA CONTAINER */
        .ce-textarea-wrap {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        .ce-highlight-layer {
          position: absolute;
          inset: 0;
          padding: 16px 16px;
          font-family: 'DM Mono', monospace;
          font-size: var(--ce-fontsize, 14px);
          line-height: 1.7;
          white-space: pre;
          overflow: auto;
          pointer-events: none;
          color: transparent;
          tab-size: 2;
          scrollbar-width: none;
        }

        .ce-highlight-layer::-webkit-scrollbar { display: none; }

        .ce-textarea {
          position: absolute;
          inset: 0;
          padding: 16px 16px;
          font-family: 'DM Mono', monospace;
          font-size: var(--ce-fontsize, 14px);
          line-height: 1.7;
          background: transparent;
          color: #eeeaf4;
          border: none;
          outline: none;
          resize: none;
          tab-size: 2;
          white-space: pre;
          overflow: auto;
          caret-color: #34d399;
          scrollbar-width: thin;
          scrollbar-color: rgba(52,211,153,0.15) transparent;
          spellcheck: false;
        }

        .ce-textarea.wrap,
        .ce-highlight-layer.wrap {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .ce-textarea::-webkit-scrollbar { width: 6px; height: 6px; }
        .ce-textarea::-webkit-scrollbar-thumb { background: rgba(52,211,153,0.2); border-radius: 3px; }

        /* ── RESIZE DIVIDER ── */
        .ce-divider {
          width: 4px;
          background: rgba(255,255,255,0.04);
          cursor: col-resize;
          flex-shrink: 0;
          position: relative;
          transition: background 0.2s;
          display: flex; align-items: center; justify-content: center;
        }

        .ce-divider:hover, .ce-divider.dragging {
          background: rgba(52,211,153,0.2);
        }

        .ce-divider::before {
          content: '';
          width: 2px; height: 32px;
          background: rgba(52,211,153,0.3);
          border-radius: 2px;
        }

        /* ── PREVIEW ── */
        .ce-preview-pane {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: #fff;
          overflow: hidden;
          transition: width 0.3s;
        }

        .ce-preview-header {
          height: 36px;
          background: rgba(13,14,26,0.97);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          padding: 0 14px;
          gap: 8px;
          flex-shrink: 0;
        }

        .ce-preview-dots {
          display: flex; gap: 5px;
        }

        .ce-preview-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
        }

        .ce-preview-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(238,234,244,0.3);
          letter-spacing: 0.08em;
          flex: 1;
          text-align: center;
        }

        .ce-iframe {
          flex: 1;
          border: none;
          width: 100%;
        }

        /* ── STATUS BAR ── */
        .ce-statusbar {
          height: 26px;
          background: rgba(52,211,153,0.08);
          border-top: 1px solid rgba(52,211,153,0.15);
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 20px;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }

        .ce-status-item {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: rgba(52,211,153,0.6);
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }

        .ce-status-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #34d399;
          animation: sbBlink 2s ease-in-out infinite;
        }

        @keyframes sbBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* ── MODALS ── */
        .ce-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(7,8,15,0.85);
          backdrop-filter: blur(12px);
          z-index: 999;
          display: flex; align-items: center; justify-content: center;
          animation: ceOvIn 0.2s ease both;
        }

        @keyframes ceOvIn { from{opacity:0} to{opacity:1} }

        .ce-modal {
          background: #0d0e1a;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px 28px 24px;
          width: 340px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.5);
          animation: ceModalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
          position: relative;
        }

        @keyframes ceModalIn {
          from { opacity:0; transform: scale(0.93) translateY(12px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }

        .ce-modal::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent);
          border-radius: 20px 20px 0 0;
        }

        .ce-modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #eeeaf4;
          margin-bottom: 6px;
          letter-spacing: -0.01em;
        }

        .ce-modal-sub {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(238,234,244,0.35);
          margin-bottom: 20px;
        }

        .ce-modal-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 13px;
          color: #eeeaf4;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
          margin-bottom: 16px;
        }

        .ce-modal-input:focus {
          border-color: rgba(52,211,153,0.4);
          background: rgba(52,211,153,0.04);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }

        .ce-modal-actions { display: flex; gap: 8px; }

        .ce-modal-confirm {
          flex: 1;
          padding: 10px;
          background: linear-gradient(135deg, #34d399, #10b981);
          border: none; border-radius: 10px;
          color: #07080f;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ce-modal-confirm:hover { opacity: 0.9; transform: translateY(-1px); }

        .ce-modal-cancel {
          flex: 1;
          padding: 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: rgba(238,234,244,0.5);
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ce-modal-cancel:hover { background: rgba(255,255,255,0.08); color: #eeeaf4; }

        /* LOADING */
        .ce-loading-overlay {
          position: absolute; inset: 0;
          background: rgba(7,8,15,0.7);
          backdrop-filter: blur(8px);
          z-index: 50;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 14px;
        }

        .ce-load-spinner {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 2px solid rgba(52,211,153,0.15);
          border-top-color: #34d399;
          animation: ceSpin 0.8s linear infinite;
        }

        @keyframes ceSpin { to { transform: rotate(360deg); } }

        .ce-load-text {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: rgba(238,234,244,0.4);
        }

        /* SETTINGS ROW */
        .ce-settings-row {
          display: flex; align-items: center; gap: 6px;
          padding: 0 8px;
        }

        .ce-setting-btn {
          padding: 4px 10px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent;
          color: rgba(238,234,244,0.4);
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .ce-setting-btn:hover { background: rgba(255,255,255,0.06); color: #eeeaf4; }
        .ce-setting-btn.on { background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.2); color: #34d399; }

        /* LANGUAGE BADGE */
        .ce-lang-badge {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 10px;
          border-radius: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(238,234,244,0.5);
        }

        @media (max-width: 768px) {
          .ce-sidebar { display: none; }
          .ce-preview-pane { display: none; }
        }
      `}</style>

      <div
        className="ce-root"
        style={{ "--ce-fontsize": `${fontSize}px` }}
      >
        {/* ── TITLEBAR ── */}
        <div className="ce-titlebar">
          <div className="ce-logo">
            <div className="ce-logo-icon">🧠</div>
            <div className="ce-logo-text">DWJD <span>Editor</span></div>
          </div>

          <div className="ce-titlebar-center">
            <div className="ce-file-pill">
              <span style={{ color: langConf.color }}>{langConf.icon}</span>
              {activeFile?.filename}
            </div>
          </div>

          <div className="ce-titlebar-right">
            {loading && (
              <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "rgba(238,234,244,0.35)" }}>
                Loading...
              </span>
            )}

            <div className="ce-settings-row">
              <button
                className={`ce-setting-btn ${showLineNums ? "on" : ""}`}
                onClick={() => setShowLineNums(v => !v)}
                title="Toggle line numbers"
              >
                # Lines
              </button>
              <button
                className={`ce-setting-btn ${wordWrap ? "on" : ""}`}
                onClick={() => setWordWrap(v => !v)}
                title="Toggle word wrap"
              >
                Wrap
              </button>
              <button
                className="ce-setting-btn"
                onClick={() => setFontSize(s => Math.max(10, s - 1))}
              >A−</button>
              <button
                className="ce-setting-btn"
                onClick={() => setFontSize(s => Math.min(22, s + 1))}
              >A+</button>
            </div>

            <button
              className={`ce-tb-btn ${sidebarOpen ? "active" : ""}`}
              onClick={() => setSidebarOpen(v => !v)}
              title="Toggle sidebar"
            >
              ⇄ Files
            </button>

            <button
              className={`ce-tb-btn ${previewOpen ? "active" : ""}`}
              onClick={() => setPreviewOpen(v => !v)}
              title="Toggle preview"
            >
              ▶ Preview
            </button>

            <button
              className={`ce-save-btn ${saveStatus === "saved" ? "saved" : saveStatus === "error" ? "error" : ""}`}
              onClick={handleSave}
              disabled={saveStatus === "saving"}
            >
              <span style={{ position: "relative", zIndex: 1 }}>
                {saveStatus === "saving" ? "⏳" : saveStatus === "saved" ? "✓" : saveStatus === "error" ? "✕" : "💾"}
                {" "}{saveLabel}
              </span>
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="ce-body" ref={editorWrapRef}>

          {/* SIDEBAR */}
          <div className={`ce-sidebar ${sidebarOpen ? "" : "closed"}`}>
            <div className="ce-sidebar-header">
              <span className="ce-sidebar-title">Explorer</span>
              <button
                className="ce-new-file-btn"
                onClick={() => setNewFileModal(true)}
                title="New file"
              >+</button>
            </div>

            <div className="ce-file-list">
              {files.map((f, i) => {
                const lc = LANG_CONFIG[f.language] || { icon: "📄", color: "#94a3b8" };
                return (
                  <div
                    key={i}
                    className={`ce-file-item ${i === activeIndex ? "active" : ""}`}
                    onClick={() => setActiveIndex(i)}
                  >
                    <div className="ce-file-dot" style={{ background: lc.color + "99" }} />
                    <span className="ce-file-name" title={f.filename}>{f.filename}</span>
                    <div className="ce-file-actions">
                      <button
                        className="ce-file-action-btn"
                        onClick={e => { e.stopPropagation(); setRenameIdx(i); setRenameName(f.filename); }}
                        title="Rename"
                      >✎</button>
                      {files.length > 1 && (
                        <button
                          className="ce-file-action-btn del"
                          onClick={e => { e.stopPropagation(); deleteFile(i); }}
                          title="Delete"
                        >✕</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EDITOR + PREVIEW */}
          <div className="ce-editor-zone">
            {/* TABS */}
            <div className="ce-tabs">
              {files.map((f, i) => {
                const lc = LANG_CONFIG[f.language] || { icon: "📄", color: "#94a3b8" };
                return (
                  <div
                    key={i}
                    className={`ce-tab ${i === activeIndex ? "active" : ""}`}
                    onClick={() => setActiveIndex(i)}
                  >
                    <span style={{ color: lc.color }}>{lc.icon}</span>
                    {f.filename}
                    {files.length > 1 && (
                      <button
                        className="ce-tab-close"
                        onClick={e => { e.stopPropagation(); deleteFile(i); }}
                      >✕</button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="ce-editor-preview">
              {/* CODE AREA */}
              <div className="ce-code-area">
                {/* LINE NUMBERS */}
                {showLineNums && (
                  <div className="ce-line-nums">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i} className="ce-line-num">{i + 1}</div>
                    ))}
                  </div>
                )}

                {/* TEXTAREA + HIGHLIGHT */}
                <div className="ce-textarea-wrap">
                  <div
                    ref={highlightRef}
                    className={`ce-highlight-layer ${wordWrap ? "wrap" : ""}`}
                    dangerouslySetInnerHTML={{
                      __html: highlight(activeFile?.content || "", activeFile?.language || "")
                    }}
                  />
                  <textarea
                    ref={textareaRef}
                    className={`ce-textarea ${wordWrap ? "wrap" : ""}`}
                    value={activeFile?.content || ""}
                    onChange={e => updateContent(e.target.value)}
                    onScroll={syncScroll}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    placeholder={`// Start coding in ${activeFile?.filename}...`}
                  />
                </div>
              </div>

              {/* DIVIDER */}
              {previewOpen && (
                <div
                  className={`ce-divider ${isDragging ? "dragging" : ""}`}
                  onMouseDown={onDividerMouseDown}
                />
              )}

              {/* PREVIEW */}
              {previewOpen && (
                <div
                  className="ce-preview-pane"
                  style={{ width: `${previewSize}%` }}
                >
                  <div className="ce-preview-header">
                    <div className="ce-preview-dots">
                      <div className="ce-preview-dot" style={{ background: "#f87171" }} />
                      <div className="ce-preview-dot" style={{ background: "#fbbf24" }} />
                      <div className="ce-preview-dot" style={{ background: "#34d399" }} />
                    </div>
                    <div className="ce-preview-label">Live Preview</div>
                  </div>
                  <iframe
                    title="preview"
                    sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                    srcDoc={srcDoc}
                    className="ce-iframe"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STATUS BAR ── */}
        <div className="ce-statusbar">
          <div className="ce-status-item">
            <div className="ce-status-dot" />
            Ready
          </div>
          <div className="ce-status-item">
            <span className="ce-lang-badge">
              <span style={{ color: langConf.color }}>{langConf.icon}</span>
              {langConf.label}
            </span>
          </div>
          <div className="ce-status-item">Ln {lineCount}</div>
          <div className="ce-status-item">{fontSize}px</div>
          <div className="ce-status-item" style={{ marginLeft: "auto" }}>
            {!userId && "⚠️ Login to save"}
            {userId && saveStatus === "saved" && <span style={{ color: "#34d399" }}>✓ Saved to cloud</span>}
          </div>
        </div>

        {/* ── LOADING OVERLAY ── */}
        {loading && (
          <div className="ce-loading-overlay" style={{ position: "absolute", zIndex: 50 }}>
            <div className="ce-load-spinner" />
            <div className="ce-load-text">Loading your workspace...</div>
          </div>
        )}

        {/* ── NEW FILE MODAL ── */}
        {newFileModal && (
          <div className="ce-modal-overlay" onClick={() => setNewFileModal(false)}>
            <div className="ce-modal" onClick={e => e.stopPropagation()}>
              <div className="ce-modal-title">New File</div>
              <div className="ce-modal-sub">Extension auto-detects language · e.g. utils.js, page.html</div>
              <input
                className="ce-modal-input"
                placeholder="filename.ext"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createFile()}
                autoFocus
              />
              <div className="ce-modal-actions">
                <button className="ce-modal-confirm" onClick={createFile}>Create File</button>
                <button className="ce-modal-cancel" onClick={() => setNewFileModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── RENAME MODAL ── */}
        {renameIdx !== null && (
          <div className="ce-modal-overlay" onClick={() => setRenameIdx(null)}>
            <div className="ce-modal" onClick={e => e.stopPropagation()}>
              <div className="ce-modal-title">Rename File</div>
              <div className="ce-modal-sub">Changing extension will update the language automatically</div>
              <input
                className="ce-modal-input"
                value={renameName}
                onChange={e => setRenameName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doRename()}
                autoFocus
              />
              <div className="ce-modal-actions">
                <button className="ce-modal-confirm" onClick={doRename}>Rename</button>
                <button className="ce-modal-cancel" onClick={() => setRenameIdx(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}