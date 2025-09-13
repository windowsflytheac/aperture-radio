const PHOTON_APP_ID = "26389292-c85a-473e-8ed9-663b9bdad8b7"; // your live App ID

// ======================================
// Aperture Radio Live - Radio Logic Below
// ======================================

const player = document.getElementById('player');
const display = document.getElementById('frequency-display');
const tuner = document.getElementById('tuner');
const subtitle = document.getElementById('freq-subtitle');
const playBtn = document.getElementById('play-btn');

// Stations list
let stations = {
  852: { audio: 'assets/looping_radio_mix.wav', name: 'Self Esteem Fund' },
  999: { audio: 'assets/dr_kliner_emergency.wav', name: 'Dr. Kliner' }
};

let currentFreq = 852;

// Function to switch station
function setTuner(freq) {
  currentFreq = freq;
  if (stations[freq]) {
    player.src = stations[freq].audio;
    display.innerText = freq + (freq >= 1000 ? " FM" : " AM") + " - " + stations[freq].name;
    subtitle.innerText = stations[freq].name;
    player.play().catch(() => {}); // autoplay fallback
  } else {
    display.innerText = freq + " --- Offline";
    subtitle.innerText = "Nothing here";
    player.pause();
  }
}

// Slider event
tuner.addEventListener('input', () => setTuner(tuner.value));

// Play button for user interaction (autoplay fix)
playBtn.addEventListener('click', () => setTuner(currentFreq));

// Initialize
setTuner(currentFreq);
