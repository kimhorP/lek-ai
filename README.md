# lek-ai

![FastAPI](https://img.shields.io/badge/FastAPI-0.128.0-009688?style=flat&logo=fastapi&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.9.1-EE4C2C?style=flat&logo=pytorch&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)

Draw a Khmer handwritten digit (០–៩) on a canvas and recognize it with a bidirectional GRU model.



## Getting started

### Backend

```bash
cd backend
uv sync
uv run main.py
```

The API runs at `http://127.0.0.1:8000` with interactive docs at `/docs`.

To reach it from other devices on your network (e.g. a phone testing the frontend), bind it to the LAN instead:

```bash
uv run uvicorn main:app --reload --host 0.0.0.0
```

Run the tests:

```bash
cd backend
uv run pytest
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The app calls the backend on the same host at port `8000`; set `NEXT_PUBLIC_API_URL` if the API lives elsewhere.

## API

| Method | Endpoint   | Body                              | Response             |
| ------ | ---------- | --------------------------------- | -------------------- |
| `POST` | `/predict/` | `{"coordinates": [x, y, x, y, ...]}` | `{"prediction": 0-9}` |

`coordinates` is the drawing canvas flattened into `[x, y, x, y, ...]`. The server normalizes them and returns the predicted digit class (0–9), which the frontend maps to the Khmer numeral (០–៩).

## Project structure

```
backend/
  main.py              FastAPI app, CORS, entrypoint
  routers/predict.py   POST /predict/ — runs the model
  model/               DeepGRU model definition + weight loader
  utils/               Coordinate normalization
  schemas/             Request/response models
  best_gru_model.pth   Trained model weights
frontend/
  app/                 Next.js app router (page, layout, styles)
  components/          Canvas drawing, prediction display, theme toggle
```
