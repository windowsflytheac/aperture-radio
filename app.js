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

// Initialize Photon
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

// Load XML
fetch('stations.xml')
  .then(res => res.text())
  .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
  .then(data => {
    const stationNodes = data.querySelectorAll('station');
    stationNodes.forEach(station => {
      const freq = station.querySelector('frequency').textContent;
      const audio = station.querySelector('audio').textContent;
      const name = station.querySelector('name').textContent;
      const offline = station.querySelector('offline').textContent === 'true';
      stations[freq] = { audio, name, offline };
    });
    setTuner(currentFreq);
  });

// Switch station function
function setTuner(freq) {
  currentFreq = freq;
  if (stations[freq] && !stations[freq].offline) {
    display.innerText = freq + (freq >= 1000 ? " FM" : " AM") + " - " + stations[freq].name;
    player.src = stations[freq].audio;
    player.play();
  } else {
    display.innerText = freq + " --- Offline";
    player.src = "static.mp3";
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
