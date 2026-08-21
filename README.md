# 🌿 CropGuard AI

**A field-tested plant disease diagnostic tool — built to measure, not just claim, real-world accuracy.**

CropGuard AI diagnoses crop diseases from a single leaf photo, explains *why* the model made that call using Grad-CAM, and gives farmers a practical next step in English, Hindi, or Marathi. It's a full-stack ML application spanning model training, a Flask inference API, and a Next.js frontend.

---

## Why this project exists

Most academic plant-disease classifiers report 95–99% accuracy — but that number comes from clean, lab-quality datasets. A farmer's real photo, taken on a phone in a field, looks nothing like that.

This project doesn't just build a classifier. It **measures the lab-to-field accuracy gap directly** by training exclusively on the lab-quality [PlantVillage](https://github.com/spMohanty/PlantVillage-Dataset) dataset (38 classes) and evaluating, untouched, on [PlantDoc](https://github.com/pratikkayal/PlantDoc-Dataset) — a dataset of real field-condition images the model never sees during training. It then tests two interventions (leaf segmentation, data augmentation) to see how much of that gap can be recovered.

| Model | PlantVillage (lab) | PlantDoc (field) | Gap |
|---|---|---|---|
| Baseline | 97.22% | 18.65% | 78.57 pts |
| + Segmentation | 95.64% | 22.22% | 73.41 pts |
| + Segmentation + Augmentation | 93.87% | **25.00%** | 68.87 pts |

Grad-CAM visualizations added a research finding on top of this: the model partially attends to background/mask geometry rather than pure lesion features — which helps explain why segmentation's accuracy gain was smaller than hoped for.

---

## Live demo

<img width="800" height="446" alt="Cropguard" src="https://github.com/user-attachments/assets/824be9e9-94d2-42d2-b1c7-266da08a35c1" />


## Architecture

Three independently-runnable services, deliberately decoupled:

```
CropGuard/
├── ml/         → Model training (PyTorch, own venv)
├── backend/    → Flask inference API (PyTorch, own venv)
└── frontend/   → Next.js web app (pnpm)
```

```
┌─────────────┐      leaf photo      ┌──────────────┐      forward pass      ┌─────────────────┐
│  Next.js UI │ ───────────────────▶ │  Flask API   │ ─────────────────────▶ │  MobileNetV2     │
│  (frontend) │                      │  (backend)   │                        │  (cropguard_seg_ │
│             │ ◀─────────────────── │              │ ◀───────────────────── │   aug.pt)        │
└─────────────┘   prediction + CAM   └──────┬───────┘      class + conf      └─────────────────┘
                                             │
                                             ▼
                                     ┌───────────────┐
                                     │ MongoDB Atlas │
                                     │  (scan history)│
                                     └───────────────┘
```

Two separate Python virtual environments by design: `ml/` carries heavier training-only dependencies; `backend/` stays lean with inference-only dependencies. Both use PyTorch, but only `ml/` performs training.

---

## Tech stack

| Layer | Technology |
|---|---|
| Model training | PyTorch, MobileNetV2 (transfer learning), OpenCV |
| Backend API | Flask, PyTorch (inference), MongoDB Atlas (PyMongo) |
| Frontend | Next.js, TypeScript, pnpm |
| External APIs | OpenWeatherMap (weather-based disease-spread risk) |
| Explainability | Grad-CAM (custom hook-based implementation) |
| i18n | English / Hindi / Marathi |

**Hardware used for training:** NVIDIA RTX 4070 Super (CUDA 12.8), native Windows, no WSL.

---

## Machine learning pipeline

- **Model:** MobileNetV2 with a frozen pretrained backbone; only the classifier head is fine-tuned. This keeps training fast and feasible on a single consumer GPU.
- **Training set:** PlantVillage — 38 classes, lab-quality images.
- **Held-out evaluation set:** PlantDoc — real field-condition images, never trained on, used purely to measure out-of-distribution performance.
- **Preprocessing:** Custom OpenCV HSV-based leaf segmentation (`ml/utils/segmentation.py`) isolates the leaf from its background before it ever reaches the model.
- **Label mapping:** PlantDoc's 28 classes are mapped onto PlantVillage's naming convention, with full coverage — no orphaned or unmapped classes.
- **Explainability:** Grad-CAM hooks into the last convolutional layer to visualize which pixels drove each prediction. Debugging this surfaced a real bug worth noting: MobileNetV2's nested sub-model architecture initially caused the heatmap to render identically before and after — fixed by correctly targeting the `Conv_1` layer *through* the sub-model rather than the outer model.
- **Output artifact:** `cropguard_seg_aug.pt` — the final trained checkpoint (weights + class names), served by the backend.

---

## API reference

