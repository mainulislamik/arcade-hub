# Arcadex Mobile Responsiveness & Authentic Angry Birds Execution Plan

> **For Hermes / Claude Code:** Use this step-by-step implementation plan once approved. Do not skip verification steps.

**Goal:** Provide a flawless, 100% responsive, touch-optimized mobile experience for Angry Birds Classic on mobile smartphones (portrait and landscape) and desktop at `https://game.amarpdf.net/game/angry-birds`, eliminating all cache locks, black screens, and layout clutter.

**Architecture:**
- **Cache & Deployment:** Nginx `no-cache` for `/sw.js`, Network-First caching strategy in `sw.js` for HTML navigations to ensure instant updates on all user devices.
- **Player Engine:** Direct single-layer iframe mounting (`src="/games/angry-birds/index.html"`) with `UniversalMouseOverlay` bypassed for HTML5/touch games.
- **Mobile UI:** Mobile-first layout in `GameTheaterPage.tsx` with compact essential controls and collapsible secondary tools drawer.
- **Game Runtime:** Responsive auto-scaling Cocos2D/Box2D canvas with `touch-action: none` and WebAudio unlocking.

---

## Root Cause Analysis of Current Phone State

1. **Why No Changes Appeared on the Phone (Cache Lock):**
   - `nginx.conf` matched `/sw.js` under `location ~* \.(?:css|js...)$`, delivering `Cache-Control: public, max-age=31536000, immutable`.
   - `public/sw.js` used a Cache-First strategy with `CACHE_NAME = 'arcadex-v1-offline-core'` without version bumping.
   - Mobile Chrome continued serving the cached legacy bundle (`index-BU5Hyu1w.js`), preventing the phone from loading updated assets.

2. **Why the Game Area Shows a Black Rectangle:**
   - In the legacy bundle, `UniversalWasmRunner.tsx` wrapped the web runner in `srcDoc={buildEmulatorDoc()}`.
   - The inner `<iframe src="/games/angry-birds/index.html">` failed to load in Android Chrome due to `about:srcdoc` opaque origin restrictions on relative URLs.
   - `UniversalMouseOverlay` intercepted pointer and touch events, converting mouse/touch drags into keyboard arrow events.

3. **Why the Layout Is Not Responsive on Phones:**
   - 15 desktop action buttons (`P2P Multiplayer`, `Save/Load`, `30s Clip`, `AI Coach`, `Speedrun`, `Gamepad`, `CRT Shaders`, etc.) rendered above the game in portrait mode, consuming ~400px of vertical space.
   - The game container enforced `min-h-[580px]`, distorting a 16:9 landscape game inside a 9:16 portrait viewport.

---

## Step-by-Step Implementation Tasks

### Task 1: Fix Service Worker & Nginx Caching (Instant Delivery)

**Objective:** Ensure all client devices receive fresh HTML and bundles immediately upon update without stale cache traps.

**Files:**
- Modify: `nginx.conf`
- Modify: `public/sw.js`
- Modify: `src/main.tsx`

**Step 1: Update Nginx Configuration**
Add an explicit location block for `sw.js` and `manifest.json` before general static assets:
```nginx
location = /sw.js {
    expires -1;
    add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
    try_files $uri =404;
}
```

**Step 2: Update Service Worker Strategy**
- Increment cache name: `arcadex-v2-mobile-responsive`.
- Change navigation/HTML requests to **Network-First**: fetch from network first; if offline, fallback to cache.
- Call `self.skipWaiting()` and `clients.claim()` immediately on activate.

**Step 3: Add Service Worker Registration Auto-Update**
In `src/main.tsx`:
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.update();
  }).catch(() => {});
}
```

**Verification:**
- Run `curl -I https://game.amarpdf.net/sw.js` and verify `Cache-Control: no-store, no-cache`.

---

### Task 2: Direct Single-Layer Iframe Rendering in UniversalWasmRunner

**Objective:** Eliminate the black screen by removing the nested `srcDoc` iframe and bypassing mouse-to-keyboard touch overlays.

**Files:**
- Modify: `src/components/player/UniversalWasmRunner.tsx`

**Step 1: Direct Mounting for HTML5 Games**
- Check:
  ```typescript
  const isHtmlGame = format === 'html' || format === 'zip' || game.engineType === 'iframe_web' || game.engineType === 'html5_zip';
  ```
- For `isHtmlGame`, set `src={game.romUrl || game.binaryUrl}` directly on the outer `<iframe>`.
- Set `srcDoc={isHtmlGame ? undefined : buildEmulatorDoc()}`.

