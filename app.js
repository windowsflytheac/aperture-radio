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
    852: { audio: 'assets/portal_radio.wav', name: 'Portal Radio', loop: true },
    999: { audio: 'assets/dr_kliner_emergency.wav', name: 'Dr. Kliner', loop: false }
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
      player.play().catch(() => {}); // autoplay fallback
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
  playBtn.addEventListener('click', () => setTuner(currentFreq));

  // Initialize
  setTuner(currentFreq);

});
