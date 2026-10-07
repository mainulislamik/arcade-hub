# 🕹️ Arcadex (Arcade Hub)

A high-octane, zero-login, client-side heavy web arcade platform. Built for instant casual gaming with 0% server computation load.

## 🚀 Key Architectural Pillars

- **Zero Server Compute:** All game loops, rendering (Canvas/WebGL), physics calculations, and procedural sound generation (Web Audio Synthesizer) run 100% inside the user's browser.
- **No Login / Guest Ready:** Zero registration walls. High scores, favorites, play history, and achievements are auto-saved locally via browser `localStorage`.
- **Procedural 8-Bit Audio:** Sound effects generated on the fly via Web Audio API oscillators — zero external sound file downloads and zero audio lag.
- **Ultra-Light Docker Footprint:** Packaged in a multi-stage Alpine Nginx image consuming under 15MB RAM and near-zero CPU.
- **10 Built-In Classic & Modern Games:**
  1. 🐍 **Retro Snake 2.0** (Speed boosts, score multipliers, retro scanlines)
  2. 🧩 **2048 Master** (Smooth animations, undo move, high score tracking)
  3. 🚀 **Galaxy Defender** (Space invaders bullet-hell arcade, particle explosions)
  4. 🐦 **Flappy Cyber Bird** (Physics jump, responsive tap/click controls)
  5. 🧱 **Cyber Breakout** (Brick breaker, ball physics, multiball powerups)
  6. 🔲 **Block Matrix (Tetris)** (Ghost projection, 7-piece rotation, line clears)
  7. 🟡 **Cyber Pac Runner** (Maze runner, ghost AI, energy powerups)
  8. 🃏 **Matrix Memory Flip** (Cyberpunk memory matching cards with timer)
  9. 💣 **Cyber Minesweeper** (9x9 grid, first-click safe guarantee, flag mode)
  10. 🏓 **Neon Cyber Pong** (1P vs AI or 2P local couch mode with curving physics)

## 🐳 Docker Run Instructions

### 1. Build & Start with Docker Compose
```bash
cd /home/imon/Extra_SSD/arcade-hub
docker compose up -d --build
```

### 2. Access the Application
Open your browser at:
`http://localhost:3080` (or `http://<your-ip>:3080`)

### 3. Check Logs & Health Status
```bash
docker compose ps
docker logs -f arcadex_game_hub
```
