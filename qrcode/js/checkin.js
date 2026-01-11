// js/checkin.js

// Copie des données locations (partagée avec index.js)
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

const checkins = [];

function getPlek() {
  const params = new URLSearchParams(window.location.search);
  return params.get("plek") || "Onbekende plek";
}

function getLocationData() {
  const plekId = getPlek();
  return locations.find((loc) => loc.id === plekId) || null;
}

function initializeLocationDisplay() {
  const plek = getPlek();
  const location = getLocationData();
  const locationInfo = document.getElementById("locationInfo");

  if (locationInfo && location) {
    locationInfo.textContent = `Je checkt nu in op: ${location.name}`;
  }

  // Afficher les détails de localisation
  displayLocationDetails(location);
}

function displayLocationDetails(location) {
  if (!location) {
    console.warn("Localisation non trouvée");
    return;
  }

  const capacityValue = document.getElementById("capacityValue");
  const currentValue = document.getElementById("currentValue");
  const prisesValue = document.getElementById("prisesValue");
  const screensValue = document.getElementById("screensValue");
  const amenitiesValue = document.getElementById("amenitiesValue");

  if (capacityValue) capacityValue.textContent = location.capacity;
  if (currentValue) currentValue.textContent = location.current;
  if (prisesValue) prisesValue.textContent = location.prises;
  if (screensValue) screensValue.textContent = location.ecrans;
  if (amenitiesValue) {
    amenitiesValue.textContent = location.amenities.join(", ");
  }
}

function showMessage(text, type) {
  const container = document.getElementById("messageContainer");
  if (!container) return;

  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;

  container.innerHTML = "";
  container.appendChild(message);

  setTimeout(() => {
    message.remove();
  }, 5000);
}

function updateCheckinsList() {
  const list = document.getElementById("checkinsList");
  if (!list) return;

  if (checkins.length === 0) {
    list.innerHTML = '<div class="empty-state">Nog geen check-ins</div>';
    return;
  }

  const html = checkins
    .slice()
    .reverse()
    .map((c) => {
      const time = new Date(c.time).toLocaleString("nl-NL");
      return `
        <div class="checkin-item">
          <div class="checkin-item-row">
            <span class="checkin-label">Tijd:</span>
            <span class="checkin-value">${time}</span>
          </div>
          <div class="checkin-item-row">
            <span class="checkin-label">Plek:</span>
            <span class="checkin-value">${c.plekId}</span>
          </div>
          <div class="checkin-item-row">
            <span class="checkin-label">Naam:</span>
            <span class="checkin-value">${c.naam}</span>
          </div>
          <div class="checkin-item-row">
            <span class="checkin-label">E-mail:</span>
            <span class="checkin-value">${c.email}</span>
          </div>
        </div>
      `;
    })
    .join("");

  list.innerHTML = html;
}

function handleFormSubmit(event) {
  event.preventDefault();

  const naamInput = document.getElementById("naam");
  const emailInput = document.getElementById("email");

  if (!naamInput || !emailInput) return;

  const naam = naamInput.value.trim();
  const email = emailInput.value.trim();
  const plek = getPlek();
  const location = getLocationData();

  if (!naam || !email) {
    showMessage("Vul alle velden in.", "error");
    return;
  }

  try {
    // Incrémenter le nombre de personnes actuelles
    if (location) {
      location.current += 1;
    }

    const checkinData = {
      plekId: plek,
      naam,
      email,
      time: new Date().toISOString(),
    };

    checkins.push(checkinData);

    console.log("Check-ins:", checkins);
    console.log("Dernière localisation:", location);

    showMessage("Je bent succesvol ingecheckt ✅", "success");

    // Mettre à jour l'affichage de la capacité
    if (location) {
      const currentValue = document.getElementById("currentValue");
      if (currentValue) currentValue.textContent = location.current;
    }

    // Masquer le formulaire et afficher le bouton "Quitter"
    const form = document.getElementById("checkinForm");
    const exitContainer = document.getElementById("exitButtonContainer");
    if (form) form.style.display = "none";
    if (exitContainer) exitContainer.style.display = "block";

    naamInput.value = "";
    emailInput.value = "";

    updateCheckinsList();
  } catch (error) {
    console.error("Erreur lors du check-in:", error);
    showMessage(
      "Er ging iets mis bij het inchecken. Probeer opnieuw.",
      "error"
    );
  }
}

function handleExit() {
  // Décrémenter le nombre de personnes
  const location = getLocationData();
  if (location && location.current > 0) {
    location.current -= 1;
  }

  // Mettre à jour l'affichage
  const currentValue = document.getElementById("currentValue");
  if (currentValue && location) {
    currentValue.textContent = location.current;
  }

  // Afficher le formulaire et masquer le bouton "Quitter"
  const form = document.getElementById("checkinForm");
  const exitContainer = document.getElementById("exitButtonContainer");
  if (form) form.style.display = "flex";
  if (exitContainer) exitContainer.style.display = "none";

  // Réinitialiser les champs
  const naamInput = document.getElementById("naam");
  const emailInput = document.getElementById("email");
  if (naamInput) naamInput.value = "";
  if (emailInput) emailInput.value = "";

  // Afficher message de déconnexion
  showMessage("Je bent succesvol uitgelogd. Tot ziens! 👋", "success");
}

function init() {
  initializeLocationDisplay();
  updateCheckinsList();

  const form = document.getElementById("checkinForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  const exitBtn = document.getElementById("exitBtn");
  if (exitBtn) {
    exitBtn.addEventListener("click", handleExit);
  }
}

document.addEventListener("DOMContentLoaded", init);
