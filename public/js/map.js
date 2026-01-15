const mapContainer = document.getElementById("map");

if (mapContainer) {
  const lat = mapContainer.dataset.lat;
  const lon = mapContainer.dataset.lon;
  const MAP_TOKEN = mapContainer.dataset.maptilerKey;

  if (!lat || !lon) {
    console.warn("Coordinates missing");
  } else {
    const map = L.map("map").setView([lat, lon], 13);

    L.tileLayer(
      `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAP_TOKEN}`,
      {
        attribution: "© MapTiler © OpenStreetMap contributors",
      }
    ).addTo(map);

    L.marker([lat, lon]).addTo(map).bindPopup("Listing location").openPopup();
  }
}
