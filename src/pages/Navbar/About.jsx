export default function About() {
  return (
    <div className="max-w-4xl">
      {/* Title */}
      <h1 className="text-3xl font-extrabold tracking-tight">
        About DWJD
      </h1>

      {/* Intro */}
      <p className="mt-4 text-gray-600 leading-relaxed">
        DWJD (Don’t Waste, Just Donate) is a platform built to reduce food waste
        and connect surplus food with people who need it the most.
      </p>

      {/* Mission */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Our Mission</h2>
        <p className="mt-2 text-gray-600">
          Millions of meals are wasted every day while many go hungry.
          Our mission is to bridge this gap by enabling individuals and
          organizations to donate excess food easily and responsibly.
        </p>
      </div>

      {/* How it works */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">How DWJD Works</h2>
        <ul className="mt-3 space-y-2 text-gray-600 list-disc list-inside">
          <li>Users donate surplus food through the platform.</li>
          <li>Riders pick up the food from the donor location.</li>
          <li>The food is delivered to people or organizations in need.</li>
        </ul>
      </div>

      {/* Values */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Our Values</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold">Sustainability</h3>
            <p className="text-sm text-gray-600 mt-1">
              Reducing waste to protect our planet.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold">Community</h3>
            <p className="text-sm text-gray-600 mt-1">
              Supporting people through shared responsibility.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold">Impact</h3>
            <p className="text-sm text-gray-600 mt-1">
              Turning small actions into meaningful change.
            </p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-10 text-sm text-gray-500">
        Together, we can make a difference — one meal at a time.
      </p>
    </div>
  );
}
