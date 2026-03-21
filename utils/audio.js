import { Audio } from 'expo-av';

// Static map of letter audio files.
// Add an entry here each time you drop an mp3 into assets/sounds/.
// Files are named letter_01.mp3 → letter_42.mp3, matching the order
// in data/alphabet.js. See the README or CLAUDE.md for the full list.
//
// Example — uncomment as you add files:
// const SOUNDS = {
//   'letter_01.mp3': require('../assets/sounds/letter_01.mp3'), // А
//   'letter_02.mp3': require('../assets/sounds/letter_02.mp3'), // Ә
//   ...
// };

const SOUNDS = {};

export async function playSound(filename) {
  try {
    const source = SOUNDS[filename];
    if (!source) return; // File not added yet — do nothing silently

    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    const { sound } = await Audio.Sound.createAsync(source);
    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // Fail silently — missing or unplayable file
  }
}
