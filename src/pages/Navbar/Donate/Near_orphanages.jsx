import { useEffect, useState } from "react";

/* ================= DISTANCE FUNCTION ================= */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function NearbyOrphanages() {
  const [orphanages, setOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= GET USER LOCATION ================= */
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        fetchNearbyOrphanages(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      }
    );
  }, []);

  /* ================= FETCH FROM OPENSTREETMAP ================= */
  const fetchNearbyOrphanages = async (lat, lng) => {
    try {
      const query = `
        [out:json];
        (
          node["amenity"="orphanage"](around:30000,${lat},${lng});
          node["social_facility"="orphanage"](around:30000,${lat},${lng});
          node["social_facility"="childcare"](around:30000,${lat},${lng});
        );
        out body;
      `;

      const res = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: query,
        }
      );

      const data = await res.json();

      const formatted = data.elements.map((place, index) => ({
        id: index,
        name: place.tags?.name || "Unnamed Orphanage",
        lat: place.lat,
        lng: place.lon,
        address:
          place.tags?.["addr:city"] ||
          place.tags?.["addr:district"] ||
          "Address not available",
        distance: getDistance(lat, lng, place.lat, place.lon).toFixed(1),
      }));

      setOrphanages(formatted);
    } catch {
      setError("Failed to load orphanages");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h2 className="text-3xl font-bold text-center mb-2">
        Nearby Orphanages
      </h2>
      <p className="text-center text-gray-400 mb-8">
        Showing orphanages within 30 km of your location
      </p>

      {loading && (
        <p className="text-center text-gray-400">
          Fetching nearby orphanages...
        </p>
      )}

      {error && (
        <p className="text-center text-red-400">{error}</p>
      )}

      {!loading && orphanages.length === 0 && (
        <p className="text-center text-gray-400">
          No orphanages found nearby
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {orphanages.map(home => (
          <div
            key={home.id}
            className="bg-white/10 backdrop-blur-xl border border-white/20
                       rounded-2xl p-5 shadow-xl"
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
              Public Data • Demo Mode
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
