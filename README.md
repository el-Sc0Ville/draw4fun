# draw4fun — Ellie's Drawing Ranch 🐴🖍️

A Pixter-style drawing studio made just for Ellie. It runs in any modern browser, with no build step, no server and no accounts. It's just static files.

## The main event: Draw together (on paper) 📝

The big purple button on the home screen. Ellie picks a drawing, grabs paper and a pencil, and copies it one step at a time:

1. **Intro:** shows the finished drawing. "Get your paper and a pencil!"
2. **Each step:** what she already drew stays dark, and the **new lines appear in pink**, drawn slowly by a moving pencil so she sees where to start and which way to go. The voice reads the step aloud. Tap ↻ (or the picture) to watch again.
3. **⏩ Skip to the end** (any time): jumps straight to the finished drawing, handy when she already drew it.
4. **The end:** confetti, a sticker, and a **colored example** ("Here is one idea"). Then:
   - **🎨 Color it!** opens the finished drawing in the coloring tool on the tablet.
   - **📷 Photo**: the front camera opens with a 3-2-1 countdown. Her photo is saved next to the intended result, side by side, in "My drawings". You can hide this button in the grown-ups menu.
   - **🔁 Again** or **✏️ Trace** (the same drawing as a tracing lesson on screen, with its own ⏩ skip-to-coloring).

**Which ones has she done?** Drawings she hasn't tried have a pink **NEW** tag; finished ones get a green **✓**. A **🕘 Recently done** row at the top shows her latest ones, using her photo or colored version when she made one. Tap one to jump straight to the finished drawing. It also shows her progress ("✓ 14 of 104 done").

The screen stays awake while she draws, on tablets that support it.

**Library: 104 drawings**, all unlocked, with ⭐ to ⭐⭐⭐ difficulty on each card:

| Category | Count | Examples |
|---|---|---|
| 🎃 Halloween | 15 | bat, black cat, witch hat, cauldron, spider, web, candy corn, haunted house, mummy, witch, monster, candy bucket, witchy pony, ghost, pumpkin |
| 🐴 Horses | 10 | horse, pony, unicorn, rocking horse, carousel horse, baby foal, seahorse, lucky horseshoe |
| 🐾 Animals | 25 | kitty, puppy, bunny, panda, fox, lion, giraffe, penguin, cow, piggy, sheep, owl… |
| 🐠 Sea | 13 | whale, octopus, crab, dolphin, jellyfish, friendly shark, sailboat, lighthouse… |
| 🍓 Yummy | 14 | donut, pizza, strawberry, birthday cake, popsicle, pancakes, carrot (for the pony)… |
| 🔮 Magic | 11 | fairy, princess, castle, baby dragon, mermaid, rainbow, crown, sleepy moon… |
| 🚗 Things | 16 | car, airplane, hot air balloon, robot, snowman, bicycle, teapot, apple tree… |

**Always something fresh:**
- **🌟 Drawing of the day.** Every day a new drawing is featured at the top of the list and on the home button. It picks one she hasn't tried yet. From mid-September to early November it picks Halloween ones first, and the 🎃 Halloween filter moves to the front.
- **"✨ New for you"** filter, with a count of how many are left.

## 🎃 Halloween theme

Pick the pumpkin in the Theme row on the home screen: a dusk sky with a big moon, flying bats and a floating ghost; Ellie and her pony get little witch hats; Halloween stamps (🎃 👻 🦇 🕷️ 🕸️ 🍬); spooky-cute ideas in the Surprise spinner ("a witch flying on a broom in a pumpkin patch!"); and the Color screen offers the Halloween drawings as extra coloring pages.

## Everything else

| Activity | What she does | How the level changes it |
|---|---|---|
| **Draw** | Free drawing with crayon, paint, rainbow, sparkles, stamps, fill bucket, eraser | — |
| **Color** | 6 coloring pages + more pictures from the library that match the theme. Tap a space to fill it | Easy = big shapes. Tricky = extra details |
| **Dots** | Mystery connect-the-dots with musical notes | Easy ≈ 10 dots · Medium ≈ 20 · Tricky ≈ 30 |
| **Surprise!** | Silly idea slot machine. Great for free drawing on paper too | Easy = 2 reels · Medium = 3 · Tricky = 3 + bonus |

