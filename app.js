document.addEventListener('DOMContentLoaded', () => {

  // Photon App ID ready for future use
  const PHOTON_APP_ID = "26389292-c85a-473e-8ed9-663b9bdad8b7"; // your live App ID

  const player = document.getElementById('player');
  const display = document.getElementById('frequency-display');
  const tuner = document.getElementById('tuner');
  const subtitle = document.getElementById('freq-subtitle');
  const playBtn = document.getElementById('play-btn');
  const buttons = document.querySelectorAll('#buttons button');

  // Stations list
let stations = {
  852: { audio: 'assets/looping_radio_mix.wav', name: 'Portal Radio', loop: true },
  999: { audio: 'assets/dr_kleiner_emergency.wav', name: 'Dr. Kleiner Emergency Speech', loop: false }
};

  let currentFreq = 852;

  // Function to switch station
  function setTuner(freq) {
    currentFreq = parseInt(freq);
    tuner.value = currentFreq; // sync slider
    if (stations[currentFreq]) {
      player.src = stations[currentFreq].audio;
      display.innerText = currentFreq + " FM - " + stations[currentFreq].name;
      subtitle.innerText = stations[currentFreq].name;
      player.loop = stations[currentFreq].loop;
      // Only auto-play if already interacted
      if (playBtn.disabled) player.play().catch(() => {});
    } else {
      display.innerText = currentFreq + " FM - Static";
      subtitle.innerText = "Nothing here";
      player.pause();
    }
  }

  // Slider event
  tuner.addEventListener('input', () => setTuner(tuner.value));

  // Preset buttons
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const freq = parseInt(btn.getAttribute('data-freq'));
      setTuner(freq);
    });
  });

  // Play button for user interaction
  playBtn.addEventListener('click', () => {
    if (stations[currentFreq]) {
      player.src = stations[currentFreq].audio;
      player.loop = stations[currentFreq].loop;
      player.play().catch(err => console.error("Playback failed:", err));
      playBtn.disabled = true; // disable after first click
    }
  });

  // Initialize display (audio won't autoplay yet)
  setTuner(currentFreq);

});
