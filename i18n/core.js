/* i18n/core.js — namespace `core` (Agent A). Kannada hero wording follows the printed card. */
(function (w) {
  'use strict';
  var Z = '\u200c'; // ZWNJ used in ಮೋಹಿತ್‌ರಾಜ್ exactly as on the card / event-data
  w.INV = w.INV || {};
  w.INV.i18n.register('core', {
    kn: {
      'nav.aria': 'ಪ್ರಮುಖ ಮಾರ್ಗಸೂಚಿ',
      'nav.home': 'ಮುಖ್ಯ', 'nav.blessings': 'ಆಶೀರ್ವಾದ', 'nav.couple': 'ವಧು-ವರ',
      'nav.events': 'ಕಾರ್ಯಕ್ರಮ', 'nav.venue': 'ಸ್ಥಳ', 'nav.contact': 'ಸಂಪರ್ಕ',
      'lang.short': 'EN', 'lang.aria': 'ಇಂಗ್ಲಿಷ್‌ಗೆ ಬದಲಿಸಿ', 'lang.group': 'ಭಾಷೆ',
      'music.on': 'ಸಂಗೀತ ನಿಲ್ಲಿಸಿ', 'music.off': 'ಸಂಗೀತ ಹಚ್ಚಿ',
      'doors.aria': 'ವಿವಾಹ ಆಮಂತ್ರಣ', 'doors.title': 'ಶುಭ ವಿವಾಹ',
      'doors.tap': 'ತೆರೆಯಲು ಸ್ಪರ್ಶಿಸಿ', 'doors.open': 'ಆಮಂತ್ರಣ ತೆರೆಯಿರಿ',
      'hero.over': 'ಶ್ರೀ ಗಣೇಶಾಯ ನಮಃ', 'hero.title': 'ಶುಭ ವಿವಾಹ',
      'hero.ttlBride': 'ಚಿ।ಕುಂ।ಸೌ।', 'hero.ttlGroom': 'ಚಿ।ರಾ।',
      'hero.bride': 'ಸುನಂದ', 'hero.groom': 'ಮೋಹಿತ್' + Z + 'ರಾಜ್',
      'hero.tag': 'ಮದುವೆಯ ಮಮತೆಯ ಕರೆಯೋಲೆ', 'hero.cue': 'ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ',
      'cd.title': 'ಮಾಂಗಲ್ಯಧಾರಣೆಗೆ ಇನ್ನು',
      'cd.d': 'ದಿನ', 'cd.h': 'ಗಂಟೆ', 'cd.m': 'ನಿಮಿಷ', 'cd.s': 'ಸೆಕೆಂಡ್',
      'cd.today': 'ಇಂದೇ ಶುಭ ಮುಹೂರ್ತ!', 'cd.now': 'ಈಗ ಶುಭ ಮುಹೂರ್ತ!',
      'cd.after': 'ಶುಭ ವಿವಾಹ ಸಂಪನ್ನ — ನಿಮ್ಮ ಆಶೀರ್ವಾದಕ್ಕೆ ಧನ್ಯವಾದಗಳು',
      'cd.muh': 'ಮುಹೂರ್ತ: {s} ರಿಂದ {e} ರ ವರೆಗೆ',
      'cd.aria': 'ಮಾಂಗಲ್ಯಧಾರಣೆಗೆ ಉಳಿದ ಸಮಯ: {d} ದಿನ, {h} ಗಂಟೆ, {m} ನಿಮಿಷ'
    },
    en: {
      'nav.aria': 'Main navigation',
      'nav.home': 'Home', 'nav.blessings': 'Blessings', 'nav.couple': 'Couple',
      'nav.events': 'Events', 'nav.venue': 'Venue', 'nav.contact': 'Contact',
      'lang.short': '\u0C95', 'lang.aria': 'Switch to Kannada', 'lang.group': 'Language',
      'music.on': 'Mute music', 'music.off': 'Play music',
      'doors.aria': 'Wedding invitation', 'doors.title': 'Shubha Vivaha',
      'doors.tap': 'Tap to open', 'doors.open': 'Open the invitation',
      'hero.over': 'Shri Ganeshaya Namaha', 'hero.title': 'Shubha Vivaha',
      'hero.ttlBride': 'Chi. Kum. Sau.', 'hero.ttlGroom': 'Chi. Ra.',
      'hero.bride': 'Sunanda', 'hero.groom': 'Mohitraj',
      'hero.tag': 'A loving invitation to our wedding', 'hero.cue': 'Scroll',
      'cd.title': 'Counting down to the Muhurtha',
      'cd.d': 'Days', 'cd.h': 'Hours', 'cd.m': 'Minutes', 'cd.s': 'Seconds',
      'cd.today': 'The auspicious muhurtha is today!', 'cd.now': 'The auspicious moment is now!',
      'cd.after': 'The wedding has been blessed — thank you for your blessings',
      'cd.muh': 'Muhurtha: {s} to {e}',
      'cd.aria': 'Time remaining until Mangalya Dharana: {d} days, {h} hours, {m} minutes'
    }
  });
})(window);
