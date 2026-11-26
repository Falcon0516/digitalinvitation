# Verify before sending

Please have a family member who reads Kannada check the items below on a real phone, in both languages.
Nothing here was changed to "fix" it: the site follows the data file and the printed card as described.

## 1. Decide first: reception time
- The printed card says **ಆರತಕ್ಷತೆ — ರಾತ್ರಿ 8:00 ಗಂಟೆಯಿಂದ (8:00 PM), Wednesday 9 December 2026**.
- The website currently shows **7:00 PM** (to 10:30 PM), because that is what `js/event-data.js` says.
- It appears in the blessings date box, the schedule, and the reception calendar entry; all follow the data file.
- **Action:** confirm the correct time. If it is 8:00 PM, change the reception `start` (and `end`) in `js/event-data.js` — nothing else needs editing. Guests who also hold the printed card will notice a mismatch, so this matters.

## 2. Times and events that are not exactly as printed on the card
- **Mangalya Dharana start:** the data uses 10:15 AM (it drives the countdown and the calendar entry), while the card's muhurtha window is **10:14 to 10:48 AM**. The page shows both (10:15 on the event card and venue line; the 10:14–10:48 window in the countdown, blessings and schedule). Confirm you are happy with this.
- **Devara Karya, Bale Shastra, Mehandi, Haldi:** their dates and times (6, 6, 7 and 9 December) are in the data file but are **not printed on the card**. Confirm each day, time and name ("Bale Shastra" in particular).
- **Venue for other events:** the card gives a venue only for the wedding (the bride's home, Hirehadagali). The page says "for the location of the other events, please contact us" rather than guessing.
- **Date format:** the card prints "10-12-2026ನೇ ಗುರುವಾರ"; the page writes "ಗುರುವಾರ, 10 ಡಿಸೆಂಬರ್ 2026".

## 3. Spelling and wording compared with the card
I compared 41 Kannada lines from the card spread (invocations, swamijis, the invitation paragraph, family names, well-wishers, venue) with the page text. 40 matched exactly; the one difference is deliberate:
- **ಜ್ಯೇಷ್ಠ ಸುಪುತ್ರ** (groom's line): the card prints **ಜೇಷ್ಠ** (missing the ್ಯ). The page uses the standard spelling ಜ್ಯೇಷ್ಠ. Tell us if you want it exactly as printed.
- **ಆಶ್ವಿನಿ** (third name in the well-wishers list): copied as printed on the card; the usual spelling is ಅಶ್ವಿನಿ. English shows "Ashwini". Names are the family's call.
- **Danda marks:** the card uses ॥ in "ಚಿ॥ಕುಂ॥ಸೌ॥", "ಷ॥ ಬ್ರ॥", "ಸಾ॥"; the site uses a single ।.
- The bride's line reads "ಇವರ ಸುಪುತ್ರಿ" as on the card.
- English transliterations are best guesses: "Sha. Br." (swamiji titles), "Chinivala relatives" (unsure if surname or place), "Pattedha", "Airane".

## 4. Wording that is NOT from the card (written for the website)
Hero tagline "ಮದುವೆಯ ಮಮತೆಯ ಕರೆಯೋಲೆ" is the card's own title; the rest below is website wording:
- Countdown: heading "ಮಾಂಗಲ್ಯಧಾರಣೆಗೆ ಇನ್ನು", the "now" message "ಈಗ ಶುಭ ಮುಹೂರ್ತ!", the "ಮುಹೂರ್ತ: … ರಿಂದ … ರ ವರೆಗೆ" sentence.
- Section sub-lines: "ನಿಮ್ಮ ಉಪಸ್ಥಿತಿ ನಮಗೆ ಸಂತೋಷ", closing "ನಿಮ್ಮ ಆಗಮನ ನಮ್ಮ ಸೌಭಾಗ್ಯ", footer "ಸರ್ವರಿಗೂ ಆದರದ ಸ್ವಾಗತ" / "A warm welcome to all", English "May all be auspicious".
- Buttons and labels: dock names, "ಮುಖ್ಯ ಕಾರ್ಯಕ್ರಮ", status chips, "ಕ್ಯಾಲೆಂಡರ್", "ಎಲ್ಲಾ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಸೇರಿಸಿ", "ನಕ್ಷೆ ತೆರೆಯಿರಿ", "ದಾರಿ ತೋರಿಸಿ", "ಸ್ಥಳ ನಕಲಿಸಿ", "ಆಮಂತ್ರಣ ಹಂಚಿಕೊಳ್ಳಿ", "ಕರೆ ಮಾಡಿ", "ವಾಟ್ಸ್‌ಆ್ಯಪ್", "ಸಂಪರ್ಕ 1/2".
- Pre-filled WhatsApp messages (enquiry and share) and the calendar entry titles/descriptions.
- The contact cards show only the two phone numbers (the card gives no names for them).

## 5. Technical items to complete
- Replace `https://YOUR-DOMAIN/` in `index.html` (3 tags) after hosting, and optionally add `shareUrl` to `js/event-data.js` (see README).
- Check the real Kannada fonts (Noto Serif Kannada / Tiro Kannada) on an actual phone; they could not be loaded when this was built (see QA-REPORT).
- Check the phone numbers: 97425 80050 and 95917 39050 match the card.
