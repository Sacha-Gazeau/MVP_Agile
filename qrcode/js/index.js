// js/index.js

const locations = [
  {
    id: "LokaalB-201",
    name: "Lokaal B-201",
    capacity: 20,
    current: 12,
    prises: 8,
    ecrans: 2,
    amenities: ["WiFi", "Stilteplek", "Whiteboard"],
  },
  {
    id: "LokaalB-202",
    name: "Lokaal B-202",
    capacity: 18,
    current: 5,
    prises: 6,
    ecrans: 1,
    amenities: ["WiFi", "Projecteur", "Audioregie"],
  },
  {
    id: "Bibliotheek",
    name: "Bibliotheek",
    capacity: 40,
    current: 27,
    prises: 12,
    ecrans: 3,
    amenities: ["WiFi", "Stilteplek", "Boekenkasten", "Leeszalen"],
  },
  {
    id: "Cafetaria",
    name: "Cafetaria",
    capacity: 60,
    current: 34,
    prises: 10,
    ecrans: 2,
    amenities: ["WiFi", "Koffie/Thee", "Zitplaatsen", "Lawaai ok"],
  },
];

function getSelectedFilters() {
  const checkboxes = document.querySelectorAll(".filter-checkbox:checked");
  return Array.from(checkboxes).map((cb) => cb.value);
}

function getSearchQuery() {
  const input = document.getElementById("searchInput");
  return input ? input.value.toLowerCase().trim() : "";
}

function filterLocations() {
  const searchQuery = getSearchQuery();
  const selectedAmenities = getSelectedFilters();

  return locations.filter((loc) => {
    // Filtre par recherche (nom)
    const matchesSearch =
      searchQuery === "" || loc.name.toLowerCase().includes(searchQuery);

    // Filtre par amenities
    const matchesAmenities =
      selectedAmenities.length === 0 ||
      selectedAmenities.some((amenity) => loc.amenities.includes(amenity));

    return matchesSearch && matchesAmenities;
  });
}

function renderLocations() {
  const container = document.getElementById("locationsList");
  const noResults = document.getElementById("noResults");
  if (!container) return;

  const filteredLocations = filterLocations();

  container.innerHTML = "";

  if (filteredLocations.length === 0) {
    if (noResults) noResults.style.display = "block";
    return;
  }

  if (noResults) noResults.style.display = "none";

  filteredLocations.forEach((loc) => {
    const a = document.createElement("a");
    a.className = "location-card";
    a.href = `qr-checkin.html?plek=${encodeURIComponent(loc.id)}`;

    a.innerHTML = `
      <div class="loc-name">${loc.name}</div>
      <div class="loc-desc">
        Capaciteit: ${loc.capacity} personen · Momenteel: ${loc.current} binnen
      </div>
    `;

    container.appendChild(a);
  });
}

function setupFilters() {
  const searchInput = document.getElementById("searchInput");
  const checkboxes = document.querySelectorAll(".filter-checkbox");

  if (searchInput) {
    searchInput.addEventListener("input", renderLocations);
  }

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", renderLocations);
  });
}

function init() {
  renderLocations();
  setupFilters();
}

document.addEventListener("DOMContentLoaded", init);
