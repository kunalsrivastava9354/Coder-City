<div align="center">

# 🌆 Coder City

### Turn your LeetCode solves and GitHub commits into a drivable 3D cyberpunk skyline.

![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-r184-black?style=for-the-badge&logo=three.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white)

[Features](#-features) · [Quick Start](#-quick-start) · [Building Tiers](#-building-tiers) · [Controls](#-controls) · [Project Structure](#-project-structure) · [Credits](#-credits)

</div>

---

## ✨ Overview

**Coder City** is an interactive, procedural 3D city builder inspired by [ranjeet22/github-city](https://github.com/ranjeet22/github-city). Every day of your coding history becomes a building: the more problems you solve or commits you push, the taller the tower.

Drive down the **Avenue of Algorithms**, inspect any day, flip between sunset and neon night, or sit back and let the cinematic drone tour show off your streak.

---

## 🌟 Features

### 🏙️ 371-Day Procedural Skyline
- **371-day grid**: 53 weeks × 7 days of activity laid out in a 3D grid centered at `[0, 0, 0]`.
- **Avenue of Algorithms**: a wide central avenue splits the North and South blocks, lined with streetlights and road markings.
- **Buildings scale with activity**: each day's solve/commit count decides its building class (see [Building Tiers](#-building-tiers)).

### ⚡ Three Data Sources

| Mode | What you get |
|------|--------------|
| **LeetCode** | Live GraphQL fetch of your `submissionCalendar`, with total solved, acceptance stats, current and longest streak, and Easy / Medium / Hard breakdown pills. |
| **GitHub** | Live commit calendar with streaks and total contributions. |
| **Demo (offline)** | Instant simulated data with organic activity waves and contest-weekend surges. Try the sample profiles `neal_wu`, `tourist`, `torvalds`, or `DemoChampion`. |

### 🚗 Drivable Vehicle
- Low-poly sports car with acceleration, friction, a **Spacebar handbrake**, steering yaw, and reverse gear.
- **Smooth AABB sliding collisions**: the car glides along building walls instead of sticking.
- **Platform boundaries** keep you inside the city perimeter.
- **Mobile touch controls** with a virtual joystick and brake button.

### 🎥 Atmosphere & Cameras
- **Day / night cycle**: toggle between sunset golden hour and glowing neon twilight.
- **Skybox shader**: a 3-stop vertical gradient that blends day into night.
- **Glowing windows**: procedural canvas textures that light up warm amber after dark.
- **Starfield & clouds**: 1,000 twinkling stars and drifting low-poly clouds that cast shadows.
- **Free orbit camera**: rotate, pan, and zoom anywhere.
- **Cinematic drone tour**: auto-pilot along three paths: *Avenue Glide*, *Orbit Overview*, and *Skyline Sweep*.
- **Building inspector**: hover or click a building to see its date, solve count, difficulty breakdown, and tier.
- **PNG snapshot**: export a high-res WebGL screenshot with no HUD overlays.

---

## 🏗️ Building Tiers

| Daily solves / commits | Building | Look |
|:---:|---|---|
| **0** | Empty Lot | Foundation pad with curb detailing |
| **1–2** | 🟢 Bronze Tech Lab (small) | Emerald green tech boutique |
| **3–5** | 🔵 Silver Engineering Hub (medium) | Blue corporate office with rooftop HVAC units |
| **6–9** | 🟣 Gold Algo High-Rise (skyscraper) | Violet tower with a setback upper tier and cyan neon facade strips |
| **10+** | 💎 Diamond Grand Citadel (mega tower) | Fuchsia landmark with multi-tier setbacks, a communications spire, and a pulsing red aviation beacon |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (current LTS recommended) and npm
- A WebGL-capable browser

### Install
```bash
git clone <your-repo-url> leetcode-city
cd leetcode-city
npm install
```

### Development (Express backend + Vite frontend)
```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend API proxy (Express) | http://localhost:3001 |

### Production build
```bash
npm run build
npm start
```
Then open http://localhost:3001/.

---

## 🎮 Controls

| Input | Action |
|-------|--------|
| Drive keys | Accelerate, brake / reverse, and steer the car |
| `Space` | Handbrake |
| Mouse (orbit mode) | Rotate, pan, and zoom the camera |
| Hover / click a building | Open the building inspector |
| Touch joystick + brake button | Drive on mobile |

---

## 🧱 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **3D engine**: Three.js (procedural geometry, custom skybox shader, canvas-generated textures)
- **Backend**: Express 5 proxy for the LeetCode (GraphQL) and GitHub APIs, which avoids browser CORS issues
- **Audio**: background synthwave music manager

---

## 📂 Project Structure

```
leetcode-city/
├── dev.js               # Dev orchestrator: launches Express and Vite together
├── server.js            # Express proxy for the LeetCode & GitHub APIs
├── vite.config.ts       # Vite build & proxy config
├── index.html           # Entry HTML
├── public/              # Static assets, music, icons
└── src/
    ├── assets/          # Icons and images
    ├── game/
    │   ├── Car.tsx          # Vehicle physics, collisions, controls
    │   └── CityScene.tsx    # 3D canvas, procedural city, HUD, shaders
    ├── pages/
    │   └── Home.tsx         # Platform selector, username input, heatmap preview
    ├── services/
    │   ├── api.ts           # LeetCode & GitHub services + mock data generator
    │   └── audio.ts         # Synthwave music manager
    ├── App.tsx          # Routing & state management
    ├── main.tsx         # React root
    └── index.css        # Tailwind styles
```

---

## 🤝 Contributing

Ideas, bug reports, and pull requests are welcome. Fork the repo, create a branch, and open a PR describing your change.

---

## 🙏 Credits

Inspired by [ranjeet22/github-city](https://github.com/ranjeet22/github-city). Built with [Three.js](https://threejs.org/), [React](https://react.dev/), and [Vite](https://vite.dev/).

<div align="center">

**Keep solving. Keep shipping. Watch your city grow. 🌃**

</div>
