import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://back-end-project-group.onrender.com";
// const BASE_URL = "http://localhost:5000";

export default function Youtube_Content() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    embedCode: "",
    mainTopics: []
  });

  /* ================= MAIN TOPIC ================= */

  const addMainTopic = () => {
    setForm({
      ...form,
      mainTopics: [
        ...form.mainTopics,
        { title: "", notes: "", code: "", subTopics: [] }
      ]
    });
  };

  const updateMainTopic = (i, field, value) => {
    const updated = [...form.mainTopics];
    updated[i][field] = value;
    setForm({ ...form, mainTopics: updated });
  };

  const removeMainTopic = i => {
    const updated = [...form.mainTopics];
    updated.splice(i, 1);
    setForm({ ...form, mainTopics: updated });
  };

  /* ================= SUB TOPIC ================= */

  const addSubTopic = mainIndex => {
    const updated = [...form.mainTopics];
    updated[mainIndex].subTopics.push({
      title: "",
      notes: "",
      code: "",
      subHeadings: []
    });
    setForm({ ...form, mainTopics: updated });
  };

  const updateSubTopic = (m, s, field, value) => {
    const updated = [...form.mainTopics];
    updated[m].subTopics[s][field] = value;
    setForm({ ...form, mainTopics: updated });
  };

  const removeSubTopic = (m, s) => {
    const updated = [...form.mainTopics];
    updated[m].subTopics.splice(s, 1);
    setForm({ ...form, mainTopics: updated });
  };

  /* ================= SUB HEADING ================= */

  const addSubHeading = (m, s) => {
    const updated = [...form.mainTopics];
    updated[m].subTopics[s].subHeadings.push({
      title: "",
      notes: "",
      code: ""
    });
    setForm({ ...form, mainTopics: updated });
  };

  const updateSubHeading = (m, s, h, field, value) => {
    const updated = [...form.mainTopics];
    updated[m].subTopics[s].subHeadings[h][field] = value;
    setForm({ ...form, mainTopics: updated });
  };

  const removeSubHeading = (m, s, h) => {
    const updated = [...form.mainTopics];
    updated[m].subTopics[s].subHeadings.splice(h, 1);
    setForm({ ...form, mainTopics: updated });
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!form.title || !form.embedCode) {
      alert("Title & Embed code required");
      return;
    }

    const res = await fetch(`${BASE_URL}/admin/youtube-content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (data.status === "content_added") {
      alert("Content added ✅");
      setForm({ title: "", embedCode: "", mainTopics: [] });
    } else {
      alert(data.status);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ===== HEADER ===== */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10"
          >
            ⬅ Back
          </button>

          <h2 className="text-2xl font-bold">
            📺 Add YouTube Course Content
          </h2>

          <div className="w-20" /> {/* spacer */}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* BASIC INFO */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-xl font-semibold">Basic Details</h3>

          <input
            className="glass-input"
            placeholder="Course / Video Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="glass-input font-mono"
            rows={3}
            placeholder="YouTube iframe embed code"
            value={form.embedCode}
            onChange={e => setForm({ ...form, embedCode: e.target.value })}
          />
        </div>

        {/* MAIN TOPICS */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Main Topics</h3>
            <button
              onClick={addMainTopic}
              className="px-4 py-2 bg-cyan-400 text-black rounded-lg font-semibold"
            >
              + Add Main Topic
            </button>
          </div>

          {form.mainTopics.map((main, m) => (
            <div
              key={m}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">
                  Main Topic {m + 1}
                </h4>
                <button
                  onClick={() => removeMainTopic(m)}
                  className="text-red-400 hover:underline"
                >
                  Remove
                </button>
              </div>

              <input
                className="glass-input"
                placeholder="Main Topic Title"
                value={main.title}
                onChange={e => updateMainTopic(m, "title", e.target.value)}
              />

              <textarea
                className="glass-input"
                rows={2}
                placeholder="Main Topic Notes"
                value={main.notes}
                onChange={e => updateMainTopic(m, "notes", e.target.value)}
              />

              <textarea
                className="glass-input font-mono"
                rows={2}
                placeholder="Code (optional)"
                value={main.code}
                onChange={e => updateMainTopic(m, "code", e.target.value)}
              />

              <button
                onClick={() => addSubTopic(m)}
                className="px-3 py-1 bg-emerald-400 text-black rounded text-sm font-semibold"
              >
                + Add Sub Topic
              </button>

              {/* SUB TOPICS */}
              {main.subTopics.map((sub, s) => (
                <div
                  key={s}
                  className="border border-white/10 rounded-xl p-4 space-y-3"
                >
                  <div className="flex justify-between">
                    <h5 className="font-semibold">
                      Sub Topic {s + 1}
                    </h5>
                    <button
                      onClick={() => removeSubTopic(m, s)}
                      className="text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    className="glass-input"
                    placeholder="Sub Topic Title"
                    value={sub.title}
                    onChange={e => updateSubTopic(m, s, "title", e.target.value)}
                  />

                  <textarea
                    className="glass-input"
                    rows={2}
                    placeholder="Notes"
                    value={sub.notes}
                    onChange={e => updateSubTopic(m, s, "notes", e.target.value)}
                  />

                  <textarea
                    className="glass-input font-mono"
                    rows={2}
                    placeholder="Code (optional)"
                    value={sub.code}
                    onChange={e => updateSubTopic(m, s, "code", e.target.value)}
                  />

                  <button
                    onClick={() => addSubHeading(m, s)}
                    className="px-2 py-1 bg-cyan-400 text-black rounded text-xs font-semibold"
                  >
                    + Add Sub Heading
                  </button>

                  {/* SUB HEADINGS */}
                  {sub.subHeadings.map((h, i) => (
                    <div
                      key={i}
                      className="border border-white/10 rounded-lg p-3 space-y-2"
                    >
                      <input
                        className="glass-input"
                        placeholder="Sub Heading Title"
                        value={h.title}
                        onChange={e =>
                          updateSubHeading(m, s, i, "title", e.target.value)
                        }
                      />

                      <textarea
                        className="glass-input"
                        rows={2}
                        placeholder="Notes"
                        value={h.notes}
                        onChange={e =>
                          updateSubHeading(m, s, i, "notes", e.target.value)
                        }
                      />

                      <textarea
                        className="glass-input font-mono"
                        rows={2}
                        placeholder="Code (optional)"
                        value={h.code}
                        onChange={e =>
                          updateSubHeading(m, s, i, "code", e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-400 text-black py-4 rounded-2xl font-bold text-lg"
        >
          🚀 Publish Content
        </button>
      </div>
    </div>
  );
}