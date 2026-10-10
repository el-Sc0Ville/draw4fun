# draw4fun — Ellie's Drawing Ranch 🐴🖍️

A Pixter-style drawing studio made just for Ellie. It runs in any modern browser, with no build step, no server and no accounts. It's just static files.

## The main event: Draw together (on paper) 📝

The big purple button on the home screen. Ellie picks a drawing, grabs paper and a pencil, and copies it one step at a time:

1. **Intro:** shows the finished drawing. "Get your paper and a pencil!"
2. **Each step:** what she already drew stays dark, and the **new lines appear in pink**, drawn slowly by a moving pencil so she sees where to start and which way to go. The voice reads the step aloud. Tap ↻ (or the picture) to watch again.
3. **The end:** confetti, a sticker, and a **colored example** ("Here is one idea") to inspire her coloring.
4. **📷 Show me your drawing!** opens the tablet camera. She takes a photo of her paper drawing and it's saved in "My drawings".
5. **✏️ Try it on the tablet** turns the same drawing into a tracing lesson on screen.

The screen stays awake while she draws, on tablets that support it.

**Library: 19 drawings**, filtered by Horses / Animals / Fun stuff, with ⭐ to ⭐⭐⭐ difficulty:

| ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Tricky |
|---|---|---|
| Kitty, Snail, Turtle, Fish, Cupcake, Ice cream, Flower | Pony, Seahorse, Chick, Bunny in a basket, Butterfly, Owl, Train, Rocket | Horse, Unicorn, Swan, Mermaid |

### Adding more drawings

All drawings live in `js/paper.js`. Each one is a block like this:

```js
L.cat = {
  name: ['Kitty', 'Chaton'], emoji: '🐱', level: 1, cat: 'animals',
  steps: [
    { t: ['Draw a big round head.', 'Dessine une grosse tête ronde.'], d: [ell(600, 380, 190, 160)] },
    ...
  ],
  colors: [[600, 290, '#FFB46B'], ...]   // where to "pour" paint for the color idea
};
```

The drawing space is 1200 × 900 and each step's `d` is a list of SVG paths. The easiest way to get new ones: ask Claude ("add a dolphin and a dragon to paper.js").

## Everything else

| Activity | What she does | How the level changes it |
|---|---|---|
| **Draw** | Free drawing with crayon, paint, rainbow, sparkles, stamps, fill bucket, eraser | — |
| **Color** | 6 coloring pages. Tap a space to fill it | Easy = big shapes. Tricky = extra details |
| **Dots** | Mystery connect-the-dots with musical notes | Easy ≈ 10 dots · Medium ≈ 20 · Tricky ≈ 30 |
| **Surprise!** | Silly idea slot machine ("Draw a pony eating a giant carrot on the moon!"). Great for free drawing on paper too | Easy = 2 reels · Medium = 3 · Tricky = 3 + bonus |

Plus 4 themes, an EN/FR switch, instructions read aloud, a pony friend she names herself, a sticker book and a "My drawings" gallery.

**Grown-ups menu:** press and **hold** the ⚙️ button for about 1 second (voice, sounds, rename pony, clear drawings or stickers).

## Put it on GitHub Pages

1. In your `draw4fun` repository, click **Add file → Upload files** and drag in **everything inside this folder** (`index.html`, `css/`, `js/`, the icons, `manifest.webmanifest`). Commit.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**. Save.
3. After about a minute it's live at `https://YOUR-USERNAME.github.io/draw4fun/`.

To update later, upload the changed files again (same names) and commit. If the tablet still shows the old version, close and reopen the page.

## Set it up on her tablets

**iPad (Safari):** open the link, tap **Share → Add to Home Screen**. It shows her cartoon face as the icon, is labeled "draw4fun", and opens full screen.

**Amazon Kids / Fire tablet:** the kids profile blocks websites by default. In the **Amazon Parent Dashboard** (parents.amazon.com), open her profile, go to **Add content → Websites**, and add the URL. The photo button needs the browser to be allowed to use the camera. If it doesn't work there, everything else still does.

**Tip:** Turn the volume up. The voice is the tablet's built-in text-to-speech, so a tablet without a French voice may read French with an English accent.

## Settings (optional)

Nothing needs changing. It already says "Ellie". The settings block at the top of `index.html` only matters if you want to:

```js
window.ELLIE_CONFIG = {
  name: 'Ellie',        // change the name it shows and says
  defaultLang: 'en',    // start in French with 'fr' (there's also an EN/FR button)
  avatarImage: '',      // use your own picture instead of the drawn cartoon, e.g. 'img/ellie.png'
  fullscreen: true      // set to false if full screen is annoying
};
```

**Privacy note:** GitHub Pages sites are public. The app only uses her first name and a drawn cartoon. Her drawings and photos stay on each tablet (browser storage) and are never uploaded.

## Files

```
index.html            page + optional settings
css/style.css         look & layout
js/i18n.js            English / French text + Surprise idea lists
js/art.js             Ellie, the pony, coloring pages, dot shapes
js/paper.js           the "Draw together" step-by-step library  ← add drawings here
js/app.js             drawing engine, sounds, voice, games
icon*.png, icon.svg   home-screen icons
manifest.webmanifest  "install as app" info
```
