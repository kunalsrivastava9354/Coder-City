# 🌆 Coder City — Turn Your Coding Journey Into a 3D Metropolis

<p align="center">
  <strong>Your coding progress. Your city. Your story.</strong>
</p>

<p align="center">
  An immersive, interactive 3D visualization of your LeetCode submissions and GitHub contributions.
</p>

<p align="center">
  <a href="https://github.com/kunalsrivastava9354/Coder-City">GitHub Repository</a> •
  <a href="#-features">Features</a> •
  <a href="#-installation--setup">Installation</a> •
  <a href="#-controls">Controls</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 📖 About The Project

**Coder City** is an interactive, procedural 3D city visualization that transforms your daily coding activity into a living cyberpunk metropolis.

Instead of looking at traditional contribution graphs and statistics, Coder City represents your programming journey through an immersive cityscape where every day becomes a building, every coding session contributes to the skyline, and your consistency shapes the entire metropolis.

Connect your **LeetCode** or **GitHub** account, explore your coding history, drive through your achievements, and watch your dedication turn into an ever-growing digital city.

Whether you're an algorithm enthusiast or an open-source contributor, Coder City gives your coding journey a completely new perspective.

## ✨ Features

### 🏙️ 1. Procedural 3D City Generation

- Visualizes **371 days of coding activity** (53 weeks × 7 days).
- Converts daily submissions and contributions into individual buildings.
- Dynamically adjusts building size and architecture based on activity.
- Features a central avenue, detailed roads, streetlights, and organized city blocks.
- Generates a unique skyline based on your coding history.

### 🏆 2. Dynamic Building Levels

Every building represents your daily coding activity.

| Daily Activity | Building Type | Visual Style |
|---|---|---|
| 0 | Empty Lot | Foundation platform |
| 1–2 | Bronze Tech Lab | Small emerald building |
| 3–5 | Silver Engineering Hub | Blue corporate building |
| 6–9 | Gold Algo High-Rise | Violet skyscraper |
| 10+ | Diamond Grand Citadel | Multi-tier fuchsia landmark |

The more you code, the more impressive your city becomes!

### 🔗 3. Dual Platform Integration

**LeetCode Mode**
- Fetches live submission calendar data.
- Displays total problems solved.
- Shows Easy, Medium, and Hard problem breakdowns.
- Displays current and longest coding streaks.
- Provides acceptance rate, ranking, and reputation statistics when available.

**GitHub Mode**
- Retrieves GitHub contribution activity.
- Visualizes daily contributions as buildings.
- Displays total contributions.
- Tracks current and longest activity streaks.
- Supports GitHub GraphQL integration with an optional personal access token.

### 🎮 4. Interactive Driving Experience

Explore your coding city with an interactive low-poly sports car.

- Real-time vehicle acceleration and deceleration.
- Forward and reverse movement.
- Smooth steering and turning physics.
- Spacebar handbrake.
- Collision detection with buildings.
- Smooth wall sliding.
- Automatic city boundary restrictions.
- Mobile-friendly virtual joystick and brake controls.

### 🌅 5. Dynamic Environment & Atmosphere

Experience your city in different atmospheric conditions.

- Interactive Day/Night cycle.
- Golden-hour sunset lighting.
- Neon-lit cyberpunk nighttime environment.
- Custom skybox gradient shader.
- Procedurally generated glowing building windows.
- 1,000 twinkling stars.
- Drifting low-poly clouds with shadows.

### 🎥 6. Advanced Camera & Cinematic Modes

- Free orbit camera with rotation, pan, and zoom.
- Cinematic drone tours.
- Three automated camera paths:
  - Avenue Glide
  - Orbit Overview
  - Skyline Sweep
- Interactive building inspection.
- Explore your city from different perspectives.

### 📊 7. Interactive Activity Inspection

Hover over or select any building to explore its activity details.

View:
- Activity date.
- Daily solve or contribution count.
- Building classification.
- Difficulty breakdown (LeetCode).
- Individual daily progress.

### 📸 8. Screenshot Export

Capture your generated city using high-resolution WebGL PNG snapshots without including HUD overlays.

### 🎭 9. Demo Mode

Explore Coder City without connecting an account.

- Generates realistic sample coding activity.
- Simulates organic activity patterns.
- Includes contest-style weekend activity surges.
- Provides sample profiles such as `neal_wu`, `tourist`, `torvalds`, and `DemoChampion`.
- Works without live platform data.

---

## 🛠️ Tech Stack

Coder City is built using modern frontend technologies and real-time 3D rendering tools.

| Technology | Purpose |
|---|---|
| React 19 | Frontend UI and component architecture |
| TypeScript | Type-safe development |
| Three.js | 3D graphics and rendering |
| React Three Fiber | React-based 3D scene management |
| React Three Drei | 3D utilities and helpers |
| Tailwind CSS 4 | Styling and UI design |
| Vite 8 | Development server and build tooling |
| Node.js | Backend runtime |
| Express 5 | Backend API and proxy server |
| LeetCode GraphQL | LeetCode profile and submission data |
| GitHub GraphQL API | GitHub contribution data |
| Lucide React | Interface icons |

---

## 🚀 Installation & Setup

Follow these steps to run Coder City locally.

### Prerequisites

Make sure you have the following installed:

- Node.js (compatible with Vite 8).
- npm.
- Git.
- A modern browser with WebGL support.

### 1. Clone the Repository

```bash
git clone https://github.com/kunalsrivastava9354/Coder-City.git
```

### 2. Navigate to the Project Directory

