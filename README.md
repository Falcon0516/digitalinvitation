# Sunanda & Mohitraj — Wedding Invitation (Kannada / English)

A static, mobile-first website. No build step, no server code, no frameworks.
Opening the doors plays the music (only after the guest taps), then the invitation scrolls.

## Open it on your computer
Double-click `index.html`. It works straight from the folder (also tested under a local web server).
Handy test links (add to the address): `?lang=en` (English), `?lang=kn` (Kannada), `?skip=1` (skip the doors intro).
These are for testing only; guests just open the normal link.

## Put it online (free)
Upload the **whole folder contents** (the folder that contains `index.html`). Any of these works:
- **Netlify Drop** (easiest): go to app.netlify.com/drop and drag the folder in. You get a link in seconds.
- **Cloudflare Pages**: Create project > Direct Upload > upload the folder.
- **GitHub Pages**: put the files in a repository, then Settings > Pages > deploy from the main branch.

Use `https://` links only (music, maps and "Add to calendar" need it).

### Do this after you know the final web address
1. Open `index.html` in a text editor and replace every `https://YOUR-DOMAIN/` with your real address (e.g. `https://sunanda-mohitraj.netlify.app/`). It appears in 3 tags (og:url, og:image, twitter:image) plus one comment. This is what makes the WhatsApp preview picture work.
2. In `js/event-data.js`, inside `window.INV.data = { ... }`, add a line `shareUrl: 'https://your-real-address/',` so the "Share this invitation" buttons always send the clean link.
3. Send yourself the link on WhatsApp once and check the preview picture shows. (WhatsApp caches previews; if you change the picture later, add `?v=2` to the link you share.)

## Change a time, phone number or the venue
Everything factual lives in **`js/event-data.js`** (all times are Indian Standard Time, +05:30):
- Event times: edit `start` / `end` of the event in `events`. The schedule, countdown, blessings date boxes and calendar files all follow. The reception is the event with `id: 'reception'`.
- The countdown counts down to `countdownTarget`; the printed muhurtha window is `muhurtha`.
- Phone numbers: `contacts` (`tel` with +91, `display` as shown, `wa` for WhatsApp).
- Venue name, address and map links: `venue` (`lat` / `lng` and the URLs).
Save the file and refresh the page. Do not edit text in several places; this one file is the source.

## Change the music
Replace `assets/audio/invitation-theme.mp3` with another MP3 of the **same file name**. Keep it under about 3 MB (96–128 kbps is plenty). It starts only when the guest taps the doors, and the speaker button turns it off (remembered next visit).

## Notes for hosting
- Suggested cache settings: `assets/`, `css/`, `js/`, `i18n/`, `favicon/` can be cached for a long time (e.g. 1 year); `index.html` should be revalidated (`Cache-Control: no-cache`). If you change a CSS/JS/image file after sharing, rename it or add `?v=2` where it is referenced so phones fetch the new one.
- Fonts (Cinzel, Cormorant Garamond, Tiro Kannada, Noto Serif Kannada) load from Google Fonts. If they can't load, readable system fonts are used.
- With JavaScript switched off, guests see a plain summary (date, time, venue, phone numbers, map link) instead of the animated invitation.

## Folder map
`index.html` · `manifest.webmanifest` · `favicon/` · `css/` · `js/` (`event-data.js` is the one you edit) · `i18n/` (all Kannada/English wording) · `assets/images` · `assets/audio` · `qa-screenshots/` (not needed on the website; you can leave it out when uploading) · `VERIFY-BEFORE-SENDING.md` · `QA-REPORT.md`
