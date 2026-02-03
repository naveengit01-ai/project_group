import { useEffect, useState } from "react";

/* ================= DISTANCE CALCULATION ================= */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function NearbyOrphanages() {
  const [places, setPlaces] = useState([]);
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
      pos => {
        fetchNearbyPlaces(
          pos.coords.latitude,
          pos.coords.longitude
        );
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      }
    );
  }, []);

  /* ================= FETCH FROM OPENSTREETMAP ================= */
  const fetchNearbyPlaces = async (lat, lng) => {
    try {
      const query = `
[out:json][timeout:25];
(
  node(around:30000,${lat},${lng})["social_facility"];
  way(around:30000,${lat},${lng})["social_facility"];
  relation(around:30000,${lat},${lng})["social_facility"];

  node(around:30000,${lat},${lng})["amenity"="school"];
  way(around:30000,${lat},${lng})["amenity"="school"];

  node(around:30000,${lat},${lng})["amenity"="community_centre"];
  way(around:30000,${lat},${lng})["amenity"="community_centre"];
);
out center tags;
      `;

      const res = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: query,
        }
      );

      const data = await res.json();

      const formatted = data.elements
        .map((p, i) => {
          const latVal = p.lat || p.center?.lat;
          const lonVal = p.lon || p.center?.lon;
          if (!latVal || !lonVal) return null;

          return {
            id: i,
            name: p.tags?.name || "Social Care Facility",
            address:
              p.tags?.["addr:city"] ||
              p.tags?.["addr:district"] ||
              p.tags?.["addr:state"] ||
              "Address not available",
            distance: getDistance(lat, lng, latVal, lonVal).toFixed(1),
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

      setPlaces(formatted);
    } catch (err) {
      setError("Failed to load nearby facilities");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h2 className="text-3xl font-bold text-center mb-2">
        Nearby Orphanages & Care Homes
      </h2>
      <p className="text-center text-gray-400 mb-8">
        Based on your current location (30 km radius)
      </p>

      {loading && (
        <p className="text-center text-gray-400">
          Finding nearby facilities...
        </p>
      )}

      {error && (
        <p className="text-center text-red-400">
          {error}
        </p>
      )}

      {!loading && !error && places.length === 0 && (
        <p className="text-center text-gray-400">
          No public data available in this area
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {places.map(place => (
          <div
            key={place.id}
            className="bg-white/10 backdrop-blur-xl border border-white/20
                       rounded-2xl p-5 shadow-xl hover:scale-[1.02] transition"
          >
            <h3 className="text-xl font-semibold text-emerald-400">
              {place.name}
            </h3>

            <p className="text-sm text-gray-300 mt-1">
              {place.address}
            </p>

            <p className="mt-3 text-cyan-400 font-medium">
              📍 {place.distance} km away
            </p>

            <button
              disabled
              className="mt-4 w-full py-2 rounded-lg
                         bg-emerald-500/20 text-emerald-300
                         cursor-not-allowed"
            >
              Public Data · Demo Mode
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