Plus 5 themes, an EN/FR switch, instructions read aloud, a pony friend she names herself, a sticker book and a "My drawings" gallery.

**Getting around:** every screen has the same purple **‹ back arrow** in the top-left corner. The Fire tablet's own Back button does the same, and closes pop-ups first.

**Grown-ups menu:** press and **hold** the ⚙️ button for about 1 second:
- **Which voice:** tap a voice to hear it and keep the one you like (saved separately for English and French). By default it picks the nicest one it finds: Canadian first, then American, and it skips the robotic and novelty voices.
- Voice speed (normal/slower), sounds, photo button on/off, rename the pony, and reset drawings, stickers or the ✓ list.

## Put it on GitHub Pages

1. In your `draw4fun` repository, click **Add file → Upload files** and drag in **everything inside this folder** (`index.html`, `css/`, `js/` with its `packs` folder, the icons, `manifest.webmanifest`). Commit.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**. Save.
3. After about a minute it's live at `https://YOUR-USERNAME.github.io/draw4fun/`.

To update later, upload the changed files again (same names) and commit. If the tablet still shows the old version, close and reopen the page.

## Set it up on her tablets

**iPad (Safari):** open the link, tap **Share → Add to Home Screen**. It shows her cartoon face as the icon, is labeled "draw4fun", and opens full screen with no browser bar.

**Fire tablet, regular (adult) profile, Silk browser:** open the link, wait for it to load, tap the **⋮ menu** (top right) and choose the **Add to Home Screen** option. Give the shortcut a name and confirm. A one-tap icon appears on the home screen. Menu wording can vary a little between Fire OS versions.

**Fire tablet, Amazon Kids profile:** websites are blocked unless you approve them. On the tablet, from your adult profile, open **Amazon Kids**, tap the **gear** on her profile, choose **Add Content → Add Websites**, and add your draw4fun address. It then appears in her Web section.

**Full screen:** tapping "Let's go!" asks the browser to go full screen, and there's a ⛶ **full-screen button** on the home screen to switch it on and off. Full screen ends when the page reloads; just tap ⛶ again. Some kid-mode browsers may not allow full screen; everything else still works.

**Photo button:** it needs camera permission. The first time, the tablet asks; tap Allow. If the camera can't open (some kid profiles block it), she can use the 📱 Camera app button instead, or you can hide the photo button in the grown-ups menu.

**Voice tip:** turn the volume up. The voice is the tablet's built-in text-to-speech. If every voice sounds harsh, the tablet's text-to-speech settings may let you download nicer voices; then pick one in **⚙️ → Which voice**.

## Settings (optional)

Nothing needs changing. It already says "Ellie". The settings block at the top of `index.html` only matters if you want to:

```js
window.ELLIE_CONFIG = {
  name: 'Ellie',        // change the name it shows and says
  defaultLang: 'en',    // start in French with 'fr' (there's also an EN/FR button)
  avatarImage: '',      // use your own picture instead of the drawn cartoon, e.g. 'img/ellie.png'
  fullscreen: true      // set to false to stop "Let's go!" from going full screen
};
```

**Privacy note:** GitHub Pages sites are public. The app only uses her first name and a drawn cartoon. Her drawings, photos, stickers and progress stay on each tablet, in the browser's own storage, and are never uploaded.

## Adding more drawings

Drawings live in `js/paper.js` and in theme packs in `js/packs/` (horsesfarm, animals, sea, yummy, magic, things, halloween). Each one is a block like this:

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

The easiest way to get new ones is to ask Claude for a new pack ("make a winter pack", "add a dinosaur pack"). A new pack is one new file in `js/packs/` plus one `<script>` line in `index.html`. The new drawings automatically show up with NEW badges and in the drawing of the day.

## Files

```
index.html            page + optional settings
css/style.css         look & layout
js/i18n.js            English / French text + Surprise idea lists
js/art.js             Ellie, the pony, coloring pages, dot shapes
js/paper.js           the "Draw together" core library
js/packs/*.js         theme packs (more drawings)                 ← add new packs here
js/app.js             drawing engine, sounds, voice, camera, games
icon*.png, icon.svg   home-screen icons
manifest.webmanifest  "install as app" info
```
