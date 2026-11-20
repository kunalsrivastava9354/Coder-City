# 🌆 Coder City — Your Coding Journey, Reimagined in 3D

<p align="center">
  <strong>Every line of code builds something bigger.</strong>
</p>

<p align="center">
  An immersive, interactive 3D cyberpunk metropolis generated from your LeetCode submissions and GitHub contributions.
</p>

<p align="center">
  <a href="https://coder-city-kunal-srs-projects.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_LIVE_DEMO-Visit_Coder_City-8B5CF6?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://github.com/kunalsrivastava9354/Coder-City">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat&logo=typescript&logoColor=white">
  <img src="https://img.shields.io/badge/Three.js-3D-black?style=flat&logo=threedotjs">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white">
  <img src="https://img.shields.io/badge/License-Not_Specified-lightgrey?style=flat">
</p>

---

### 🌐 [Coder City Live](https://coder-city-kunal-srs-projects.vercel.app/)


---

## 📖 About The Project

**Coder City** is an interactive procedural 3D city visualization inspired by GitHub contribution graphs and LeetCode activity calendars.

What if your coding journey could become an actual city?

Instead of viewing traditional contribution charts and statistics, Coder City transforms your daily programming activity into a futuristic cyberpunk metropolis.

Every day represents a building. Every coding session contributes to the skyline. Your consistency determines how your city grows.

Connect your LeetCode or GitHub account, generate your personalized city, and explore your coding achievements through an immersive 3D driving experience.

**Your code builds your city. Your consistency builds your skyline.**

---

## ✨ Features

### 🏙️ 1. Procedural 3D City Generation

Transform 371 days of coding activity into a fully interactive 3D metropolis.

- 371-day activity grid (53 weeks × 7 days).
- Dynamically generated buildings based on daily activity.
- Organized city blocks and a central avenue.
- Detailed roads, streetlights, and architectural elements.
- Unique city skyline based on your coding history.

### 🏗️ 2. Dynamic Building Classification

Every building represents your daily coding activity.

| Daily Activity | Building Level | Visual Appearance |
|---|---|---|
| 0 | Empty Lot | Foundation Platform |
| 1–2 | Bronze Tech Lab | Emerald Green Building |
| 3–5 | Silver Engineering Hub | Blue Corporate Building |
| 6–9 | Gold Algo High-Rise | Violet Skyscraper |
| 10+ | Diamond Grand Citadel | Multi-tier Fuchsia Tower |

The more you code, the more impressive your skyline becomes!

### 🔗 3. Dual Platform Integration

**LeetCode Integration**

Connect your LeetCode profile and visualize:

- Daily submission activity.
- Total problems solved.
- Easy, Medium, and Hard problem breakdown.
- Current coding streak.
- Longest coding streak.
- Global ranking and reputation.

**GitHub Integration**

Connect your GitHub profile and visualize:

- Daily contribution activity.
- Total contributions.
- Current activity streak.
- Longest activity streak.
- Contribution history.

### 🎮 4. Interactive Driving Experience

Explore your city using a low-poly sports car.

- Vehicle acceleration and deceleration.
- Forward and reverse movement.
- Steering and turning physics.
- Spacebar handbrake.
- Building collision detection.
- Smooth wall sliding.
- City boundary restrictions.
- Mobile virtual joystick and brake controls.

### 🌅 5. Dynamic Environment

Experience your city in different atmospheric conditions.

- Interactive Day/Night cycle.
- Golden-hour sunset lighting.
- Cyberpunk nighttime atmosphere.
- Custom gradient skybox shader.
- Procedurally generated glowing windows.
- 1,000 twinkling stars.
- Drifting low-poly clouds with shadows.

### 🎥 6. Cinematic Camera System

Explore your metropolis from different perspectives.

- Free orbit camera.
- Camera rotation, pan, and zoom.
- Automated cinematic drone tours.
- Avenue Glide.
- Orbit Overview.
- Skyline Sweep.

### 📊 7. Interactive Building Inspector

Inspect individual buildings to explore your coding activity.

View:

- Activity date.
- Daily submission or contribution count.
- Building classification.
- Difficulty breakdown where available.

### 📸 8. Screenshot Export

Capture your generated city using high-resolution WebGL PNG snapshots without HUD overlays.

### 🎭 9. Simulated Demo Mode

Explore Coder City without connecting an account.

- Realistic synthetic coding activity.
- Organic activity patterns.
- Weekend contest-style activity surges.
- Sample profiles:
  - `neal_wu`
  - `tourist`
  - `torvalds`
  - `DemoChampion`

Demo mode allows you to experience the city generation system without requiring live platform data.

---

## 🖼️ Screenshots

<!-- Add your actual application screenshots here -->

<p align="center">
  <i>More screenshots coming soon.</i>
</p>

Recommended screenshots:

- Main application interface.
- Daytime city visualization.
- Cyberpunk nighttime environment.
- Interactive driving experience.
- LeetCode and GitHub activity visualization.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend UI |
| TypeScript | Type-safe development |
| Three.js | 3D rendering engine |
| React Three Fiber | React-based 3D scene management |
| React Three Drei | 3D utilities and helpers |
| Tailwind CSS 4 | UI styling |
| Vite 8 | Development and build tooling |
| Node.js | Backend runtime |
| Express 5 | Backend API server |
| Lucide React | Interface icons |
| LeetCode GraphQL | LeetCode profile and submission data |
| GitHub GraphQL API | GitHub contribution data |

---

## 🚀 Getting Started

Follow these instructions to run Coder City locally.

### Prerequisites

Make sure you have installed:

- Node.js (compatible with Vite 8).
- npm.
- Git.
- A modern browser with WebGL support.

### 1. Clone the Repository

```bash
git clone https://github.com/kunalsrivastava9354/Coder-City.git
```

### 2. Navigate to the Project

```bash
cd Coder-City
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables (Optional)

GitHub authentication is optional. You can configure a GitHub personal access token for authenticated GraphQL requests.

Create a `.env` file in the root directory:

```env
PORT=3001