**Step 2: Disable Mouse Overlay on HTML5 Games**
- Pass `enabled={!isHtmlGame}` to `<UniversalMouseOverlay>` so that native touch drags (slingshot tension, aim, and release) pass directly to the Cocos2D canvas.

**Step 3: Responsive Container Bounds**
- Replace fixed `min-h-[580px]` with `min-h-[220px] sm:min-h-[580px]` and `w-full aspect-video sm:aspect-auto`.

**Verification:**
- Inspect iframe in browser developer tools: verify direct `src="/games/angry-birds/index.html"` with no intermediate `about:srcdoc`.

---

### Task 3: Mobile-First Responsive Layout in GameTheaterPage

**Objective:** Clean up mobile clutter so the game is immediately visible and playable on smartphone screens.

**Files:**
- Modify: `src/components/GameTheaterPage.tsx`

**Step 1: Streamlined Mobile Header**
- Keep essential controls visible in a single compact row:
  - Game Title & Star Rating
  - Sound Toggle
  - Restart Button
  - Fullscreen Button
  - Like & Share Buttons
  - "Tools ▾" Toggle Button (`sm:hidden`)

**Step 2: Collapsible Desktop Tools Drawer**
- Group secondary desktop tools (`P2P Multiplayer`, `Save/Load`, `30s Clip`, `AI Coach`, `Speedrun`, `Gamepad`, `CRT Shaders`) inside a collapsible drawer on mobile:
  - Hidden by default on mobile screens (`< sm`).
  - Expands smoothly when the user taps "Tools ▾".
  - Remains permanently visible inline on desktop screens (`hidden sm:flex`).

**Step 3: Aspect-Ratio Container Optimization**
- On mobile portrait screens, set the game container to `w-full aspect-video` so it fills the screen width edge-to-edge with zero black letterbox bars.
- Add a floating mobile orientation badge / fullscreen button: "Tap to Play in Fullscreen".

**Verification:**
- Test viewport at 390×844 (iPhone 14) and 412×915 (Samsung Galaxy S22). The game canvas must be fully visible above the fold.

---

### Task 4: Cocos2D/Box2D Engine Mobile Touch & Audio Optimization

**Objective:** Ensure touch accuracy, full-width canvas scaling, and instant sound playback on mobile browsers.

**Files:**
- Modify: `public/games/angry-birds/index.html`
- Modify: `public/games/angry-birds/style.css`
- Modify: `public/games/angry-birds/game.js`

**Step 1: Dynamic Centered Scaling**
In `index.html` and `game.js`:
- Auto-calculate scale: `scale = Math.min(window.innerWidth / 1000, window.innerHeight / 600)`.
- Apply position via `style.left` and `style.top` with `transformOrigin: '0 0'` and `transform: 'scale(' + scale + ')'`. This ensures Cocos2D `getHTMLElementPosition()` touch coordinates align with screen taps.

**Step 2: Prevent Page Scroll on Touch Pull**
In `style.css`:
```css
html, body, #main_div, #viewport {
  touch-action: none;
  -webkit-touch-callout: none;
  user-select: none;
}
```

**Step 3: WebAudio Unlock**
- Add a transparent one-time touch listener on the play button to unlock the WebAudio Context before starting the game.

**Verification:**
- Verify touch drag pulls the slingshot smoothly without triggering mobile browser page scroll or pull-to-refresh.

---

### Task 5: Build, Verify, and Production Deployment

**Objective:** Verify clean compilation, deploy to production VPS (`stockwhisk`), and verify live headers.

**Commands:**
```bash
# 1. Clean build
cd /home/imon/Extra_SSD/arcade-hub && npm run build

# 2. Commit and push
git add .
git commit -m "fix(mobile): finalize responsive mobile layout, cache invalidation, and touch engine"
git push origin main

# 3. VPS Deployment
ssh stockwhisk "cd /root/arcade-hub && git pull origin main && docker compose up -d --build"

# 4. Verify live response
curl -I https://game.amarpdf.net/
curl -I https://game.amarpdf.net/sw.js
```

---

## Acceptance Criteria

1. **Mobile Layout:**
   - On mobile phones in portrait mode, the game canvas appears directly below the compact title bar without requiring vertical scrolling.
   - Desktop-only buttons are neatly tucked inside the "Tools ▾" collapsible drawer.
2. **Game Playability:**
   - Slingshot pulls and bird launches respond to touch drags without page jitter or scrolling.
   - Audio effects (stretch, launch, collision, pig pop) play on mobile.
3. **Cache Invalidation:**
   - Mobile users receive the updated version on reload without having to manually clear browser storage.
