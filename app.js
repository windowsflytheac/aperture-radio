const PHOTON_APP_ID = "26389292-c85a-473e-8ed9-663b9bdad8b7";

const player = document.getElementById('player');
const display = document.getElementById('frequency-display');
const tuner = document.getElementById('tuner');
const playBtn = document.getElementById('play-btn');

let stations = {};
let currentFreq = 852;

// Initialize Photon
const photonClient = new Photon.Client();
photonClient.connect({ appId: PHOTON_APP_ID, region: "us" })
  .then(() => console.log("Photon connected!"))
  .catch(err => console.error("Photon connection failed:", err));

// Handle admin events
photonClient.onEvent("frequencyToggled", data => {
  const freq = data.frequency;
  const offline = data.offline;
  const title = data.name || stations[freq]?.name;
  if (stations[freq]) {
    stations[freq].offline = offline;
    stations[freq].name = title;
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

    setTuner(currentFreq);
  } catch (err) {
    console.error("Failed to load stations.xml:", err);
  }
}
loadStations();

// Switch station
function setTuner(freq) {
  currentFreq = freq;
  const st = stations[freq];

  if (st && !st.offline) {
    display.innerText = `${freq} FM - ${st.name}`;
    player.src = st.audio;
    player.loop = st.loop;
    player.play().catch(() => {});
  } else {
    display.innerText = `${freq} --- Offline`;
    player.src = "assets/static.mp3";
    player.loop = true;
    player.play().catch(() => {});
  }
}

// Tuner slider
tuner.addEventListener('input', () => setTuner(tuner.value));

// Play button (autoplay fix)
playBtn.addEventListener('click', () => {
  setTuner(currentFreq);
  player.play().catch(() => {});
  playBtn.disabled = true;
});