All endpoints are implemented in Flask and consumed by the frontend via a typed client (`lib/cropguard.ts`).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict` | Accepts a leaf image, runs segmentation + inference, returns predicted class, confidence, and top-3 alternatives. Persists the scan to MongoDB and returns a `scan_id`. |
| `POST` | `/gradcam` | Generates a Grad-CAM heatmap overlay for a given image + `scan_id`, persisting the heatmap back to the originating MongoDB scan document. |
| `GET` | `/disease-info/<class_name>?lang=en\|hi\|mr` | Returns symptoms, treatment, and prevention notes for a disease class, fully localized across all 38 classes. |
| `GET` | `/weather?city=` | Fetches live weather via OpenWeatherMap and maps conditions to a disease-spread risk level (Low / Medium / High). |
| `GET` | `/history` | Returns all past scans for the scan-history view. |
| `GET` | `/history/<scan_id>` | Returns a single scan, including its persisted Grad-CAM heatmap. |

Full request/response contract documented in [`docs/api-contract.md`](./docs/api-contract.md).

---

## Frontend

Built as a 6-page Next.js application: Overview, Scan a Leaf, Results, Disease Reference, Weather Risk, and Scan History.

The design system was a deliberate choice to move away from generic "AI-app" aesthetics:

- Warm paper background, forest green / rust / amber palette tied to plant-pathology meaning (healthy / disease / caution)
- Fraunces serif for display type, Inter for body, monospace for data
- Rule-line dividers instead of shadow-card UI, no gradients or stock iconography

---

## Dataset

Training and evaluation data is **not included in this repository** — it's several GB total and doesn't belong in version control. Download it separately and place it under `ml/data/` before training.

| Dataset | Role | Source |
|---|---|---|
| **PlantVillage** | Training set (38 classes, lab-quality images) | [github.com/spMohanty/PlantVillage-Dataset](https://github.com/spMohanty/PlantVillage-Dataset) |
| **PlantDoc** | Held-out field evaluation set (28 classes, real-world images, never trained on) | [github.com/pratikkayal/PlantDoc-Dataset](https://github.com/pratikkayal/PlantDoc-Dataset) |

Expected local layout after download:

```
ml/data/
├── plantvillage/
├── plantvillage_segmented/   # generated by ml/utils/segmentation.py
├── plantdoc/
└── plantdoc_segmented/       # generated by ml/utils/segmentation.py
```

Both datasets are used under their respective original licenses — see each source repository for terms.

---

## Getting started

### Prerequisites

- Python 3.10+ (two separate venvs recommended — see below)
- Node.js + [pnpm](https://pnpm.io/)
- MongoDB Atlas connection string
- OpenWeatherMap API key
- (Optional, for retraining) NVIDIA GPU with CUDA support

### 1. Clone

```bash
git clone https://github.com/<your-username>/CropGuard.git
cd CropGuard
```

### 2. Backend (inference API)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
MONGODB_URI=your_mongodb_atlas_uri
OPENWEATHER_API_KEY=your_openweathermap_key
```

Run the API:

```bash
python app.py
```

The API will be available at `http://127.0.0.1:5000`.

### 3. Frontend

```bash
cd frontend
pnpm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
```

Run the dev server:

```bash
pnpm dev
```

Visit `http://localhost:3000`.

### 4. (Optional) Retrain the model

```bash
cd ml
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Training is run from the notebooks in `ml/notebooks/` (`train.ipynb`, `test_segmentation.ipynb`, `evaluate_plantdoc.ipynb`). Trained checkpoints are saved to `ml/models/` — copy the final `.pt` file into `backend/models/` to serve it.

---

## Project structure

```
CropGuard/
├── ml/
│   ├── data/                      # gitignored — see Dataset section
│   ├── models/                    # trained checkpoints (cropguard.pt, cropguard_seg_aug.pt, cropguard_segmented.pt)
│   ├── notebooks/                 # train.ipynb, test_segmentation.ipynb, evaluate_plantdoc.ipynb
│   └── utils/
│       ├── segmentation.py
│       └── preprocess_segmentation.py
├── backend/
│   ├── routes/
│   │   ├── predict.py
│   │   ├── gradcam.py
│   │   └── history.py
│   ├── models/                   # cropguard_seg_aug.pt lives here
│   ├── database.py
│   └── app.py
├── frontend/
│   ├── app/                      # Overview, Scan, Results, Disease Info, Weather, History
│   ├── lib/cropguard.ts          # API client, types, i18n copy
│   └── components/
└── docs/
    └── api-contract.md
```

---

## Roadmap

- [ ] Finish testing the EN / HI / MR language switcher across all pages
- [ ] Unfreeze additional MobileNetV2 layers for fine-tuning, to push field accuracy past 25%
- [ ] Expand the PlantDoc evaluation set for a more robust field-accuracy estimate

---

## Author

Built by **Shoaib** — final-year B.E. IT student, Shree L.R. Tiwari College of Engineering, Mumbai.

---

## License

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
