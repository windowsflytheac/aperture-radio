const PHOTON_APP_ID = "26389292-c85a-473e-8ed9-663b9bdad8b7"; // your live App ID

// ======================================
// Aperture Radio Live - Radio Logic Below
// ======================================

const player = document.getElementById('player');
const display = document.getElementById('frequency-display');
const tuner = document.getElementById('tuner');
const shutdownBtn = document.getElementById('shutdown-btn');

let stations = {};
let currentFreq = 852;

// Initialize Photon (future-proofing sync)
const photonClient = new Photon.Client();
photonClient.connect({ appId: PHOTON_APP_ID, region: "us" })
  .then(() => console.log("Photon connected!"))
  .catch(err => console.error("Photon connection failed:", err));

// Listen for frequency toggle events
photonClient.onEvent("frequencyToggled", data => {
  const freq = data.frequency;
  const offline = data.offline;
  if (stations[freq]) {
    stations[freq].offline = offline;
    if (currentFreq == freq) setTuner(freq);
  }
});

// Load stations.xml
async function loadStations() {
  try {
    const res = await fetch("stations.xml");
    const xml = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");

    doc.querySelectorAll("station").forEach(st => {
      const freq = st.getAttribute("frequency");
      stations[freq] = {
        audio: st.getAttribute("src"),
        name: st.getAttribute("name"),
        loop: st.getAttribute("loop") === "true",
        offline: false
      };
    });

    console.log("Stations loaded:", stations);
    setTuner(currentFreq); // Start at default freq
  } catch (err) {
    console.error("Failed to load stations.xml:", err);
  }
}
loadStations();

// Switch station
function setTuner(freq) {
  currentFreq = freq;
  if (stations[freq] && !stations[freq].offline) {
    display.innerText = freq + (freq >= 1000 ? " FM" : " AM") + " - " + stations[freq].name;
    player.src = stations[freq].audio;
    player.loop = stations[freq].loop;
    player.play();
  } else {
    display.innerText = freq + " --- Offline";
    player.src = "assets/static.mp3"; // fallback noise
    player.loop = true;
    player.play();
  }
}

// Tuner slider event
tuner.addEventListener('input', () => setTuner(tuner.value));

// Admin shutdown toggle
shutdownBtn.addEventListener('click', () => {
  if (stations[currentFreq]) {
    stations[currentFreq].offline = !stations[currentFreq].offline;

    // Notify all clients via Photon
    photonClient.sendEvent("frequencyToggled", {
      frequency: currentFreq,
      offline: stations[currentFreq].offline
    });

    setTuner(currentFreq);
  }
});
