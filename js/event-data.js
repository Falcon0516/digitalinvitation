/* js/event-data.js — SHARED single source of truth for facts. DO NOT EDIT in agent packs.
   All times are IST (+05:30). Change a time here and every section updates. */
window.INV = window.INV || {};
window.INV.data = {
  siteTitle: { kn: 'ಶುಭ ವಿವಾಹ · ಸುನಂದ & ಮೋಹಿತ್‌ರಾಜ್', en: 'Shubha Vivaha · Sunanda & Mohitraj' },
  couple: {
    bride: { kn: 'ಸುನಂದ', en: 'Sunanda', title: { kn: 'ಚಿ।ಕುಂ।ಸೌ।', en: 'Chi. Kum. Sau.' } },
    groom: { kn: 'ಮೋಹಿತ್‌ರಾಜ್', en: 'Mohitraj', title: { kn: 'ಚಿ।ರಾ।', en: 'Chi. Ra.' } }
  },
  weddingDay: '2026-12-10',
  countdownTarget: '2026-12-10T10:15:00+05:30',
  muhurtha: { start: '2026-12-10T10:14:00+05:30', end: '2026-12-10T10:48:00+05:30' },
  events: [
    { id: 'devara-karya', icon: 'icon-devara-karya.webp', start: '2026-12-06T10:00:00+05:30', end: '2026-12-06T12:00:00+05:30',
      title: { kn: 'ದೇವರ ಕಾರ್ಯ', en: 'Devara Karya' } },
    { id: 'bale-shastra', icon: 'icon-bale-shastra.webp', start: '2026-12-06T12:00:00+05:30', end: '2026-12-06T13:30:00+05:30',
      title: { kn: 'ಬಳೆ ಶಾಸ್ತ್ರ', en: 'Bale Shastra' } },
    { id: 'mehandi', icon: 'icon-mehandi.webp', start: '2026-12-07T09:30:00+05:30', end: '2026-12-07T12:30:00+05:30',
      title: { kn: 'ಮೆಹಂದಿ', en: 'Mehandi' } },
    { id: 'haldi', icon: 'icon-haldi.webp', start: '2026-12-09T10:00:00+05:30', end: '2026-12-09T12:00:00+05:30',
      title: { kn: 'ಅರಿಶಿನ ಶಾಸ್ತ್ರ', en: 'Haldi' } },
    { id: 'reception', icon: 'icon-reception.webp', start: '2026-12-09T19:00:00+05:30', end: '2026-12-09T22:30:00+05:30',
      title: { kn: 'ಆರತಕ್ಷತೆ', en: 'Reception' } },
    { id: 'mangalya', icon: 'icon-mangalya.webp', main: true, start: '2026-12-10T10:15:00+05:30', end: '2026-12-10T10:48:00+05:30',
      title: { kn: 'ಮಾಂಗಲ್ಯಧಾರಣೆ', en: 'Mangalya Dharana' } }
  ],
  venue: {
    name: { kn: 'ವಧುವಿನ ಸ್ವಗೃಹ', en: "Bride's Residence" },
    address: {
      kn: 'ವಧುವಿನ ಸ್ವಗೃಹ, ಹಿರೇಹಡಗಲಿ, ಹೂವಿನಹಡಗಲಿ ತಾ।, ವಿಜಯನಗರ ಜಿ।',
      en: "Bride's Residence, Hirehadagali, Hoovinahadagali Taluk, Vijayanagara District, Karnataka"
    },
    lat: 14.927032, lng: 75.829681,
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=14.927032,75.829681',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=14.927032,75.829681',
    embedUrl: 'https://maps.google.com/maps?q=14.927032,75.829681&z=16&output=embed',
    appleUrl: 'https://maps.apple.com/?ll=14.927032,75.829681&q=Wedding%20Venue'
  },
  contacts: [
    { tel: '+919742580050', display: '97425 80050', wa: '919742580050' },
    { tel: '+919591739050', display: '95917 39050', wa: '919591739050' }
  ],
  hostsLine: {
    kn: 'ಶ್ರೀಮತಿ ಅನುಸೂಯ ಶ್ರೀ ಮಹೇಶಪ್ಪ ಸೋಗಿ ಮಂಗನಹಳ್ಳಿ ಶೆಟ್ರು (ಸಂಡೂರು)',
    en: 'Smt. Anusuya & Sri Maheshappa Sogi Manganahalli Shetru (Sandur)'
  },
  notes: 'Venue is stated on the card only for the wedding (Mangalya Dharana). Locations for the other events are not specified: do not invent them.'
};
