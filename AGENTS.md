# AGENTS.md

## Layout

- `frontend/` — Next.js 16 app (React 19, Tailwind v4, shadcn/ui). **The whole app: inference runs in the browser, deployable static (no server).**
- `tools/` — export-only tooling: PyTorch model code + `best_gru_model.pth` + `export_onnx.py`. No server; the old FastAPI serving layer was deleted.

## Backend (export tooling only)

- Run from `tools/` (cwd matters for `load_model('./best_gru_model.pth')`).
- `uv run python export_onnx.py` → writes `frontend/public/best_gru_model.onnx` (16.55 MB, opset 18, dynamic batch/sequence) and runs torch-vs-ONNX Runtime parity (must pass).
- Deps via `uv sync` (`pyproject.toml` + `uv.lock`). Added: `onnx`, `onnxruntime`, `onnxscript`.
- Torch 2.9's default dynamo exporter breaks with `dynamic_axes` on this GRU — `export_onnx.py` pins `dynamo=False`. Don't "upgrade" it away.
- int8 dynamic quantization is a dead end (GRU weights stay fp32, file barely shrinks). Ship fp32.
- No tests, no linter/formatter configured.

## Frontend (Next.js)

- Use `npm` (`package-lock.json` is real; `pnpm-lock.yaml` is a leftover stub). `cd frontend && npm install && npm run dev` (port 3000).
- The Next.js app is `app/` + `components/` + `lib/`. The files `index.html`, `script.js`, `style.css` at `frontend/` root are a legacy static prototype — ignore them for feature work.
- **Inference is client-side**: `lib/predict.ts` loads `onnxruntime-web` (WASM build, `onnxruntime-web/wasm`), the model from `public/best_gru_model.onnx`, and runtime files from `public/ort/`. `app/page.tsx` imports it dynamically; no backend URL is involved.
- Preprocessing lives in `lib/predict.ts` (`buildInput`): flatten strokes → min-max normalize x/y independently → chunk into 16-float rows → zero-pad last row → tensor `(1, rows, 16)`. Keep in sync with the export contract (input `input`, output `logits`).
- After re-exporting the model, refresh `public/ort/` if `onnxruntime-web` is upgraded.
- Theming: next-themes (`attribute="class"`, default theme dark). In `app/globals.css`, `:root` holds the light palette and `.dark` the terminal palette (green `#00FF41` on `#0D0D0D`). The toggle is `components/theme-toggle.tsx` (header, top-right); it remembers the choice per browser. Canvas colors are selected at draw time by `getCanvasColors()` in `components/canvas-drawing.tsx` (dark: green on `#0D0D0D`; light: `#171717` on `#F4F4F4`).
- Canvas drawing uses Pointer Events with `setPointerCapture` (mouse/touch/pen in one path) — don't reintroduce separate mouse/touch handlers.
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `npm run build` does not catch type errors. Typecheck with `npx tsc --noEmit`.
- `next.config.mjs` also sets `allowedDevOrigins: ['192.168.0.100']` so LAN devices (e.g. a phone) can load dev assets and HMR; update it if the machine's LAN IP changes.
- `npm run lint` fails: the script exists but eslint is not installed and no ESLint config is present. Don't rely on it.
- Tailwind v4 is wired via `@tailwindcss/postcss` — there is no `tailwind.config.js`.

## Docs

- Root `README.md` is the canonical setup guide. `tools/README.md` is empty. The TerminalUI redesign plan lives in `docs/superpowers/plans/2026-10-16-terminal-ui-redesign.md`.
