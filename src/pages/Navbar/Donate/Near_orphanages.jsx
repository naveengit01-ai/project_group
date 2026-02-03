import { useEffect, useState } from "react";

/* ================= MOCK ORPHANAGE DATA ================= */
/* (Static data – NOT from DB) */
const orphanages = [
  {
    id: 1,
    name: "Hope Children Home",
    lat: 17.385,
    lng: 78.4867,
    address: "Hyderabad",
  },
  {
    id: 2,
    name: "Sunrise Orphanage",
    lat: 17.441,
    lng: 78.391,
    address: "Secunderabad",
  },
  {
    id: 3,
    name: "Little Angels Home",
    lat: 17.295,
    lng: 78.402,
    address: "Shamshabad",
  },
  {
    id: 4,
    name: "Care & Share Home",
    lat: 17.42,
    lng: 78.55,
    address: "Uppal",
  },
];

/* ================= DISTANCE CALCULATION (KM) ================= */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NearbyOrphanages() {
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHomes, setNearbyHomes] = useState([]);

  /* ================= DEMO USER LOCATION ================= */
  /* Forced location near Hyderabad for demo */
  useEffect(() => {
    setUserLocation({
      lat: 17.385,    // Hyderabad
      lng: 78.4867,
    });
  }, []);

  /* ================= FILTER WITHIN 30 KM ================= */
  useEffect(() => {
    if (!userLocation) return;

    const filtered = orphanages
      .map(home => {
        const distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          home.lat,
          home.lng
        );

        return {
          ...home,
          distance: distance.toFixed(1),
        };
      })
      .filter(home => home.distance <= 30);

    setNearbyHomes(filtered);
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h2 className="text-3xl font-bold text-center mb-2">
        Nearby Orphanages
      </h2>
      <p className="text-center text-gray-400 mb-8">
        Showing orphanages within 30 km radius
      </p>

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {nearbyHomes.map(home => (
          <div
            key={home.id}
            className="bg-white/10 backdrop-blur-xl border border-white/20
                       rounded-2xl p-5 shadow-xl hover:scale-[1.02] transition"
          >
            <h3 className="text-xl font-semibold text-emerald-400">
              {home.name}
            </h3>

            <p className="text-sm text-gray-300 mt-1">
              {home.address}
            </p>

            <p className="mt-3 text-cyan-400 font-medium">
              📍 {home.distance} km away
            </p>

            <button
              disabled
              className="mt-4 w-full py-2 rounded-lg
                         bg-emerald-500/20 text-emerald-300
                         cursor-not-allowed"
            >
              Request Pickup (Coming Soon)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
