import { Audio } from 'expo-av';

// Filenames match data/alphabet.js order (letter_01 = А … letter_42 = Я).
const SOUNDS = {
  'letter_01.mp3': require('../assets/sounds/letter_01.mp3'), // А
  'letter_02.mp3': require('../assets/sounds/letter_02.mp3'), // Ә
  'letter_03.mp3': require('../assets/sounds/letter_03.mp3'), // Б
  'letter_04.mp3': require('../assets/sounds/letter_04.mp3'), // В
  'letter_05.mp3': require('../assets/sounds/letter_05.mp3'), // Г
  'letter_06.mp3': require('../assets/sounds/letter_06.mp3'), // Ғ
  'letter_07.mp3': require('../assets/sounds/letter_07.mp3'), // Д
  'letter_08.mp3': require('../assets/sounds/letter_08.mp3'), // Е
  'letter_09.mp3': require('../assets/sounds/letter_09.mp3'), // Ё
  'letter_10.mp3': require('../assets/sounds/letter_10.mp3'), // Ж
  'letter_11.mp3': require('../assets/sounds/letter_11.mp3'), // З
  'letter_12.mp3': require('../assets/sounds/letter_12.mp3'), // И
  'letter_13.mp3': require('../assets/sounds/letter_13.mp3'), // Й
  'letter_14.mp3': require('../assets/sounds/letter_14.mp3'), // К
  'letter_15.mp3': require('../assets/sounds/letter_15.mp3'), // Қ
  'letter_16.mp3': require('../assets/sounds/letter_16.mp3'), // Л
  'letter_17.mp3': require('../assets/sounds/letter_17.mp3'), // М
  'letter_18.mp3': require('../assets/sounds/letter_18.mp3'), // Н
  'letter_19.mp3': require('../assets/sounds/letter_19.mp3'), // Ң
  'letter_20.mp3': require('../assets/sounds/letter_20.mp3'), // О
  'letter_21.mp3': require('../assets/sounds/letter_21.mp3'), // Ө
  'letter_22.mp3': require('../assets/sounds/letter_22.mp3'), // П
  'letter_23.mp3': require('../assets/sounds/letter_23.mp3'), // Р
  'letter_24.mp3': require('../assets/sounds/letter_24.mp3'), // С
  'letter_25.mp3': require('../assets/sounds/letter_25.mp3'), // Т
  'letter_26.mp3': require('../assets/sounds/letter_26.mp3'), // У
  'letter_27.mp3': require('../assets/sounds/letter_27.mp3'), // Ұ
  'letter_28.mp3': require('../assets/sounds/letter_28.mp3'), // Ү
  'letter_29.mp3': require('../assets/sounds/letter_29.mp3'), // Ф
  'letter_30.mp3': require('../assets/sounds/letter_30.mp3'), // Х
  'letter_31.mp3': require('../assets/sounds/letter_31.mp3'), // Һ
  'letter_32.mp3': require('../assets/sounds/letter_32.mp3'), // Ц
  'letter_33.mp3': require('../assets/sounds/letter_33.mp3'), // Ч
  'letter_34.mp3': require('../assets/sounds/letter_34.mp3'), // Ш
  'letter_35.mp3': require('../assets/sounds/letter_35.mp3'), // Щ
  'letter_36.mp3': require('../assets/sounds/letter_36.mp3'), // Ъ
  'letter_37.mp3': require('../assets/sounds/letter_37.mp3'), // Ы
  'letter_38.mp3': require('../assets/sounds/letter_38.mp3'), // І
  'letter_39.mp3': require('../assets/sounds/letter_39.mp3'), // Ь
  'letter_40.mp3': require('../assets/sounds/letter_40.mp3'), // Э
  'letter_41.mp3': require('../assets/sounds/letter_41.mp3'), // Ю
  'letter_42.mp3': require('../assets/sounds/letter_42.mp3'), // Я
};

export async function playSound(filename) {
  try {
    const source = SOUNDS[filename];
    if (!source) return;

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
