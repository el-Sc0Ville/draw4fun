# Ellie's Drawing Ranch 🐴🖍️

A Pixter-style drawing studio made just for Ellie. It runs in any modern browser, with no build step, no server and no accounts. It's just static files.

## What's inside

| Activity | What she does | How the level changes it |
|---|---|---|
| **Draw** | Free drawing with crayon, paint, rainbow, sparkles, stamps, fill bucket, eraser | — |
| **Color** | 6 coloring pages (horse, unicorn, flying horse, seahorse, barn, cupcake). Tap a space to fill it | Easy = big shapes and thick lines. Tricky = extra details (sun, fence, flowers, spots…) |
| **Dots** | Mystery connect-the-dots. Each dot plays a rising musical note, and the finished picture can be colored | Easy ≈ 10 dots · Medium ≈ 20 · Tricky ≈ 30 (no pulsing hint) |
| **Draw with me** | Step-by-step lessons (horse, unicorn, flying horse, cupcake, fish). A crayon draws each step and the voice reads it out | Easy = trace the dotted line · Medium = faint guide · Tricky = watch, then it disappears |
| **Surprise!** | A slot machine of silly ideas ("Draw a pony eating a giant carrot on the moon!") | Easy = 2 reels · Medium = 3 · Tricky = 3 + a bonus challenge |

Also included: 4 themes (Horse Ranch, Unicorn Rainbow, Under the Sea, Starry Night), an EN/FR switch, instructions read aloud, a pony friend she names herself, a sticker book (30 to collect), and a "My drawings" gallery with download.

**Grown-ups menu:** press and **hold** the ⚙️ button for about 1 second. From there you can turn off the voice or sounds, rename the pony, and clear drawings or stickers.

## Put it on GitHub Pages (about 5 minutes)

1. On github.com, create a new **public** repository, e.g. `ellie-draws`.
2. Click **Add file → Upload files**, then drag in **everything inside this folder** (`index.html`, `css/`, `js/`, the icons, `manifest.webmanifest`). Commit.
3. Go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then **main** and **/ (root)**. Save.
4. After about a minute your site is live at `https://YOUR-USERNAME.github.io/ellie-draws/`.

To update it later, upload the changed file again (same name) and commit.

## Set it up on her tablets

**iPad (Safari):** open the link, tap **Share → Add to Home Screen**. It gets her cartoon face as the icon and opens full screen like an app.

**Amazon Kids / Fire tablet:** the kids profile blocks websites by default. In the **Amazon Parent Dashboard** (parents.amazon.com), go to her profile, then **Add content → Websites**, and add your GitHub Pages URL. Then open it from the Web tab in her profile.

**Tip:** Turn the tablet volume up. The talking voice uses the tablet's built-in text-to-speech. If one tablet has no French voice installed, French text still shows on screen and the voice may use an English accent.

## Personalize

Open `index.html` and edit the small settings block at the top:

```js
window.ELLIE_CONFIG = {
  name: 'Ellie',        // shown and spoken everywhere
  defaultLang: 'en',    // 'en' or 'fr'
  avatarImage: '',      // e.g. 'img/ellie.png' to use your own cartoon portrait
  fullscreen: true
};
```

**Want a different cartoon portrait?** Save a PNG with a transparent background (tall, roughly 3:4) as `img/ellie.png`, upload it, and set `avatarImage: 'img/ellie.png'`.

**Privacy note:** GitHub Pages sites are public. The app only uses her first name and a drawn cartoon, never a photo. Her drawings, stickers and settings stay on each tablet (in the browser's local storage) and are never uploaded.

## Files

```
index.html            page + settings
css/style.css         look & layout (themes are at the top)
js/i18n.js            all English / French text + the Surprise idea lists
js/art.js             Ellie, the pony, coloring pages, dot shapes, lessons
js/app.js             drawing engine, sounds, voice, games
icon*.png, icon.svg   home-screen icons
manifest.webmanifest  "install as app" info
```

Adding a new silly idea is a one-line edit in `js/i18n.js` (look for `window.SPIN`).
