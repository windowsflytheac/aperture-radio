const PHOTON_APP_ID = "26389292-c85a-473e-8ed9-663b9bdad8b7";

// ============================
// Aperture Radio Live - Main Radio
// ============================

const player = document.getElementById('player');
const display = document.getElementById('frequency-display');
const tuner = document.getElementById('tuner');
const playBtn = document.getElementById('play-btn');

let stations = {};
let currentFreq = 852;

// Initialize Photon (v4.4)
const photonClient = new Photon.LoadBalancing.LoadBalancingClient("us", PHOTON_APP_ID);
photonClient.connectToRegionMaster("us");

// Listen for admin events
photonClient.addEventListener("event", (code, content) => {
    if (code === 1) { // frequencyToggled
        const { frequency, offline, name } = content;
        if (stations[frequency]) {
            stations[frequency].offline = offline;
            stations[frequency].name = name || stations[frequency].name;
            if (currentFreq == frequency) setTuner(frequency);
        }
    }
});

// Load stations.xml
async function loadStations() {
    try {
        const res = await fetch("stations.xml");
        const xmlText = await res.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        xmlDoc.querySelectorAll("station").forEach(st => {
            const freq = st.getAttribute("frequency");
            const src = st.getAttribute("src");

            // Placeholder warning
            if (src === "UsedForFolder.WillBeDeleted") {
                console.warn("Placeholder file detected. Delete 'UsedForFolder.WillBeDeleted' to avoid errors.");
            }

            stations[freq] = {
                audio: src,
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

// Set tuner to a frequency
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

// Slider input
tuner.addEventListener('input', () => setTuner(tuner.value));

// Play button (for autoplay restriction)
playBtn.addEventListener('click', () => {
    setTuner(currentFreq);
    player.play().catch(() => {});
    playBtn.disabled = true;
});
