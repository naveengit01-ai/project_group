import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

const API = "https://back-end-project-group.onrender.com";
// const API = "http://localhost:5000";

export default function YoutubeView() {
  const { id } = useParams();
  const codeRefs = useRef([]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(`${API}/youtube/${id}`);
        if (res.data?.status === "success") {
          setData(res.data.content);
        } else {
          setError("Content not found");
        }
      } catch {
        setError("Unable to reach server");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  /* ================= HIGHLIGHT ================= */
  useEffect(() => {
    codeRefs.current.forEach(el => {
      if (el) hljs.highlightElement(el);
    });
  }, [data]);

  const copyCode = async (code, index) => {
    await navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center">
        {error}
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="border-b border-white/20 pb-4">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <span>👀 {data.views} views</span>
            <span>{new Date(data.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* EMBED CODE (OPTIONAL) */}
        {data.embedCode && (
          <div className="border border-white/20 rounded-xl bg-black/60">
            <div className="flex justify-between items-center px-5 py-3 border-b border-white/10">
              <span className="text-sm text-gray-400">
                Embed Code
              </span>
              <button
                onClick={() => copyCode(data.embedCode, "embed")}
                className="text-xs px-3 py-1 border border-white/20 rounded hover:bg-white/20"
              >
                {copiedIndex === "embed" ? "Copied!" : "Copy"}
              </button>
            </div>

            <pre className="overflow-x-auto p-5 text-sm">
              <code className="language-html">
                {data.embedCode}
              </code>
            </pre>
          </div>
        )}

        {/* ================= MAIN TOPICS ================= */}
        {data.mainTopics?.map((main, m) => (
          <div key={m} className="space-y-6">

            {/* MAIN TOPIC */}
            <div>
              <h2 className="text-2xl font-semibold text-cyan-400">
                {main.title}
              </h2>
              {main.notes && (
                <p className="text-gray-400 mt-2">
                  {main.notes}
                </p>
              )}
            </div>

            {/* MAIN TOPIC CODE */}
            {main.code && (
              <div className="border border-white/20 rounded-xl bg-black/60">
                <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
                  <span className="text-xs text-gray-400">
                    Code
                  </span>
                  <button
                    onClick={() => copyCode(main.code, `main-${m}`)}
                    className="text-xs px-2 py-1 border border-white/20 rounded"
                  >
                    {copiedIndex === `main-${m}` ? "Copied!" : "Copy"}
                  </button>
                </div>

                <pre className="p-4 overflow-x-auto text-sm">
                  <code
                    ref={el => (codeRefs.current[m] = el)}
                    className="language-javascript"
                  >
                    {main.code}
                  </code>
                </pre>
              </div>
            )}

            {/* SUB TOPICS */}
            {main.subTopics?.map((sub, s) => (
              <div key={s} className="pl-6 border-l border-white/10 space-y-4">

                <h3 className="text-lg font-semibold text-emerald-400">
                  {sub.title}
                </h3>

                {sub.notes && (
                  <p className="text-gray-400">
                    {sub.notes}
                  </p>
                )}

                {sub.code && (
                  <div className="border border-white/20 rounded-lg bg-black/60">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
                      <span className="text-xs text-gray-400">
                        Code
                      </span>
                      <button
                        onClick={() =>
                          copyCode(sub.code, `sub-${m}-${s}`)
                        }
                        className="text-xs px-2 py-1 border border-white/20 rounded"
                      >
                        {copiedIndex === `sub-${m}-${s}`
                          ? "Copied!"
                          : "Copy"}
                      </button>
                    </div>

                    <pre className="p-4 overflow-x-auto text-sm">
                      <code
                        ref={el =>
                          codeRefs.current[`sub-${m}-${s}`] = el
                        }
                        className="language-javascript"
                      >
                        {sub.code}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  );
}
