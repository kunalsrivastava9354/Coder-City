# 🌆 Coder City (3D Coding Skyline)

An interactive, procedural 3D city builder inspired by [ranjeet22/github-city](https://github.com/ranjeet22/github-city), designed to transform **daily LeetCode problem submissions and GitHub commits** into a cyberpunk 3D metropolis. Drive through the avenues of your streak, inspect individual days, toggle between day and night cycles, and explore your coding journey.

![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-r184-black?style=for-the-badge&logo=three.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white)

---

## 🌟 Key Features

### 🏙️ 371-Day Procedural Skyline
- **371-Day Grid**: Maps 53 weeks × 7 days of daily problem submissions or GitHub commits into an organized 3D grid layout centered at `[0, 0, 0]`.
- **Avenue of Algorithms**: A wide central avenue separating the North Block and South Block with illuminated streetlights and road markings.
- **Dynamic Building Classes based on Daily Solves/Commits**:
  * **Empty Lot (0 solves)**: Foundation pad with curb detailing.
  * **Bronze Tech Lab / Small Building (1–2 solves)**: Emerald green tech boutique.
  * **Silver Engineering Hub / Medium Building (3–5 solves)**: Blue corporate office with rooftop HVAC systems.
  * **Gold Algo High-Rise / Skyscraper (6–9 solves)**: Violet high-rise with setback upper tier and cyan neon facade strips.
  * **Diamond Grand Citadel / Mega Tower (10+ solves)**: Fuchsia/Pink landmark with multi-tier setbacks, communications spire, and pulsing red aviation beacon.

### ⚡ Dual Platform Support: LeetCode & GitHub
- **LeetCode Mode**:
  - Live GraphQL retrieval of user daily submission calendar (`submissionCalendar`).
  - Displays total problems solved, acceptance stats, current streak, longest streak, and Easy / Medium / Hard difficulty breakdown pills.
- **GitHub Mode**:
  - Live commit calendar retrieval with streaks and total contributions.
- **Simulated Demo Mode**:
  - Instant offline demo with organic activity waves, contest weekend surges, and sample profiles (`neal_wu`, `tourist`, `torvalds`, `DemoChampion`).

### 🚗 Drivable Vehicle Simulation
- Low-poly sports car with realistic physics (acceleration, friction deceleration, Spacebar handbrake, steering yaw, reverse gear).
- **Smooth AABB Sliding Collisions**: Glides smoothly along building walls rather than sticking.
- **Platform Boundaries**: Keeps the car safely within the city perimeter.
- **Mobile Touch Controls**: Virtual joystick and brake button on touchscreens.

### ☀️ Atmospheric & Camera Modes
- **Day / Night Dynamic Cycle**: Toggle between sunset golden hour and glowing neon twilight.
- **Skybox Shader**: 3-stop vertical gradient shader blending between day and night.
- **Night Glow Windows**: Procedural canvas window textures glowing warm amber in the dark.
- **Procedural Starfield & Drifting Clouds**: 1,000 twinkling stars and low-poly clouds casting shadows.
- **Free Orbit Camera**: Rotate, pan, and zoom anywhere in the city.
- **Cinematic Drone Tour**: Auto-pilots through 3 cinematic paths (*Avenue Glide*, *Orbit Overview*, *Skyline Sweep*).
- **Interactive Building Inspector**: Hover or click any building to view its date, solve count, difficulty breakdown, and tier!
- **WebGL PNG Snapshot**: Export high-res screenshots without HUD overlays.

---

## 🚀 Running the Project

### Development Mode (Both Backend & Vite Frontend)
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API Proxy: `http://localhost:3001`

### Production Build & Serve
```bash
npm run build
npm start
```
Open `http://localhost:3001/` in your browser.

---

## 📂 Project Structure

```
leetcode-city/
├── dev.js               # Dev orchestrator launching both Express & Vite
├── server.js            # Express backend proxy for LeetCode & GitHub APIs
├── vite.config.ts       # Vite build & proxy config
├── index.html           # Main entry HTML
├── public/              # Static assets, music, icons
├── src/
│   ├── assets/          # Icons and images
│   ├── game/
│   │   ├── Car.tsx          # Vehicle physics, collisions, controls
│   │   └── CityScene.tsx    # 3D Canvas, procedural city, HUD, shaders
│   ├── pages/
│   │   └── Home.tsx         # Platform selector, username input, heatmap preview
│   ├── services/
│   │   ├── api.ts           # LeetCode & GitHub data services & mock generator
│   │   └── audio.ts         # Background synthwave music manager
│   ├── App.tsx          # Main routing & state manager
│   ├── main.tsx         # React root
│   └── index.css        # Tailwind CSS styles
```
=======
# Coder-City