export default function Contact() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      
      {/* ===== FULL SCREEN BACKGROUND (FIXED) ===== */}
      <div className="fixed inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
          alt="DWJD background"
          className="w-full h-full object-cover"
        />

        {/* SAME OVERLAY YOU ALREADY LIKED */}
        <div className="absolute inset-0 bg-gradient-to-br
                        from-emerald-900/70
                        via-black/70
                        to-black/80" />

        {/* SAME GLOW ACCENTS */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      {/* ===== CONTENT (UNCHANGED) ===== */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 animate-fadeUp">
        <div className="glass rounded-2xl p-10 border border-white/20 shadow-2xl mt-2">
          
          {/* HEADER */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Contact DWJD
            </h1>

            <p className="text-gray-200 text-lg">
              Don’t Waste. Just Donate.
            </p>

            <p className="text-emerald-400 font-semibold text-xl mt-4">
              “Real change begins with a simple conversation.”
            </p>
          </div>

          {/* DIVIDER */}
          <div className="my-10 h-px bg-white/20" />

          {/* CONTACT INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 text-center">
            <ContactItem
              label="Email"
              value="kolanaveen797@"
              sub="Support, queries & partnerships"
            />

            <ContactItem
              label="Phone"
              value="+91 90000 00000"
              sub="Mon–Sat • 10 AM – 6 PM"
            />

            <ContactItem
              label="Location"
              value="India,Ongole"
              sub="Serving communities nationwide"
            />
          </div>

          {/* FOOTER */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-300 tracking-wide">
              DWJD • A community-driven food donation initiative
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== CONTACT ITEM ===== */

function ContactItem({ label, value, sub }) {
  return (
    <div
      className="glass rounded-xl p-6 border border-white/20
                 hover:border-emerald-400/40 transition
                 hover:-translate-y-1"
    >
      <p className="text-sm uppercase tracking-widest text-gray-300">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-gray-400">
        {sub}
      </p>
    </div>
  );
}
