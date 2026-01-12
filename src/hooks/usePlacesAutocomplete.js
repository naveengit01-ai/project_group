import { useEffect, useRef } from "react";

export default function usePlacesAutocomplete(setValue) {
  const ref = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(ref.current, {
      types: ["geocode"]
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      setValue(place.formatted_address || "");
    });
  }, [setValue]);

  return ref;
}
