# CodeSight Admin Portal

A modern, high-performance **Admin Portal & Problem Management Dashboard** for the CodeSight Platform, featuring a customized **3D Interactive Robot** with a dynamic **Texture-Based Facial Expression System**, real-time mouse gaze tracking, and a glassmorphic **Dark / Light Theme Engine**.

---

## 🌟 Key Features

### 1. 🤖 3D Interactive Robot Login Portal
- **Real-Time Cursor Tracking**: The 3D robot smoothly tracks the user's cursor across the viewport with natural head and torso rotation physics.
- **Texture-Based Face Expression System**:
  - Dynamically renders 5 expressive facial animations directly onto the robot's front visor plate via a calibrated 2D Canvas texture:
    - **`>.<` (Playful Squint)**: Mischievous chevrons and gentle upward smile.
    - **`:O` (Surprised)**: Wide open eyes and expressive open 'O' mouth.
    - **`^_^` (Happy)**: Cheerful curved eye arcs and wide smile.
    - **`;)` (Wink)**: Left closed wink line, right open eye, and confident smirk.
    - **`-_-` (Suspicious)**: Twin horizontal slit eyes and neutral line.
  - **7-Second Periodic Loop**: Cycles smoothly with `easeInOutCubic` transitions, holding expressions for 1.5s before returning to the friendly resting face.
- **Custom Aesthetic Palette**: Finished in Ivory Gradient body, Deep Red earcups, Radiant Teal core, Polished Gold shoulder sockets, and Warm Silver arms.

### 2. 🌓 Dynamic Dark & Light Theme Engine
- Seamless theme switching via navigation bar toggle.
- Dynamic full-bleed themed background switching (`dashboard-bg-dark.png` & `dashboard-bg-light.png`) with smooth 700ms crossfade.
- Persistent state synced with `localStorage` and Tailwind CSS `.dark` / `.light` classes.

### 3. 📊 Problem Management Dashboard
- **Live Statistics Overview**: Total problems count, acceptance rates, and difficulty distribution badges (Easy, Medium, Hard).
- **Search & Multi-Filter Bar**: Real-time keyword search, difficulty filtering, and tag/category filtering.
- **Problem Table & Modal**:
  - View, add, edit, and delete coding problems.
  - Test case configuration and code template support.
  - Clean pagination with `"Show More →"` increment expansion and `"No more problems to load"` completion state.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **3D Graphics**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + PostCSS
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation & Transitions**: Custom Three.js CanvasTexture pipeline, CSS3 Glassmorphism

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rogeralukka/FRONTEND-1.git
   cd FRONTEND-1
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
FRONTEND-1/
├── public/
│   └── assets/
│       ├── greeting_robot.glb          # 3D Robot GLTF model
│       ├── dashboard-bg-dark.png       # Dark theme dynamic background
│       ├── dashboard-bg-light.png      # Light theme dynamic background
│       ├── logo.png                    # Transparent CodeSight logo
│       └── favicon.png                 # Transparent CodeSight favicon
├── src/
│   ├── components/
│   │   ├── common/                     # ThemeToggle, GlassCard, Badge, InputField, PrimaryButton
│   │   ├── dashboard/                  # NavigationBar, ProblemTable, ProblemRow, FilterBar, StatsOverview, ProblemModal
│   │   └── login/                      # RobotScene (3D Canvas & Face Expressions), LoginForm, Backgrounds
│   ├── context/                        # ThemeContext, AuthContext
│   ├── hooks/                          # useMousePosition, useProblems, useAuth
│   ├── pages/                          # AdminLogin, AdminDashboard
│   ├── services/                       # api, adminService, mockData
│   ├── types/                          # TypeScript definitions
│   ├── App.tsx                         # Main router & theme provider
│   ├── index.css                       # Global styles & glassmorphism
│   └── main.tsx                        # Entry point
├── tailwind.config.js                  # Tailwind configuration
├── tsconfig.json                       # TypeScript configuration
├── vite.config.ts                      # Vite build configuration
└── package.json
```

---

## 📄 License
This project is proprietary and maintained for the CodeSight Platform.