```bash
cd Coder-City
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables (Optional)

GitHub authentication is optional. The backend can use a GitHub personal access token when provided, or fall back to the public contributions API.

Create a `.env` file in the project root:

```env
PORT=3001
GITHUB_TOKEN=your_github_personal_access_token
```

For GitHub GraphQL access, generate a personal access token with the appropriate permissions to read public profile and contribution information.

**Important:** Never commit your `.env` file or expose your personal access token publicly.

### 5. Start the Development Server

```bash
npm run dev
```

The development environment starts both the frontend and backend.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3001 |

Open the frontend URL in your browser to explore Coder City.

---

## 🏗️ Production Build

To generate an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

Open:

```text
http://localhost:3001
```

The Express server serves the production frontend and handles API requests.

### Additional Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts frontend and backend development servers |
| `npm run build` | Type-checks and builds the production application |
| `npm start` | Starts the production Express server |
| `npm run lint` | Runs ESLint |
| `npm run preview` | Starts the Vite preview server |

---

## 🎮 Controls

### Desktop Controls

| Key | Action |
|---|---|
| `W` / `↑` | Accelerate forward |
| `S` / `↓` | Reverse |
| `A` / `←` | Steer left |
| `D` / `→` | Steer right |
| `Space` | Handbrake |

### Camera Controls

| Action | Function |
|---|---|
| Left-click + Drag | Rotate camera |
| Mouse Wheel | Zoom in / out |

### Mobile Controls

- Use the virtual joystick to accelerate, reverse, and steer.
- Use the on-screen brake button to slow down or stop.

---

## 📂 Project Structure

```text
Coder-City/
│
├── Logo/                       # Project branding and logo assets
│
├── Music/                      # Audio assets
│
├── public/                     # Static assets and public resources
│
├── src/
│   │
│   ├── assets/                 # Images, icons, and other assets
│   │
│   ├── game/
│   │   ├── Car.tsx             # Vehicle physics and driving controls
│   │   └── CityScene.tsx       # Main 3D city, rendering, and shaders
│   │
│   ├── pages/
│   │   └── Home.tsx            # Main interface and platform selection
│   │
│   ├── services/
│   │   ├── api.ts              # Platform APIs and demo data generation
│   │   └── audio.ts            # Background audio management
│   │
│   ├── App.tsx                 # Application state and routing
│   ├── main.tsx                # React application entry point
│   └── index.css               # Global styles
│
├── dev.js                      # Development server orchestrator
├── server.js                   # Express backend and API proxy
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## ⚙️ How It Works

Coder City follows a simple data-to-visualization pipeline.

**1. User Input**

Select a platform (LeetCode or GitHub) and enter your username.

**2. Data Retrieval**

The backend retrieves the user's activity through the respective platform APIs.

**3. Activity Processing**

Daily activity is mapped into a 371-day calendar grid. The application calculates streaks, activity counts, and building classifications.

**4. Procedural Generation**

Each day is converted into a corresponding 3D building based on its activity level.

**5. Interactive Visualization**

React Three Fiber and Three.js render the city, allowing users to drive, explore, inspect buildings, and experience dynamic environmental effects.

**6. Demo Fallback**

Demo mode generates synthetic activity data locally, allowing users to experience the application without external API requests.

---

## 🔐 API & Data Handling

Coder City uses a Node.js and Express backend to retrieve external platform data.

### Available API Endpoints

| Endpoint | Description |
|---|---|
| `/api/leetcode/:username` | Retrieves LeetCode profile and submission statistics |
| `/api/github/:username` | Retrieves GitHub contribution statistics |

### Caching

The backend implements an in-memory cache with a 10-minute time-to-live (TTL) to reduce repeated external API requests.

### GitHub Authentication

GitHub data retrieval supports:

1. `GITHUB_TOKEN` environment variable.
2. GitHub CLI authentication as a fallback.
3. Public GitHub contributions API as an alternative.

No GitHub token is required when using the public contributions API.

---

## 💡 Use Cases

- Visualize your coding consistency over time.
- Turn programming achievements into an interactive experience.
- Explore your LeetCode problem-solving journey.
- Showcase GitHub contribution activity in a creative way.
- Experience procedural 3D environments.
- Make daily coding progress more engaging and rewarding.

---

## 🗺️ Future Improvements

Potential areas for future development include:

- [ ] More coding platform integrations.
- [ ] Historical city comparison.
- [ ] Customizable building themes and architectural styles.
- [ ] More vehicles and driving experiences.
- [ ] Multiplayer city exploration.
- [ ] Enhanced analytics and coding insights.
- [ ] Custom city environments.
- [ ] Additional camera and cinematic modes.
- [ ] User-configurable city layouts.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome!

If you would like to contribute:

1. Fork the repository.
2. Create a new feature branch.

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes.
4. Run the available checks.

```bash
npm run lint
npm run build
```

5. Commit your changes.

```bash
git commit -m "feat: add your feature"
```

6. Push your branch.

```bash
git push origin feature/your-feature-name
```

7. Open a Pull Request.

Please ensure your code is readable, maintainable, and consistent with the existing project structure.

---

## 📜 License

No license is currently specified in the repository.

Please contact the repository owner regarding permissions for using, modifying, or distributing this project.

---

## ⭐ Support the Project

If you find Coder City interesting or useful:

- Give the repository a ⭐ Star.
- Fork the project and experiment with it.
- Share it with fellow developers.
- Report bugs and suggest new features.
- Contribute improvements through Pull Requests.

Every contribution helps make the project better!

---

<p align="center">
  <strong>Built for developers who believe every line of code builds something bigger.</strong>
</p>

<p align="center">
  🌆 <strong>Keep Coding. Keep Building. Keep Growing.</strong> 🚀
</p>

<p align="center">
  <a href="https://github.com/kunalsrivastava9354/Coder-City">Coder City on GitHub</a>
</p>
