import { useEffect, useState, useRef } from "react";

// const BASE_URL = "http://localhost:5000";
const BASE_URL = "https://back-end-project-group.onrender.com";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080810;
    --surface: #0f0f1a;
    --surface2: #16162a;
    --border: rgba(120,100,255,0.18);
    --accent: #7c6dfa;
    --accent2: #fa6d9a;
    --accent3: #6dfacc;
    --text: #e8e6ff;
    --muted: rgba(232,230,255,0.45);
    --glow: rgba(124,109,250,0.35);
    --glow2: rgba(250,109,154,0.25);
    --green: #6dfacc;
    --yellow: #fadb6d;
  }

  .todo-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: 'Syne', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    position: relative;
    overflow: hidden;
  }

  .todo-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background: 
      radial-gradient(ellipse 60% 40% at 20% 10%, rgba(124,109,250,0.13) 0%, transparent 70%),
      radial-gradient(ellipse 50% 35% at 80% 90%, rgba(250,109,154,0.10) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 60% 40%, rgba(109,250,204,0.07) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .grid-bg {
    position: fixed;
    inset: 0;
    background-image: 
      linear-gradient(rgba(124,109,250,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,109,250,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
    z-index: 0;
  }

  .card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 520px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 40px 36px;
    box-shadow:
      0 0 0 1px rgba(124,109,250,0.08),
      0 32px 80px rgba(0,0,0,0.6),
      0 0 80px rgba(124,109,250,0.08),
      inset 0 1px 0 rgba(255,255,255,0.06);
    animation: cardIn 0.7s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(40px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .card-glow {
    position: absolute;
    top: -60px; left: 50%;
    transform: translateX(-50%);
    width: 260px; height: 120px;
    background: radial-gradient(ellipse, rgba(124,109,250,0.25) 0%, transparent 70%);
    pointer-events: none;
    filter: blur(20px);
    animation: pulse 4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
    50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
  }

  .header {
    text-align: center;
    margin-bottom: 36px;
    animation: fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(124,109,250,0.12);
    border: 1px solid rgba(124,109,250,0.25);
    border-radius: 100px;
    padding: 4px 14px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: var(--accent);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .badge-dot {
    width: 6px; height: 6px;
    background: var(--accent);
    border-radius: 50%;
    animation: blink 2s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .title {
    font-size: 32px;
    font-weight: 800;
    color: var(--text);
    letter-spacing: -0.02em;
    line-height: 1.1;
    background: linear-gradient(135deg, #e8e6ff 0%, #a89cff 50%, #fa6d9a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    margin-top: 6px;
    font-size: 13px;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-weight: 300;
  }

  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
    margin: 0 -8px 28px;
    animation: fadeUp 0.7s 0.15s cubic-bezier(0.16,1,0.3,1) both;
  }

  /* ===== INPUT SECTION ===== */
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .input-row {
    position: relative;
    animation: slideIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-16px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .task-num {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--accent);
    font-weight: 500;
    pointer-events: none;
    opacity: 0.7;
  }

  .task-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px 14px 44px;
    color: var(--text);
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 400;
    outline: none;
    transition: all 0.25s ease;
  }

  .task-input::placeholder { color: var(--muted); }

  .task-input:focus {
    border-color: rgba(124,109,250,0.5);
    box-shadow: 0 0 0 3px rgba(124,109,250,0.1), 0 0 20px rgba(124,109,250,0.08);
    background: rgba(22,22,42,0.9);
  }

  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--accent);
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    padding: 6px 0;
    opacity: 0.8;
    transition: opacity 0.2s, transform 0.2s;
    letter-spacing: 0.02em;
    margin-top: 4px;
  }

  .add-btn:hover { opacity: 1; transform: translateX(4px); }

  .save-btn {
    width: 100%;
    margin-top: 20px;
    padding: 16px;
    background: linear-gradient(135deg, #7c6dfa, #9d6dfa);
    border: none;
    border-radius: 16px;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.01em;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 8px 32px rgba(124,109,250,0.35), 0 0 0 1px rgba(255,255,255,0.08) inset;
  }

  .save-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
    pointer-events: none;
  }

  .save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 16px 48px rgba(124,109,250,0.5), 0 0 0 1px rgba(255,255,255,0.12) inset;
  }

  .save-btn:active:not(:disabled) { transform: translateY(0); }
  .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
    transform: translateX(-100%);
    animation: shine 2.5s ease-in-out infinite;
  }

  @keyframes shine {
    0% { transform: translateX(-100%); }
    40%, 100% { transform: translateX(100%); }
  }

  /* ===== TASK LIST ===== */
  .task-list { display: flex; flex-direction: column; gap: 10px; }

  .task-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 14px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
    animation: taskIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes taskIn {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .task-item::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, var(--accent), var(--accent2));
    border-radius: 3px 0 0 3px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .task-item:hover:not(.done) {
    border-color: rgba(124,109,250,0.3);
    background: rgba(22,22,42,0.95);
    transform: translateX(4px);
    box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  }

  .task-item:hover:not(.done)::before { opacity: 1; }

  .task-item.done {
    opacity: 0.5;
    background: rgba(109,250,204,0.04);
    border-color: rgba(109,250,204,0.15);
  }

  .task-item.done::before {
    opacity: 1;
    background: var(--green);
  }

  .checkbox-wrap {
    position: relative;
    width: 22px; height: 22px;
    flex-shrink: 0;
  }

  .checkbox-wrap input {
    position: absolute;
    opacity: 0;
    width: 100%; height: 100%;
    cursor: pointer;
    z-index: 2;
  }

  .custom-check {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(124,109,250,0.4);
    border-radius: 7px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }

  .task-item.done .custom-check {
    background: rgba(109,250,204,0.15);
    border-color: var(--green);
    box-shadow: 0 0 12px rgba(109,250,204,0.3);
    transform: scale(1.1);
  }

  .check-icon {
    opacity: 0;
    transform: scale(0) rotate(-15deg);
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    color: var(--green);
    font-size: 13px;
    font-weight: 700;
  }

  .task-item.done .check-icon {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  .task-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    flex: 1;
    transition: all 0.3s;
    letter-spacing: 0.01em;
  }

  .task-item.done .task-title {
    text-decoration: line-through;
    color: var(--muted);
  }

  .task-status {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    padding: 3px 8px;
    border-radius: 100px;
    font-weight: 500;
    letter-spacing: 0.06em;
    transition: all 0.3s;
  }

  .task-status.pending {
    background: rgba(124,109,250,0.1);
    color: rgba(124,109,250,0.8);
    border: 1px solid rgba(124,109,250,0.2);
  }

  .task-status.complete {
    background: rgba(109,250,204,0.1);
    color: var(--green);
    border: 1px solid rgba(109,250,204,0.25);
  }

  .task-ripple {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(124,109,250,0.15), transparent 70%);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s;
  }

  .task-item:active .task-ripple { opacity: 1; }

  /* ===== WAIT NOTICE ===== */
  .wait-notice {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(250,219,109,0.07);
    border: 1px solid rgba(250,219,109,0.2);
    border-radius: 12px;
    color: var(--yellow);
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.02em;
    animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }

  .wait-icon { font-size: 16px; animation: spin 3s linear infinite; }
  @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

  /* ===== PROGRESS ===== */
  .progress-wrap {
    margin-bottom: 24px;
    animation: fadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both;
  }

  .progress-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .progress-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .progress-count {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    color: var(--accent);
  }

  .progress-track {
    height: 4px;
    background: var(--surface2);
    border-radius: 100px;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .progress-fill {
    height: 100%;
    border-radius: 100px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow: 0 0 12px rgba(124,109,250,0.5);
  }

  /* ===== CONFIRM MODAL ===== */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(8,8,16,0.85);
    backdrop-filter: blur(12px);
    z-index: 50;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: overlayIn 0.3s ease both;
  }

  @keyframes overlayIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    width: 100%;
    max-width: 520px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 28px 28px 0 0;
    padding: 36px 32px 40px;
    box-shadow: 0 -32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
    animation: modalIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
  }

  @keyframes modalIn {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .modal-pill {
    width: 36px; height: 4px;
    background: rgba(255,255,255,0.15);
    border-radius: 100px;
    margin: 0 auto 28px;
  }

  .modal-icon {
    text-align: center;
    font-size: 40px;
    margin-bottom: 12px;
    animation: pop 0.5s 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  @keyframes pop {
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
  }

  .modal-title {
    text-align: center;
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 6px;
    letter-spacing: -0.01em;
  }

  .modal-sub {
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--muted);
    margin-bottom: 28px;
  }

  .modal-actions { display: flex; gap: 12px; }

  .btn-yes {
    flex: 1;
    padding: 15px;
    background: linear-gradient(135deg, #7c6dfa, #9d6dfa);
    border: none;
    border-radius: 14px;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 8px 24px rgba(124,109,250,0.4);
    position: relative;
    overflow: hidden;
  }

  .btn-yes::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
  }

  .btn-yes:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(124,109,250,0.55);
  }

  .btn-yes:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-no {
    flex: 1;
    padding: 15px;
    background: rgba(250,109,154,0.08);
    border: 1px solid rgba(250,109,154,0.25);
    border-radius: 14px;
    color: var(--accent2);
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-no:hover {
    background: rgba(250,109,154,0.15);
    border-color: rgba(250,109,154,0.4);
    transform: translateY(-2px);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .empty-state {
    text-align: center;
    padding: 32px 0;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  .spinner {
    display: inline-block;
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }

  .all-done {
    text-align: center;
    padding: 16px;
    animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  .all-done-text {
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(135deg, var(--green), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 4px;
  }

  .all-done-sub {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: var(--muted);
  }
`;

export default function TO_DO_LIST() {
  const [tasks, setTasks] = useState([]);
  const [newTasks, setNewTasks] = useState([""]);
  const [todoCreated, setTodoCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [waitMinutes, setWaitMinutes] = useState(null);

  const completedCount = tasks.filter(t => t.completed).length;
  const allDone = tasks.length > 0 && completedCount === tasks.length;

  useEffect(() => {
    fetchTodayTodo();
  }, []);

  const fetchTodayTodo = async () => {
    try {
      const res = await fetch(`${BASE_URL}/admin/todo/today`);
      const data = await res.json();
      if (data.status === "success") {
        setTasks(data.todo.tasks);
        setTodoCreated(true);
      }
    } catch (err) {
      console.error("Fetch todo failed");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const cleanTasks = newTasks.filter(t => t.trim());
      const res = await fetch(`${BASE_URL}/admin/todo/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: cleanTasks })
      });
      const data = await res.json();
      if (data.status === "todo_created") {
        await fetchTodayTodo();
        setNewTasks([""]);
        setTodoCreated(true);
      } else {
        alert("Today's to-do already created");
      }
    } catch {
      alert("Failed to save tasks");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const markTask = async (taskId) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/todo/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_id: taskId })
      });
      const data = await res.json();
      if (data.status === "task_marked") {
        fetchTodayTodo();
        setWaitMinutes(null);
      }
      if (data.status === "wait") {
        setWaitMinutes(data.remainingMinutes);
      }
    } catch {
      alert("Failed to mark task");
    }
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <>
      <style>{style}</style>
      <div className="todo-root">
        <div className="grid-bg" />

        <div className="card">
          <div className="card-glow" />

          {/* Header */}
          <div className="header">
            <div className="badge">
              <span className="badge-dot" />
              {todoCreated ? "Today's Board" : "New Board"}
            </div>
            <div className="title">Admin To-Do</div>
            <div className="subtitle">{today}</div>
          </div>

          <div className="divider" />

          {/* Progress Bar (when tasks exist) */}
          {todoCreated && tasks.length > 0 && (
            <div className="progress-wrap">
              <div className="progress-meta">
                <span className="progress-label">Progress</span>
                <span className="progress-count">{completedCount} / {tasks.length}</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* CREATE MODE */}
          {!todoCreated && (
            <>
              <div className="input-group">
                {newTasks.map((task, i) => (
                  <div className="input-row" key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className="task-num">#{String(i + 1).padStart(2, "0")}</span>
                    <input
                      className="task-input"
                      value={task}
                      onChange={e => {
                        const copy = [...newTasks];
                        copy[i] = e.target.value;
                        setNewTasks(copy);
                      }}
                      placeholder={`Describe task ${i + 1}…`}
                    />
                  </div>
                ))}
              </div>

              <button className="add-btn" onClick={() => setNewTasks([...newTasks, ""])}>
                ＋ Add another task
              </button>

              <button className="save-btn" onClick={() => setShowConfirm(true)}>
                <span className="btn-shine" />
                Save Today's Tasks
              </button>
            </>
          )}

          {/* TASK LIST */}
          {todoCreated && (
            <div className="task-list">
              {tasks.length === 0 && (
                <div className="empty-state">No tasks for today yet.</div>
              )}

              {tasks.map((task, i) => (
                <div
                  key={task._id}
                  className={`task-item ${task.completed ? "done" : ""}`}
                  onClick={() => !task.completed && !waitMinutes && markTask(task._id)}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="task-ripple" />
                  <div className="checkbox-wrap">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      disabled={task.completed || !!waitMinutes}
                      onChange={() => {}}
                    />
                    <div className="custom-check">
                      <span className="check-icon">✓</span>
                    </div>
                  </div>
                  <span className="task-title">{task.title}</span>
                  <span className={`task-status ${task.completed ? "complete" : "pending"}`}>
                    {task.completed ? "done" : "pending"}
                  </span>
                </div>
              ))}

              {waitMinutes && (
                <div className="wait-notice">
                  <span className="wait-icon">⏱</span>
                  Wait <strong style={{ color: "#fadb6d", margin: "0 4px" }}>{waitMinutes} min</strong> before next task
                </div>
              )}

              {allDone && (
                <div className="all-done">
                  <div className="all-done-text">🎉 All done!</div>
                  <div className="all-done-sub">You crushed today's tasks.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONFIRM MODAL */}
        {showConfirm && (
          <div className="overlay" onClick={() => setShowConfirm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-pill" />
              <div className="modal-icon">📋</div>
              <div className="modal-title">Lock in today's tasks?</div>
              <div className="modal-sub">This cannot be changed after saving.</div>
              <div className="modal-actions">
                <button className="btn-yes" onClick={handleSave} disabled={loading}>
                  {loading ? <><span className="spinner" />Saving…</> : "Yes, save it"}
                </button>
                <button className="btn-no" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}