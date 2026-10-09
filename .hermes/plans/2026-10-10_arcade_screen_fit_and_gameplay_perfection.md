# Perfect Screen Scaling, Aspect Ratio & Gameplay Engine Plan

> **Goal:** Deliver flawless full-screen/theater scaling, responsive aspect ratio management (Auto, 16:9, 4:3, 3:4/9:16, Fullscreen), crisp high-DPI pixel rendering, and high-fidelity physics/controls across all Arcadex games (Nokia J2ME, Symbian S60, EmulatorJS, and 3D WebGL).

---

## 1. Problem Diagnosis & Requirements

1. **Screen Fitting & Letterboxing:**
   - Currently, vertical games (like Nokia J2ME 240x320) and retro games (4:3) get constrained by static `aspectRatio` wrappers that don't intelligently utilize the available viewport height/width.
   - Selecting "Auto" / "16:9" / "4:3" / "9:16" in the theater controls should dynamically stretch/fit the game canvas with integer pixel-perfect scaling, eliminating awkward margins.

2. **Full-Screen & Theater Immersion:**
   - When entering Theater Mode or Browser Fullscreen (F11 / Maximize button), the canvas should expand to maximum viewport dimensions with zero scrollbars, centered HUD, and responsive touch/keypad positioning.

3. **Physics, Responsiveness & Controls:**
   - Smooth delta-time (`requestAnimationFrame` with fixed timestep accumulator) so gameplay speed is 100% consistent across 60Hz, 120Hz, and 144Hz monitors.
   - Complete input bindings: Keyboard (WASD, Arrow Keys, Space, Enter, Numpad 1-9), Gamepad API (D-pad, Analog, Buttons A/B/X/Y), and On-Screen Touch Controls (Mobile Virtual D-Pad / Keypad).

4. **Multi-Format Architecture:**
   - **Java ME (.JAR):** High-resolution 240x320 & 480x640 crisp Canvas scaling with authentic Bounce / retro physics, squash-stretch animations, sound chimes, and full stage transitions.
   - **Symbian OS (.SIS):** S60 352x416 / 240x320 dual-layer Crown Mech combat with directional aiming and smooth scrolling.
   - **Nintendo / Retro (.GBA, .NES, .SNES):** Integer pixel scaling (2x, 3x, 4x) with CRT scanline filters and EmulatorJS integration.

---

## 2. Step-by-Step Implementation Tasks

### Task 1: Responsive Aspect Ratio & Viewport Auto-Fit Engine
- **Files to Modify:**
  - `src/components/GameTheaterPage.tsx`
  - `src/components/player/SandboxedGamePlayer.tsx`
  - `src/components/player/UniversalWasmRunner.tsx`
- **Actions:**
  - Implement a dynamic `fitMode` calculation:
    - `auto`: Automatically detects game native resolution (e.g. 240x320 for J2ME -> 3:4; 256x224 for NES -> 8:7; 1920x1080 for 3D WebGL -> 16:9) and fits max available theater height (`calc(100vh - 180px)`).
    - `16:9`: Widescreen stretch/pillarbox mode.
    - `4:3`: Classic CRT arcade mode.
    - `9:16` / `3:4`: Mobile phone vertical screen mode.
    - `fill`: Full-viewport fill mode (no letterboxing).
  - Add smooth CSS transition with `object-fit: contain` and CSS `image-rendering: pixelated` for ultra-crisp retro visuals on Retina/4K displays.

### Task 2: High-DPI Canvas Rendering & Integer Pixel Scaling
- **Files to Modify:**
  - `src/components/player/UniversalWasmRunner.tsx`
  - `src/components/games/*.tsx`
- **Actions:**
  - Scale internal rendering canvas by `window.devicePixelRatio` for razor-sharp text, UI badges, and vectors.
  - Implement pixel-perfect nearest-neighbor scaling for retro sprites.

### Task 3: Game Physics, Frame Pacing & Timestep Perfection
- **Files to Modify:**
  - `src/components/player/UniversalWasmRunner.tsx` (J2ME and SIS canvas engines)
- **Actions:**
  - Use fixed timestep delta physics (`1/60s`) with linear interpolation (`alpha`) to eliminate stutter on high refresh rate screens (90Hz / 120Hz / 144Hz / 240Hz).
  - Refine Nokia Bounce Ball physics:
    - Variable jump height based on key press duration.
    - Realistic air resistance and rolling friction on grass/stone.
    - Rubber bouncer trampoline bounce momentum preservation.
    - Water buoyancy and ripple splash particles.
    - Destructive breakable stone block physics when ball is heavy/inflated.

### Task 4: Unified Multi-Input Control System (Keyboard, Gamepad, Touch)
- **Files to Modify:**
  - `src/components/player/UniversalWasmRunner.tsx`
  - `src/hooks/useGamepad.ts`
  - `src/components/player/GamepadHUD.tsx`
- **Actions:**
  - Keyboard: Full support for Arrow keys, WASD, Numpad `1-9`, `Space`, `Enter`, `Shift`, `Escape`.
  - Gamepad API: Automatic D-pad, Analog stick, and buttons A/B/X/Y mapping with vibration/haptic feedback.
  - Mobile Touch: Clean, translucent on-screen directional pad and action buttons for phones and tablets, dockable at bottom or sides.

### Task 5: Audio Synthesis & Sound Effects Fidelity
- **Files to Modify:**
  - `src/components/player/UniversalWasmRunner.tsx`
  - `src/utils/soundEngine.ts`
- **Actions:**
  - Low-latency Web Audio API synthesizer with GainNode master volume controls.
  - Authentic Nokia Series 40 / 3310 polyphonic ring chimes, bounce tones, checkpoint fanfares, and sound toggle persistence.

---

## 3. Verification & Testing Plan

1. **Visual & Responsive Testing:**
   - Switch between **Auto**, **16:9**, **4:3**, **9:16**, and **Fullscreen** to verify the game fills the viewport properly without overflow or unwanted letterbox distortion.
2. **Gameplay & Physics Testing:**
   - Test rolling, jumping, trampoline bouncing, water swimming, and spike collisions at 60 FPS.
3. **Controls Testing:**
   - Test with Arrow Keys, WASD, on-screen Nokia keypad buttons, and USB/Bluetooth gamepad.
4. **Build Verification:**
   - Execute `npm run build` and rebuild Docker container on port `3080`.
