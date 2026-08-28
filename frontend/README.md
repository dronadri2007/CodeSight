# CodeSight — Frontend Application

CodeSight is a developer-focused learning platform designed to teach students how to master code review through the core learning loop: **Review → Understand the Miss → Learn → Practice → Prove Improvement**.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) (Monaco Editor configured with read-only code canvas, custom whole-line selection decorations, and dark/light theme integration)
- **Data Visualization**: [Recharts](https://recharts.org/) (Responsive AreaChart for skill progression over time, BarChart for 6 defect classes mastery)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom CodeSight design tokens from `DESIGN.md`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/) (HashRouter for zero-config static and Vercel hosting)
- **State & Persistence**: React Context + `localStorage`

---

## 🎨 Visual Design & Theme System

- **Optical Clarity & Glassmorphism**: Translucent frosted surfaces (`backdrop-blur`), subtle 1px highlight borders, soft shadows, and deep atmospheric depth.
- **Dual Global Theme Engine**:
  - **Dark Mode**: Deep obsidian atmospheric background (`DARK-THEMED-JPG`) + dark Monaco theme (`codesight-dark`).
  - **Light Mode**: Ethereal pearlescent background (`LIGHT-THEMED-JPG`) + light Monaco theme (`codesight-light`).
  - Smooth 400ms crossfade transition persisted across page reloads via `localStorage`.
- **Typography**: `Inter` for interface hierarchy and `JetBrains Mono` for technical data, code blocks, and metadata tags.
- **Branding**: Understated, text-only wordmark `CodeSight` with tight tracking.

---

## 🧭 Six Defect Classes Architecture

Every exercise and learning module strictly maps to one canonical defect class:
1. **Injection / Input Validation**: Unsanitized input flowing into queries, commands, or paths.
2. **Auth & Access Control**: Missing permission checks, broken role logic, and IDOR vulnerabilities.
3. **Error & Exception Handling**: Swallowed exceptions, unhandled promise rejections, and unchecked return values.
4. **Concurrency & State**: Race conditions, cache stampedes (thundering herd), and unsynchronized shared mutations.
5. **Logic & Boundary**: Off-by-one errors, inverted operators, and bad edge cases.
6. **Resource & Performance**: Connection leaks, closure retention, and unbounded memory buffers.

---

## 🚀 Core Flows & Features

1. **Welcome (`/`)**: Hero visual introduction with direct entry into recommended practice.
2. **Dashboard (`/dashboard`)**: Actionable weakness detection, current review skill score, Up Next practice recommendation, and 6-class mastery overview.
3. **Practice Curriculum (`/practice`)**: Filterable catalog across all 6 defect classes with time estimates, difficulty levels, and discernment traps (*False Positive Clean Code*).
4. **Active Code Review (`/review/:exerciseId`)**:
   - Monaco Editor with line-click selection affordance.
   - Explanation textarea locked until suspicious line(s) are marked.
   - 3-Tier progressive hints with score decay ($100\% \to 90\% \to 75\% \to 50\%$).
   - Anti-cheating friction signals (character limits, paste notification, elapsed timer).
5. **Analyzing Diagnostics (`/review/:exerciseId/analyzing`)**: Four-stage animated AST analysis sequence.
6. **Teaching Results (`/review/:exerciseId/results`)**: Detailed breakdown for **WHERE**, **WHY YOU MISSED IT**, and **PATTERN TO WATCH**, plus catch/miss/false alarm statistics.
7. **Learn the Concept & Micro-Check (`/learn/:conceptId`)**: Side-by-side Before (Vulnerable) vs After (Secured) code comparisons with line annotations, Source $\to$ Sink flow diagrams, and 2 interactive understanding check questions with instant explanations.
8. **Targeted Practice**: Completing a concept routes directly into another exercise of the same defect class and updates local mastery.
9. **Progress Analytics (`/progress`)**: Recharts-powered skill progression curves over time and 6-class proficiency breakdowns.
10. **Code Review Battle (`/battle` & `/battle/results`)**: Simulated 5-competitor multiplayer speed and accuracy battle with live status updates, countdown timer, and podium leaderboard.
11. **AI vs You (`/ai-vs-you`)**: Side-by-side human vs automated linter review matrix highlighting the *"Critical Catch: AI Missed This"* moment.

---

## 💻 Local Development Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production / Vercel
npm run build
```
