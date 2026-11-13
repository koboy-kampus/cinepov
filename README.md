# CinePOV

An implementation of a cinema booking UI/UX concept by Ramin Nasibov. <!-- TODO: add link to Ramin Nasibov's original post -->

Pick a seat on the seat map and preview the real view of the screen from that seat in 3D.

**Live demo:** https://cinepov.vercel.app

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [Three.js](https://threejs.org/) via [React Three Fiber](https://r3f.docs.pmnd.rs/) and [drei](https://drei.docs.pmnd.rs/)
- [Zustand](https://zustand.docs.pmnd.rs/) for state
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [Framer Motion](https://motion.dev/) for UI animation
- [Vitest](https://vitest.dev/) for tests
- ESLint + Prettier

## How the metrics are calculated

The hall is modelled in metres (see `HALL` in `src/data/hall.ts`). Coordinates: **x** = left/right
(0 = centre line, + = right), **y** = up, **z** = distance from the screen (screen at z = 0).

| Metric             | Formula                                             |
| ------------------ | --------------------------------------------------- |
| Eye position       | seat floor position + (0, eye height 1.15 m, 0)     |
| Distance to screen | `d = √(x² + (y − screenCentreY)² + z²)`             |
| Field of view      | `FOV = 2 · atan((screenWidth / 2) / d)`, in degrees |
| Offset from centre | `x` of the eye (shown as "Centre" when under 0.1 m) |

Each row sits further back (1.0 m, or 1.2 m for recliners) and higher (0.3 m rake) than the one in
front. The seat tag uses the first rule that matches:

1. Offset over 3 m → **Side view**
2. FOV of 75° or more → **Up close**
3. FOV under 50° → **Full picture**
4. Offset of 1.5 m or less → **Sweet spot**
5. Otherwise → **Side view**

The hall is tuned to match the concept: B4 ≈ 6.3 m / 86°, F8 ≈ 9.8 m / 60°, I12 ≈ 13.3 m / 45°
(checked in `src/lib/metrics.test.ts`).

## Run locally

Requires [Node.js](https://nodejs.org/) 20.19+ (or 22.12+).

```bash
git clone https://github.com/<your-username>/cinepov.git
cd cinepov
npm install
npm run dev
```

Then open http://localhost:5173.

Other scripts:

| Command           | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run build`   | Type-check and build to `dist/`    |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | Run ESLint                         |
| `npm run format`  | Format all files with Prettier     |
| `npm test`        | Run unit tests with Vitest         |
