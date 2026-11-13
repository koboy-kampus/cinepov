# CinePOV

An implementation of a cinema booking UI/UX concept by Ramin Nasibov. <!-- TODO: add link to Ramin Nasibov's original post -->

Pick a seat on the seat map and preview the real view of the screen from that seat in 3D.

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [Three.js](https://threejs.org/) via [React Three Fiber](https://r3f.docs.pmnd.rs/) and [drei](https://drei.docs.pmnd.rs/)
- [Zustand](https://zustand.docs.pmnd.rs/) for state
- [Tailwind CSS v4](https://tailwindcss.com/) for styling
- [Framer Motion](https://motion.dev/) for UI animation
- [Vitest](https://vitest.dev/) for tests
- ESLint + Prettier

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
