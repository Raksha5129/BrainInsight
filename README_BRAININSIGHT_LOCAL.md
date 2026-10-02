# BrainInsight — React UI + Local EfficientNetB0 Inference

This version keeps the generated BrainInsight UI and connects the MRI analysis workspace to your real `BrainInsight_Final_v2.keras` model through a local Flask inference service.

## Put the model here

```text
backend/model/
├── BrainInsight_Final_v2.keras
└── BrainInsight_v2_metadata.json
```

The model is intentionally not included in this ZIP.

## Windows setup

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend: `http://127.0.0.1:5000`

### Frontend

Open another terminal:

```powershell
cd client
npm install
npm run dev:static
```

Frontend: the Vite URL shown by the terminal, normally `http://localhost:5173`.

The frontend calls:

```text
POST http://127.0.0.1:5000/api/predict
```

## Quick start

After placing the model files, you can also double-click:

```text
RUN_BRAININSIGHT_WINDOWS.bat
```

It opens separate terminals for the local inference API and React UI.

## Inference behavior

The backend:

1. accepts JPG/JPEG/PNG/BMP/WEBP;
2. converts to RGB;
3. resizes to 224 × 224;
4. loads the BrainInsight v2 Keras checkpoint with `compile=False`;
5. returns the five class probabilities and predicted class.

The test/evaluation metrics shown in the UI remain the notebook-derived metrics; they are not calculated from the uploaded scan.

## Safety

BrainInsight is an academic/research project. A model prediction is not a clinical diagnosis and should not be used to make medical decisions.

## Updated scan workflow

The local MRI workspace now includes:

- fitted, non-cropped MRI image preview (`object-fit: contain`)
- robust probability mapping for all five model classes, including `Multiple Sclerosis` ↔ `MS`
- a **Download scan report** button after a successful local prediction
- scan-specific PDF reports containing the uploaded image, predicted class, confidence, all five probabilities, result context, model/input details, and research-use disclaimer

The existing **Evaluation PDF** remains separate: it summarizes the held-out notebook evaluation and does not represent an individual scan.
