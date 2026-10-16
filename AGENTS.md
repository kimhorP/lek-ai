# AGENTS.md

## Layout

- `backend/` — FastAPI + PyTorch bidirectional GRU for Khmer digit recognition (Python 3.12, uv-managed: `pyproject.toml` + `uv.lock`).
- `frontend/` — Next.js 16 app (React 19, Tailwind v4, shadcn/ui).
- Two independent apps: no monorepo tooling, no CI. Backend tests: pytest (`uv run pytest`); the frontend has no test framework.

## Backend (FastAPI)

- Run from `backend/` (cwd matters): `uv run uvicorn main:app --reload`. `routers/predict.py` loads `./best_gru_model.pth` with a relative path at import time — starting the server from the repo root crashes.
- Dependencies are managed with `uv sync` (`pyproject.toml` + `uv.lock`; the old `requirements.txt` is gone).
- `uv run main.py` binds to `127.0.0.1:8000` only (see `uvicorn.run` in `main.py`). For LAN/phone access use `uv run uvicorn main:app --reload --host 0.0.0.0`.
- Real endpoint is `POST /predict/` (trailing slash). Docs at `/docs`; `GET /health` works.
- CORS in `main.py` uses `allow_origin_regex`: allows `http://localhost:*`, `http://127.0.0.1:*`, and `http://192.168.*.*:*` (dev + LAN devices).
- Tests live in `backend/test_api.py` — run `uv run pytest` from `backend/`. No Python linter/formatter is configured.

## Frontend (Next.js)

- Use `npm` (`package-lock.json` is real; `pnpm-lock.yaml` is a leftover stub). `cd frontend && npm install && npm run dev` (port 3000).
- The Next.js app is `app/` + `components/`. The files `index.html`, `script.js`, `style.css` at `frontend/` root are a legacy static prototype — ignore them for feature work.
- `app/page.tsx` calls the real backend: `POST ${NEXT_PUBLIC_API_URL || http://<page-host>:8000}/predict/` with `{"coordinates": [float, ...]}` (flat list) → `{"prediction": int}`; the frontend maps it to the Khmer numeral via `String.fromCharCode(0x17e0 + prediction)`.
- Theming: next-themes (`attribute="class"`, default theme dark). In `app/globals.css`, `:root` holds the light palette and `.dark` the terminal palette (green `#00FF41` on `#0D0D0D`). The toggle is `components/theme-toggle.tsx` (header, top-right); it remembers the choice per browser. Canvas colors are selected at draw time by `getCanvasColors()` in `components/canvas-drawing.tsx` (dark: green on `#0D0D0D`; light: `#171717` on `#F4F4F4`).
- Canvas drawing uses Pointer Events with `setPointerCapture` (mouse/touch/pen in one path) — don't reintroduce separate mouse/touch handlers.
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `npm run build` does not catch type errors. Typecheck with `npx tsc --noEmit`.
- `next.config.mjs` also sets `allowedDevOrigins: ['192.168.0.100']` so LAN devices (e.g. a phone) can load dev assets and HMR; update it if the machine's LAN IP changes.
- `npm run lint` fails: the script exists but eslint is not installed and no ESLint config is present. Don't rely on it.
- Tailwind v4 is wired via `@tailwindcss/postcss` — there is no `tailwind.config.js`.

## Docs

- Root `README.md` is the canonical setup guide (includes the ITC research attribution). `backend/README.md` is empty. The TerminalUI redesign plan lives in `docs/superpowers/plans/2026-10-16-terminal-ui-redesign.md`.
