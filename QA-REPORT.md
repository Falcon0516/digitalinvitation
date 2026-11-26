# QA report

Tested with headless Chromium (Playwright), served from a local web server and directly from `file://`.
Fonts: the Google Fonts could not be downloaded in the test environment, so all screenshots use fallback fonts.

## What was tested
**Viewports (both Kannada and English):** 360×640, 375×667, 390×844, 412×915, 430×932, 768×1024, 1024×768, 1440×900, 1920×1080.
Final run after the last changes: no horizontal scroll at any of the 18 combinations (page width equals window width after scrolling the whole page), 0 console errors, 0 failed local requests, no raw translation keys on the page, no broken images. Repeated on `file://` at 360×640 in both languages with the same result.
The wide elements the checker lists are decorative images that are clipped by their section on purpose.

**Looked at by eye (screenshots):** the whole page at 390×844 in Kannada and 360×640 in English; the doors screen; the hero at 360×640, 390×844 and 430×932. The hero fits on one screen at 360×640 in both languages. Tablet and desktop were checked for overflow only, not inspected visually.

**Behaviour tested:**
- Doors: open by tap or by keyboard (Tab to the seal, Enter); music starts on that tap only, loops, volume fades in; the speaker button mutes and the choice is remembered; nothing audio is downloaded before the tap.
- Language toggle: text, `<html lang>`, page title and ARIA labels switch; choice remembered across reloads; links and calendar text follow the language.
- Dock navigation: each item scrolls to its section and highlights.
- Buttons: Google Maps, directions, Call (two numbers) and WhatsApp (two numbers, message pre-filled and correctly encoded); Copy location, Copy link; the map loads only when tapped; "Share this invitation" falls back to WhatsApp when the phone has no share sheet; share link is the clean page address.
- Calendar: each event and "add all" produce a valid `.ics` (6 events, IST); Google Calendar links carry the same times.
- Countdown and status chips at simulated times (now, reception evening, during the muhurtha, just before it, afterwards, a month later) and for a viewer in the US time zone: all correct and based on IST.
- Reduced motion: doors open quickly, decorative animation off. JavaScript disabled: a plain bilingual summary with map link and phone numbers is shown.
- Accessibility spot-checks (not a full axe scan; axe could not be installed offline): one `<h1>`, sensible heading order, no duplicate ids, every image has an alt attribute, buttons and links have names, landmarks present.

## Performance (4× CPU slowdown, simulated 4G)
- First load: **1.14 MB** in 26 requests (it was 33 MB of images before optimising). Music (2.8 MB) loads only after the tap.
- Fast 4G (9 Mbps / 60 ms): first paint ≈ 1.1 s, fully loaded ≈ 1.9 s.
- Slow 4G (1.6 Mbps / 150 ms): first paint ≈ 1.6 s, largest image painted ≈ 4.9 s, loaded ≈ 6.2 s.
- Petals only animate while the hero is on screen, then stop.
- Measured on a desktop machine with throttling, not on a physical phone.

## Issues found and fixed
- Petals kept drifting over reading text for the whole visit and kept the animation running → now fade out and stop once the hero is off-screen.
- Visible horizontal banding in the maroon background texture → re-tiled seamlessly.
- Date labels in the schedule touched their circular date marker → spacing added.
- Two English-only ARIA labels on the Kannada page → now translated.
- Old Android browsers without `overflow-x: clip` could scroll sideways → fallback added.
- "Share" used the current address including test parameters → now strips them.
- With JavaScript off, the doors screen could never be dismissed → hidden, summary shown.
- Images: 33.3 MB → 1.5 MB (right-sized WebP; texture tiles; originals not shipped). MP3's embedded cover art removed (audio unchanged).
- Text: all Kannada strings compared with the printed card (see VERIFY-BEFORE-SENDING.md). Times in `event-data.js` untouched (only icon file extensions changed).

## Known limitations / not tested
- **Real devices:** nothing was tested on an actual Android phone or iPhone/Safari. iOS music and share behaviour, safe-area spacing and WebP support on very old iOS are unverified.
- **Real fonts:** Cinzel Decorative is wider than the fallback used in testing; the English title "Shubha Vivaha" could wrap onto two lines on a 360px phone. The layout wraps rather than overflows, but check it.
- **Map:** the embedded Google map could not be loaded offline; only the link and the tap-to-load behaviour were verified.
- **Contrast** was judged by eye, not measured; no full axe scan.
- The small inline text link "contact us / ಸಂಪರ್ಕಿಸಿ" is about 21px tall (below the 44px touch size) because it sits inside a sentence.
- Screenshots in `qa-screenshots/` are at 360×640 and 390×844 (both languages) plus the doors screen at three sizes; names are `qa-<width>-<lang>-NN.jpg` in scroll order.
