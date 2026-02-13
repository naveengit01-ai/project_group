import { useState } from "react";

// const BASE_URL = "https://back-end-project-group.onrender.com";
const BASE_URL = "http://localhost:5000";

export default function Youtube_Content() {
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
    <div className="max-w-5xl mx-auto p-8 bg-white/10 rounded-2xl text-white space-y-6">
      <h2 className="text-3xl font-bold text-center">
        Add YouTube Course Content
      </h2>

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

      <button
        onClick={addMainTopic}
        className="px-4 py-2 bg-cyan-400 text-black rounded font-semibold"
      >
        + Add Main Topic
      </button>

      {/* ================= MAIN TOPICS ================= */}
      {form.mainTopics.map((main, m) => (
        <div key={m} className="border border-white/20 rounded-xl p-5 space-y-4">
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold">Main Topic {m + 1}</h3>
            <button onClick={() => removeMainTopic(m)} className="text-red-400">
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
            className="text-sm px-3 py-1 bg-emerald-400 text-black rounded"
          >
            + Add Sub Topic
          </button>

          {/* ================= SUB TOPICS ================= */}
          {main.subTopics.map((sub, s) => (
            <div key={s} className="border border-white/10 rounded-lg p-4">
              <div className="flex justify-between">
                <h4>Sub Topic {s + 1}</h4>
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
                className="text-xs px-2 py-1 bg-cyan-400 text-black rounded"
              >
                + Add Sub Heading
              </button>

              {/* ================= SUB HEADINGS ================= */}
              {sub.subHeadings.map((h, i) => (
                <div key={i} className="border border-white/10 p-3 mt-2 rounded">
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

      <button
        onClick={handleSubmit}
        className="w-full bg-emerald-400 text-black py-3 rounded-xl font-bold"
      >
        Add Content
      </button>
    </div>
  );
}
