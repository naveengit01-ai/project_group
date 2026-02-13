import { useState } from "react";
import axios from "axios";

export default function Youtube_Content() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [url, setUrl] = useState("");

  const postContent = async () => {
    if (!title || !description || !embedCode) {
      alert("Fill everything 😤");
      return;
    }

    const res = await axios.post(
      "http://localhost:5000/admin/youtube-content",
      { title, description, embedCode }
    );

    if (res.data.status === "success") {
      setUrl(res.data.url);
      navigator.clipboard.writeText(res.data.url);
      alert("URL copied to clipboard ✅");

      setTitle("");
      setDescription("");
      setEmbedCode("");
      setShowCode(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-xl bg-white/10 p-8 rounded-2xl space-y-4">

        <h1 className="text-2xl font-bold text-center">📺 YouTube Content</h1>

        <input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-3 bg-black/70 rounded"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-3 bg-black/70 rounded"
        />

        <button
          onClick={() => setShowCode(!showCode)}
          className="bg-cyan-400 text-black px-4 py-2 rounded"
        >
          {showCode ? "Close Code" : "Add Code"}
        </button>

        {showCode && (
          <textarea
            placeholder="Paste iframe code"
            value={embedCode}
            onChange={e => setEmbedCode(e.target.value)}
            className="w-full p-3 bg-black/80 rounded font-mono"
          />
        )}

        <button
          onClick={postContent}
          className="w-full bg-emerald-400 text-black py-3 rounded font-bold"
        >
          POST
        </button>

        {url && (
          <p className="text-sm text-emerald-400 break-all">
            {url}
          </p>
        )}
      </div>
    </div>
  );
}
