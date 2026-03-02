import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const BASE_URL = "https://back-end-project-group.onrender.com";

export default function Edit() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const email = storedUser?.email;

  const [form, setForm]       = useState({ first_name:"", last_name:"", phone:"" });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (!email) navigate("/login"); }, [email, navigate]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res  = await fetch(`${BASE_URL}/get-user-by-email`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.status === "success") {
          setForm({ first_name: data.user.first_name||"", last_name: data.user.last_name||"", phone: data.user.phone||"" });
        } else setError(data.status);
      } catch { setError("Failed to load profile"); }
      finally  { setLoading(false); }
    }
    if (email) fetchUser();
  }, [email]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = async e => {
    e.preventDefault();
    setUpdating(true); setError("");
    try {
      const res  = await fetch(`${BASE_URL}/update-profile`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email, ...form })
      });
      const data = await res.json();
      if (data.status === "updated_successfully") {
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...data.user }));
        setSuccess(true);
        setTimeout(() => navigate("/afterlogin/profile"), 1600);
      } else setError(data.status);
    } catch { setError("Update failed"); }
    finally  { setUpdating(false); }
  };

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="ed-loading">
        <div className="ed-load-ring"><div className="ed-orbit"/><span className="ed-load-emoji">✏️</span></div>
        <motion.p className="ed-load-text" animate={{opacity:[0.4,1,0.4]}} transition={{duration:1.8,repeat:Infinity}}>
          Loading your profile...
        </motion.p>
        <div className="ed-orb ed-orb1"/><div className="ed-orb ed-orb2"/>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="ed-root">
        <div className="ed-orb ed-orb1"/><div className="ed-orb ed-orb2"/>
        <div className="ed-grid"/>

        <div className="ed-wrap">
          <motion.div className="ed-card"
            initial={{opacity:0,y:32}} animate={{opacity:1,y:0}}
            transition={{duration:0.5,ease:[0.22,1,0.36,1]}}>

            {/* TOP STRIP */}
            <div className="ed-strip"/>

            {/* HEADER */}
            <div className="ed-header">
              <div className="ed-avatar">✏️</div>
              <h1 className="ed-title">Edit Profile</h1>
              <p className="ed-subtitle">Keep your details up to date 💚</p>
            </div>

            {/* SUCCESS */}
            <AnimatePresence>
              {success && (
                <motion.div className="ed-success"
                  initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
                  exit={{opacity:0}}>
                  <span className="ed-success-icon">✅</span>
                  <span>Profile updated!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ERROR */}
            <AnimatePresence>
              {error && (
                <motion.div className="ed-error"
                  initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                  exit={{opacity:0}}>
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORM */}
            <form className="ed-form" onSubmit={handleUpdate}>

              <div className="ed-row">
                <div className="ed-field">
                  <label className="ed-label">First Name <span className="ed-req">*</span></label>
                  <input className="ed-input" name="first_name"
                    value={form.first_name} onChange={handleChange}
                    placeholder="John" />
                </div>
                <div className="ed-field">
                  <label className="ed-label">Last Name <span className="ed-req">*</span></label>
                  <input className="ed-input" name="last_name"
                    value={form.last_name} onChange={handleChange}
                    placeholder="Doe" />
                </div>
              </div>

              <div className="ed-field">
                <label className="ed-label">Phone <span className="ed-req">*</span></label>
                <input className="ed-input" name="phone"
                  value={form.phone} onChange={handleChange}
                  placeholder="+91 9999..." />
              </div>

              <div className="ed-field">
                <label className="ed-label">Email <span className="ed-disabled-tag">cannot be changed</span></label>
                <input className="ed-input ed-input-disabled"
                  value={email||""} disabled />
              </div>

              <motion.button type="submit" className="ed-submit"
                disabled={updating || success}
                whileHover={!updating && !success ? {scale:1.02} : {}}
                whileTap={!updating && !success ? {scale:0.97} : {}}>
                {updating ? (
                  <span className="ed-btn-loading">
                    <span className="ed-btn-spinner"/>
                    Updating...
                  </span>
                ) : success ? "✅ Done!" : "Save Changes →"}
              </motion.button>

              <button type="button" className="ed-cancel"
                onClick={() => navigate("/afterlogin/profile")}>
                ← Back to Profile
              </button>
            </form>

          </motion.div>
        </div>
      </div>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400&display=swap');

  .ed-root {
    min-height:100vh; background:#07080f; color:#eeeaf4;
    font-family:'Syne',sans-serif;
    display:flex; align-items:center; justify-content:center;
    padding:40px 16px; position:relative; overflow:hidden;
  }

  .ed-loading {
    min-height:100vh; background:#07080f;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:16px; position:relative; overflow:hidden;
    font-family:'Syne',sans-serif;
  }

  .ed-load-ring {
    width:72px; height:72px; position:relative;
    display:flex; align-items:center; justify-content:center;
  }
  .ed-orbit {
    position:absolute; inset:0; border-radius:50%;
    border:2px solid transparent;
    border-top-color:#34d399; border-right-color:rgba(52,211,153,0.3);
    animation:edSpin 1s linear infinite;
  }
  @keyframes edSpin{to{transform:rotate(360deg)}}
  .ed-load-emoji{font-size:26px; animation:edFloat 2s ease-in-out infinite;}
  @keyframes edFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .ed-load-text{font-family:'DM Mono',monospace;font-size:13px;color:#34d399;letter-spacing:0.06em;}

  .ed-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;}
  .ed-orb1{width:500px;height:500px;top:-120px;left:-150px;background:rgba(52,211,153,0.06);}
  .ed-orb2{width:400px;height:400px;bottom:-80px;right:-100px;background:rgba(99,102,241,0.05);}

  .ed-grid{
    position:fixed;inset:0;
    background-image:linear-gradient(rgba(52,211,153,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(52,211,153,0.025) 1px,transparent 1px);
    background-size:56px 56px;pointer-events:none;z-index:0;
  }

  .ed-wrap{position:relative;z-index:1;width:100%;max-width:460px;}

  /* CARD */
  .ed-card{
    background:rgba(255,255,255,0.03);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:24px; overflow:hidden;
    box-shadow:0 32px 64px rgba(0,0,0,0.5);
    padding:0 0 28px;
  }

  .ed-strip{
    height:4px;
    background:linear-gradient(90deg,#34d399,#10b981,#818cf8);
  }

  /* HEADER */
  .ed-header{
    text-align:center;
    padding:32px 24px 20px;
    display:flex; flex-direction:column; align-items:center; gap:8px;
  }

  .ed-avatar{
    width:64px;height:64px;
    background:rgba(52,211,153,0.1);
    border:1px solid rgba(52,211,153,0.2);
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:26px;
    margin-bottom:4px;
  }

  .ed-title{font-size:22px;font-weight:800;color:#eeeaf4;letter-spacing:-0.02em;}
  .ed-subtitle{font-family:'DM Mono',monospace;font-size:11px;color:rgba(238,234,244,0.35);letter-spacing:0.06em;}

  /* SUCCESS / ERROR */
  .ed-success{
    margin:0 24px 8px;
    display:flex;align-items:center;gap:10px;
    background:rgba(52,211,153,0.08);
    border:1px solid rgba(52,211,153,0.2);
    border-radius:12px;padding:12px 16px;
    font-size:13px;color:#34d399;font-weight:600;
  }
  .ed-success-icon{font-size:18px;}

  .ed-error{
    margin:0 24px 8px;
    background:rgba(248,113,113,0.08);
    border:1px solid rgba(248,113,113,0.2);
    border-radius:12px;padding:12px 16px;
    font-size:12px;color:#fca5a5;
    font-family:'DM Mono',monospace;
  }

  /* FORM */
  .ed-form{
    display:flex;flex-direction:column;gap:12px;
    padding:0 24px;
  }

  .ed-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}

  .ed-field{display:flex;flex-direction:column;gap:5px;}

  .ed-label{
    font-family:'DM Mono',monospace;
    font-size:10px;color:rgba(238,234,244,0.4);
    letter-spacing:0.08em;text-transform:uppercase;
  }
  .ed-req{color:#f87171;margin-left:2px;}
  .ed-disabled-tag{
    color:rgba(238,234,244,0.2);font-size:9px;
    letter-spacing:0.06em;margin-left:6px;
  }

  .ed-input{
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.08);
    border-radius:12px;
    padding:12px 14px;
    color:#eeeaf4;
    font-family:'Syne',sans-serif;font-size:13px;
    outline:none;transition:all 0.2s;width:100%;
  }
  .ed-input::placeholder{color:rgba(238,234,244,0.2);}
  .ed-input:focus{
    border-color:rgba(52,211,153,0.4);
    background:rgba(52,211,153,0.04);
    box-shadow:0 0 0 3px rgba(52,211,153,0.08);
  }
  .ed-input-disabled{
    opacity:0.4;cursor:not-allowed;
    background:rgba(255,255,255,0.02);
  }
  .ed-input-disabled:focus{border-color:rgba(255,255,255,0.08);box-shadow:none;background:rgba(255,255,255,0.02);}

  /* BUTTONS */
  .ed-submit{
    margin-top:8px;padding:14px;
    background:linear-gradient(135deg,#34d399,#10b981);
    border:none;border-radius:14px;
    color:#07080f;
    font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
    cursor:pointer;
    box-shadow:0 8px 24px rgba(52,211,153,0.3);
    position:relative;overflow:hidden;
    transition:opacity 0.2s;
  }
  .ed-submit::before{
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 60%);
    pointer-events:none;
  }
  .ed-submit:disabled{opacity:0.6;cursor:not-allowed;}

  .ed-btn-loading{display:flex;align-items:center;justify-content:center;gap:8px;}
  .ed-btn-spinner{
    width:14px;height:14px;
    border:2px solid rgba(7,8,15,0.3);
    border-top-color:#07080f;
    border-radius:50%;
    animation:edSpin 0.7s linear infinite;
    flex-shrink:0;
  }

  .ed-cancel{
    padding:13px;
    background:transparent;
    border:1px solid rgba(255,255,255,0.08);
    border-radius:14px;
    color:rgba(238,234,244,0.4);
    font-family:'Syne',sans-serif;font-size:13px;
    cursor:pointer;transition:all 0.2s;
  }
  .ed-cancel:hover{border-color:rgba(255,255,255,0.2);color:#eeeaf4;}

  @media(max-width:480px){
    .ed-row{grid-template-columns:1fr;}
    .ed-card{border-radius:20px;}
  }
`;