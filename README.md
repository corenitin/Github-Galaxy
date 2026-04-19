# ✦ GitHub Galaxy

> Every GitHub repository is a planet. Every commit builds its mass. Watch your coding journey become a living, breathing galaxy.

---

## What it does

- **GitHub OAuth login** — authenticate with your GitHub account
- **Auto-syncs repos** — all your repositories become planets
- **Planet size** = commit count (more commits = bigger planet)
- **Planet type** by status:
  - 🔵 Blue = Active project
  - 🟢 Green + ring = Deployed to production
  - 🟠 Orange = Archived
  - 🟣 Purple = Forked repo
- **Orbiting dots** = recent commit activity
- **Moons** = forks of your repository
- **Pan & zoom** — explore your galaxy freely
- **Public galaxy** — share `yourdomain.com/galaxy/username` with anyone

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, HTML5 Canvas, React Router |
| Backend     | Node.js, Express                    |
| Database    | MongoDB + Mongoose                  |
| Auth        | GitHub OAuth 2.0, Passport.js, JWT  |
| Data        | GitHub REST API v3                  |
| Styling     | Custom CSS, Space Mono + Syne fonts |

---

## Setup

### 1. Clone & install dependencies

```bash
git clone <your-repo-url>
cd github-galaxy
npm run install:all
```

### 2. Create a GitHub OAuth App

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/applications/new)
2. Fill in:
   - **Application name**: GitHub Galaxy
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/auth/github/callback`
3. Copy your **Client ID** and **Client Secret**

### 3. Configure environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/github-galaxy
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
JWT_SECRET=any_random_long_string
SESSION_SECRET=another_random_string
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB

```bash
# Mac (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 mongo
```

### 5. Run the app

```bash
# From root — starts both server and client
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## Project Structure

```
github-galaxy/
├── server/
│   ├── index.js                  # Express app entry
│   ├── models/
│   │   ├── User.js               # User schema (GitHub profile)
│   │   └── Planet.js             # Planet/repo schema
│   ├── routes/
│   │   ├── auth.js               # GitHub OAuth routes
│   │   ├── galaxy.js             # Galaxy sync & fetch routes
│   │   └── user.js               # User profile routes
│   ├── controllers/
│   │   ├── githubService.js      # GitHub API wrapper
│   │   └── galaxyBuilder.js      # Repo → Planet position logic
│   └── middleware/
│       ├── passport.js           # GitHub OAuth strategy
│       └── auth.js               # JWT auth middleware
│
└── client/src/
    ├── App.js                    # Routes
    ├── context/
    │   └── AuthContext.js        # Auth state management
    ├── hooks/
    │   └── useGalaxy.js          # Galaxy data + sync hook
    ├── pages/
    │   ├── LandingPage.js        # Home/login page
    │   ├── GalaxyPage.js         # Main galaxy dashboard
    │   ├── AuthCallback.js       # OAuth callback handler
    │   └── PublicGalaxy.js       # Shareable public view
    ├── components/
    │   ├── galaxy/
    │   │   ├── GalaxyCanvas.js   # Core canvas renderer
    │   │   ├── PlanetTooltip.js  # Hover tooltip
    │   │   ├── PlanetPanel.js    # Click detail panel
    │   │   └── GalaxyStats.js    # Left sidebar stats
    │   └── ui/
    │       └── Navbar.js         # Top navigation
    └── styles/
        └── global.css            # Global design tokens
```

---

## API Endpoints

| Method | Path                         | Auth     | Description                    |
|--------|------------------------------|----------|--------------------------------|
| GET    | `/auth/github`               | —        | Initiate GitHub OAuth          |
| GET    | `/auth/github/callback`      | —        | OAuth callback, issues JWT     |
| GET    | `/auth/me`                   | JWT      | Get current user               |
| POST   | `/auth/logout`               | JWT      | Log out                        |
| GET    | `/api/galaxy`                | JWT      | Get user's galaxy + planets    |
| POST   | `/api/galaxy/sync`           | JWT      | Sync repos from GitHub (SSE)   |
| GET    | `/api/galaxy/planet/:id`     | JWT      | Get single planet detail       |
| GET    | `/api/galaxy/public/:username` | —      | Public galaxy view             |
| GET    | `/api/user/profile`          | JWT      | Get user profile               |
| PUT    | `/api/user/galaxy-name`      | JWT      | Update galaxy name             |

---

## Galaxy mechanics

### Planet sizing
```
planetSize = 8 + sqrt(commitCount / maxCommits) × 32
```
Ranges from 8px (tiny) to 40px (massive), on a square-root scale so the biggest repos don't dwarf everything else.

### Orbital positioning
Uses the **golden angle** (≈137.5°) for even distribution — the same math flowers use to arrange petals. This prevents clustering and fills the galaxy naturally.

### Orbit speed
```
orbitSpeed = 0.0003 + (1 / orbitRadius) × 0.02
```
Inner planets orbit faster (like our solar system). Outer planets crawl slowly.

### Solar systems
Repos sharing the same primary language are grouped into the same "solar system" — they orbit in a similar zone of the galaxy.

---

## Deployment

### Production environment variables (server)
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...  # MongoDB Atlas
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=...               # Long random string
SESSION_SECRET=...
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://api.yourdomain.com
```

### Build frontend
```bash
cd client
npm run build
# Serve the build/ folder from Express in production
```

### Recommended hosting
- **Backend**: Railway, Render, or Fly.io
- **Database**: MongoDB Atlas (free tier works)
- **Frontend**: Vercel or Netlify

---

## Future ideas

- [ ] 3D galaxy using Three.js / React Three Fiber
- [ ] Contribution heatmap as planet texture/surface
- [ ] Galaxy events: first commit = star birth animation
- [ ] Compare galaxies with friends
- [ ] Commit streak = comet trail
- [ ] Stars in background = GitHub stars you've given
- [ ] Supernova animation when a repo is deleted
- [ ] Constellation lines connecting related repos (same language / topic)
