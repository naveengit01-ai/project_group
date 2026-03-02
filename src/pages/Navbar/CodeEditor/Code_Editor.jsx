import { useEffect, useState } from "react";

const BASE_URL = "https://back-end-project-group.onrender.com";
// const BASE_URL = "https://back-end-project-group.onrender.com";

/* ================= DEFAULT FILES ================= */
const DEFAULT_FILES = [
  {
    filename: "index.html",
    language: "html",
    content: `<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <h1>Hello Code Editor</h1>
    <button onclick="sayHi()">Click</button>
    <script src="app.js"></script>
  </body>
</html>`
  },
  {
    filename: "style.css",
    language: "css",
    content: `body {
  background: #0f172a;
  color: white;
  font-family: system-ui;
}
button {
  padding: 10px;
  background: #34d399;
  border: none;
  cursor: pointer;
}`
  },
  {
    filename: "app.js",
    language: "javascript",
    content: `function sayHi() {
  alert("Hello from JS!");
}`
  }
];

/* ================= GET USER ID FROM LOCALSTORAGE ================= */
const getUserId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed._id || null;
  } catch (e) {
    return null;
  }
};

export default function CodeEditor() {
  const userId = getUserId();

  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [srcDoc, setSrcDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // "", "saving", "saved", "error"

  /* ================= LOAD FROM DB ================= */
  useEffect(() => {
    if (!userId) return;

    const loadFromDB = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/code/my`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId })
        });

        if (!res.ok) {
          console.error("Load failed:", res.status);
          return;
        }

        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.files) && data.files.length > 0) {
          setFiles(data.files);
          setActiveIndex(0);
        }
      } catch (err) {
        console.error("Failed to load code:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFromDB();
  }, [userId]);

  /* ================= LIVE PREVIEW ================= */
  useEffect(() => {
    const html = files
      .filter(f => f.language === "html")
      .map(f => f.content)
      .join("");

    const css = files
      .filter(f => f.language === "css")
      .map(f => `<style>${f.content}</style>`)
      .join("");

    const js = files
      .filter(f => f.language === "javascript")
      .map(f => `<script>${f.content}<\/script>`)
      .join("");

    setSrcDoc(`
      <!DOCTYPE html>
      <html>
        <head>${css}</head>
        <body>
          ${html}
          ${js}
        </body>
      </html>
    `);
  }, [files]);

  /* ================= UPDATE FILE CONTENT ================= */
  const updateContent = (value) => {
    setFiles(prev => {
      const updated = [...prev];
      updated[activeIndex] = { ...updated[activeIndex], content: value };
      return updated;
    });
  };

  /* ================= CREATE FILE ================= */
  const createFile = () => {
    const name = prompt("Enter file name (e.g. utils.js)");
    if (!name || !name.trim()) return;

    const trimmed = name.trim();
    const ext = trimmed.split(".").pop().toLowerCase();
    const langMap = { html: "html", css: "css", js: "javascript" };

    setFiles(prev => {
      const updated = [...prev, {
        filename: trimmed,
        language: langMap[ext] || "text",
        content: ""
      }];
      setActiveIndex(updated.length - 1);
      return updated;
    });
  };

  /* ================= DELETE FILE ================= */
  const deleteFile = (index) => {
    if (files.length === 1) {
      alert("You must have at least one file.");
      return;
    }
    if (!window.confirm(`Delete "${files[index].filename}"?`)) return;

    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setActiveIndex(0);
      return updated;
    });
  };

  /* ================= RENAME FILE ================= */
  const renameFile = (index) => {
    const current = files[index].filename;
    const newName = prompt("Enter new file name:", current);
    if (!newName || !newName.trim() || newName.trim() === current) return;

    setFiles(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], filename: newName.trim() };
      return updated;
    });
  };

  /* ================= SAVE TO DB ================= */
  const handleSave = async () => {
    if (!userId) {
      alert("Please login to save your code.");
      return;
    }

    setSaveStatus("saving");

    try {
      const res = await fetch(`${BASE_URL}/code/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, files })
      });

      if (!res.ok) {
        console.error("Save failed:", res.status);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(""), 2500);
        return;
      }

      const data = await res.json();

      if (data.status === "saved") {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 2500);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(""), 2500);
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 2500);
    }
  };

  const activeFile = files[activeIndex] || files[0];

  const saveLabel =
    saveStatus === "saving" ? "⏳ Saving..." :
    saveStatus === "saved"  ? "✅ Saved!"   :
    saveStatus === "error"  ? "❌ Failed"   :
    "💾 Save";

  const saveBtnColor =
    saveStatus === "saved"  ? "bg-green-400" :
    saveStatus === "error"  ? "bg-red-500 text-white" :
    "bg-emerald-500";

  const langIcon = (lang) =>
    lang === "html" ? "🌐" :
    lang === "css"  ? "🎨" :
    lang === "javascript" ? "⚡" : "📄";

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col">

      {/* HEADER */}
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <h1 className="font-bold text-lg">🧠 Code Editor</h1>
        <div className="flex items-center gap-3">
          {loading && (
            <span className="text-xs text-white/50 animate-pulse">Loading your code...</span>
          )}
          {!userId && (
            <span className="text-xs text-yellow-400">⚠️ Login to save to DB</span>
          )}
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className={`px-5 py-2 ${saveBtnColor} text-black rounded font-semibold transition-all`}
          >
            {saveLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* FILE EXPLORER */}
        <div className="w-56 border-r border-white/10 p-3 flex flex-col gap-1">
          <button
            onClick={createFile}
            className="mb-2 w-full bg-white/10 hover:bg-white/20 py-1.5 rounded text-sm transition-colors"
          >
            ➕ New File
          </button>

          {files.map((f, i) => (
            <div
              key={`${f.filename}-${i}`}
              className={`px-3 py-2 rounded text-sm flex justify-between items-center group
                ${i === activeIndex
                  ? "bg-emerald-500 text-black"
                  : "hover:bg-white/10"}`}
            >
              <span
                onClick={() => setActiveIndex(i)}
                onDoubleClick={() => renameFile(i)}
                className="truncate flex-1 cursor-pointer select-none"
                title="Click to open · Double-click to rename"
              >
                {langIcon(f.language)} {f.filename}
              </span>
              <span
                onClick={(e) => { e.stopPropagation(); deleteFile(i); }}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-red-400"
                title="Delete file"
              >
                🗑
              </span>
            </div>
          ))}
        </div>

        {/* EDITOR */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-3 py-1 bg-[#0d1424] border-b border-white/10 text-xs text-white/60 overflow-x-auto">
            {files.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`px-3 py-1 rounded-t whitespace-nowrap transition-colors
                  ${i === activeIndex
                    ? "bg-[#0b0f19] text-emerald-400 border border-white/10 border-b-transparent"
                    : "hover:text-white"}`}
              >
                {langIcon(f.language)} {f.filename}
              </button>
            ))}
          </div>

          <textarea
            value={activeFile?.content ?? ""}
            onChange={e => updateContent(e.target.value)}
            spellCheck={false}
            className="flex-1 bg-[#0b0f19] p-4 font-mono text-sm outline-none resize-none text-white/90 leading-relaxed"
            placeholder={`// Start coding in ${activeFile?.filename}...`}
          />
        </div>

        {/* LIVE PREVIEW */}
        <iframe
          title="preview"
          sandbox="allow-scripts allow-modals"
          srcDoc={srcDoc}
          className="w-1/2 bg-white border-l border-white/10"
        />
      </div>
    </div>
  );
}
