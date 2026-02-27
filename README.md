# SalesPitchProducer

Notebook-style React frontend with a lightweight Node backend bridge for model calls.

## Run

```bash
npm run api
npm run dev
```

## Model integration

Set `MODEL_ENDPOINT` before starting backend to forward JSON payloads to your model service:

```bash
MODEL_ENDPOINT=http://localhost:9000/infer npm run api
```

If not set, backend returns mock responses so the UI still works.
