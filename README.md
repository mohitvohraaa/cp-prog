# CP PROG 🎮

> A2OJ Ladder Tracker for Codeforces Rating < 1300

**Live Demo:** [cp-prog.vercel.app](https://cp-prog.vercel.app)

---

## Why This Exists

I was grinding the A2OJ <1300 ladder and got tired of tracking progress in a spreadsheet. I wanted something that felt like a game — motivating, beautiful, and actually fun to use.

So I built it.

The result is a cyber-tactical themed tracker with XP, levels, achievements, streak tracking, a focus timer, and a heatmap. Think Solo-Leveling meets Codeforces.

---

## How I Built It

### Opencode Setup

This project was built entirely with **Opencode** — an AI coding assistant that works through conversational, voice-first interactions.

Here's how it went:

1. **Broken Start** — The project had a failing build. 3 components were missing (HeroSection, LadderView, AnalyticsView) and a dependency (`clsx`) wasn't installed.

2. **Iterative Workflow** — I described what I wanted out loud, Opencode executed:
   - "Create a hero section with animated stats and a progress ring"
   - "Build a searchable problem ladder with checkboxes and filters"
   - "Add an analytics dashboard with heatmap and achievements"

3. **Feature Phase** — We added things layer by layer:
   - Phase 1: Core UI (hero, ladder, analytics)
   - Phase 2: Gamification (XP, 23 achievements, E→S rank system)
   - Phase 3: Focus Timer (custom duration Pomodoro)
   - Phase 4: Polish (animations, keyboard shortcuts, command palette)

4. **Deployment** — One build command, deployed to Vercel automatically.

### Model Used

- **minimax-m2.5-free** — Fast, efficient, great context awareness for React/Next.js projects.

### Design Philosophy

Used the `frontend-design` skill aggressively:
- ❌ No generic gradients + Inter font
- ❌ No boring dashboard feel
- ✅ Cyber-tactical aesthetic (dark terminal + neon cyan/green)
- ✅ Monospace fonts for stats
- ✅ Staggered animations, micro-interactions
- ✅ Actually feels "alive"

---

## Tech Stack

- **Next.js 16** — App Router
- **TypeScript** — Full type safety
- **TailwindCSS 4** — Styling
- **Framer Motion** — Animations
- **Zustand** — State management with localStorage persistence
- **lucide-react** — Icons
- **canvas-confetti** — Celebration effects
- **Vercel** — Deployment

---

## Features

### Gamification
- XP system (10-50 XP per problem based on difficulty)
- 50 levels with exponential XP scaling
- Rank titles: Hunter (E → S Rank) → Grandmaster
- 23 achievements

### Tracking
- Problem completion with checkboxes
- Streak tracking (current + longest)
- Difficulty breakdown
- Topic coverage (Math, String, Greedy, DP)
- 12-week contribution heatmap

### Tools
- Search & filter problems
- Bookmark important problems
- Random unsolved problem picker
- Custom focus timer (1-120 min)
- Command palette (⌘K)
- Keyboard shortcuts (1/2/3 for navigation)

---

## Getting Started

```bash
# Install
npm install

# Run
npm run dev

# Build
npm run build
```

---

## What's Next

- Add more ladders (beyond just A2OJ <1300)
- Codeforces API integration for auto-detecting solved problems
- Cloud sync with authentication

---

## Credits

Built with 💜 using Opencode.

Based on the A2OJ ladder problem set for Codeforces Rating < 1300.