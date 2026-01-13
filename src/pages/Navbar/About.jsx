export default function About() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      
      {/* ===== FULL BACKGROUND (DWJD THEME) ===== */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399"
          alt="Food donation background"
          className="w-full h-full object-cover"
        />

        {/* Dark + emerald overlay */}
        <div className="absolute inset-0 bg-gradient-to-br
                        from-emerald-900/70
                        via-black/70
                        to-black/85" />

        {/* Soft brand glows */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      {/* ===== CONTENT (INSIDE BORDERED GLASS) ===== */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 mt-0 animate-fadeUp">
        <div className="glass rounded-2xl p-10 border border-white/20 shadow-2xl">

          {/* TITLE */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              About DWJD
            </h1>

            <p className="text-gray-200 text-lg">
              Don’t Waste. Just Donate.
            </p>

            <p className="text-emerald-400 font-semibold text-xl mt-4">
              “Turning surplus into sustenance.”
            </p>
          </div>

          {/* INTRO */}
          <p className="mt-10 text-gray-300 leading-relaxed text-lg">
            DWJD (Don’t Waste, Just Donate) is a community-driven platform built to
            reduce food waste and connect surplus food with people who need it the most.
            We believe that hunger is not caused by lack of food, but by lack of sharing.
          </p>

          {/* MISSION */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            <p className="mt-3 text-gray-300 leading-relaxed">
              Millions of meals are wasted every day while many go hungry.
              Our mission is to bridge this gap by enabling individuals and
              organizations to donate excess food easily, responsibly, and with dignity.
            </p>
          </div>

          {/* HOW IT WORKS */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-white">How DWJD Works</h2>
            <ul className="mt-4 space-y-2 text-gray-300 list-disc list-inside">
              <li>Donors post surplus food through the platform.</li>
              <li>Riders pick up food from donor locations.</li>
              <li>Food is delivered to people or organizations in need.</li>
            </ul>
          </div>

          {/* VALUES */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white">Our Values</h2>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <ValueCard
                title="Sustainability"
                desc="Reducing waste to protect our planet for future generations."
              />
              <ValueCard
                title="Community"
                desc="Building a culture of shared responsibility and care."
              />
              <ValueCard
                title="Impact"
                desc="Turning small actions into meaningful change."
              />
            </div>
          </div>

          {/* FOOT NOTE */}
          <p className="mt-14 text-center text-sm text-gray-400 tracking-wide">
            Together, we can make a difference — one meal at a time.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== VALUE CARD ===== */

function ValueCard({ title, desc }) {
  return (
    <div
      className="glass rounded-xl p-6 border border-white/20
                 hover:border-emerald-400/40 transition
                 hover:-translate-y-1"
    >
      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-300">
        {desc}
      </p>
    </div>
  );
}
