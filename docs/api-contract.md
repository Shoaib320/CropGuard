# CropGuard Backend API Contract

Base URL (local dev): `http://127.0.0.1:5000`

All endpoints return JSON. CORS is enabled for all origins (dev only).

---

## 1. POST `/predict`

Classifies a leaf image and returns the predicted disease.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: form field named `image` (file)

**Success Response (200):**
```json
{
  "predicted_class": "Tomato___Late_blight",
  "confidence": 87.42,
  "top3": [
    { "class": "Tomato___Late_blight", "confidence": 87.42 },
    { "class": "Tomato___Early_blight", "confidence": 8.13 },
    { "class": "Tomato___healthy", "confidence": 2.05 }
  ],
  "scan_id": "6a7b65e6721eb49eaf6aa408"
}
```

**Error Responses:**
- `400` — `{ "error": "No image file provided" }`
- `400` — `{ "error": "Invalid image file" }`

**Notes for frontend:**
- `predicted_class` uses the raw PlantVillage-style naming (`Crop___Disease_name`, triple underscore separator). Use this exact string as the key when calling `/disease-info/<predicted_class>`.
- `confidence` is a percentage (0-100), already rounded to 2 decimals.
- Show `top3` as secondary/alternative predictions, not just the top-1 — model confidence can be low/ambiguous on field photos.
- Every call to `/predict` now saves the scan to MongoDB and returns `scan_id`. Keep this value around (e.g. in URL state when navigating to `/results`) — it's needed to later fetch this exact scan from `/history/<scan_id>`.

---

## 2. POST `/gradcam`

Generates a Grad-CAM heatmap overlay showing which region of the leaf the model focused on.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: form field named `image` (file) — same image you'd send to `/predict`

**Success Response (200):**
```json
{
  "predicted_class": "Tomato___Late_blight",
  "heatmap_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Error Responses:**
- `400` — `{ "error": "No image file provided" }`
- `400` — `{ "error": "Invalid image file" }`

**Notes for frontend:**
- `heatmap_base64` is a complete data URI — use directly as `<img src={heatmap_base64} />`, no additional decoding needed.
- This is a separate request from `/predict` (the frontend will need to call both endpoints, likely in parallel, when the user submits an image on the Results page).
- Response size is larger (~50-100KB) due to embedded image — expect slightly slower response time than `/predict`.

---

## 3. GET `/disease-info/<class_name>`

Returns symptoms, treatment, and prevention info for a disease class, in the requested language.

**Request:**
- Method: `GET`
- URL param: `class_name` — must exactly match a `predicted_class` string from `/predict` (e.g. `Tomato___Late_blight`)
- Query param: `lang` — one of `en`, `hi`, `mr` (default: `en` if omitted)

**Example:** `GET /disease-info/Tomato___Late_blight?lang=hi`

**Success Response (200):**
```json
{
  "class_name": "Tomato___Late_blight",
  "language": "hi",
  "name": "टमाटर पछेती झुलसा रोग",
  "symptoms": "...",
  "treatment": "...",
  "prevention": "..."
}
```

**Error Responses:**
- `404` — unknown class: `{ "error": "...", "available_classes": [...] }`
- `404` — unknown language: `{ "error": "...", "available_languages": [...] }`

**Notes for frontend:**
- All 38 classes have full `en`/`hi`/`mr` coverage — 404 should not occur for any real `predicted_class` from `/predict`, as long as the exact string is passed through unmodified.
- `___healthy` classes return a "no treatment necessary" style response — the frontend should render this differently from a disease result (e.g. green/positive styling instead of a warning state).
- This endpoint is safe to call directly after `/predict` returns, using its `predicted_class` value as-is.

---

## 4. GET `/disease-info`

Lists all available disease classes (no info payload, just names). Useful for a reference/browse page.

**Request:**
- Method: `GET`
- No params

**Success Response (200):**
```json
{
  "classes": ["Apple___Apple_scab", "Apple___Black_rot", "..."],
  "count": 38
}
```

---

## 5. GET `/weather`

Returns current weather and a rule-based disease spread risk rating for a location.

**Request:**
- Method: `GET`
- Query params (choose ONE method):
  - `city` — e.g. `?city=Mumbai`
  - OR `lat` + `lon` — e.g. `?lat=19.0760&lon=72.8777`

**Success Response (200):**
```json
{
  "location": "Mumbai",
  "temperature_c": 26.76,
  "humidity": 83,
  "weather": "Clouds",
  "description": "overcast clouds",
  "disease_spread_risk": "Medium"
}
```

**Error Responses:**
- `400` — `{ "error": "Provide either lat/lon or city query params" }`
- `500` — `{ "error": "Weather API key not configured on server" }`
- Non-200 from OpenWeatherMap — `{ "error": "Failed to fetch weather data", "details": {...} }`

**Notes for frontend:**
- `disease_spread_risk` is one of `"Low"`, `"Medium"`, `"High"` — map to a color/badge (e.g. green/yellow/red).
- If the frontend has access to browser geolocation, prefer `lat`/`lon` for accuracy; fall back to a city text input otherwise.
- This endpoint is independent of `/predict` — doesn't require an uploaded image, can be called standalone on a dedicated Weather page.

---

## 6. GET `/history`

Returns all past scans, most recent first. Powers the History page.

**Request:**
- Method: `GET`
- No params currently (no pagination yet — fine for a student project's scan volume)

**Success Response (200):**
```json
{
  "scans": [
    {
      "_id": "6a7b65e6721eb49eaf6aa408",
      "predicted_class": "Apple___healthy",
      "confidence": 67.21,
      "top3": [ { "class": "Apple___healthy", "confidence": 67.21 }, "..." ],
      "timestamp": "2026-08-11T18:11:50Z",
      "location": null,
      "image_thumbnail": "data:image/png;base64,..."
    }
  ],
  "count": 1
}
```

**Notes for frontend:**
- `_id` is the MongoDB document ID — use this as `scan_id` when linking to `/history/<scan_id>` for the detail view.
- `image_thumbnail` (if present) is a base64 data URI, usable directly in `<img src={...} />` — same pattern as `/gradcam`'s `heatmap_base64`.
- `location` is `null` unless weather was checked alongside the scan — handle gracefully (don't show a location badge if null).
- Good candidate for a card/list layout: thumbnail + predicted_class + confidence + relative timestamp ("2 hours ago").

---

## 7. GET `/history/<scan_id>`

Returns one specific past scan by its MongoDB ID. Powers click-through from History → Scan Details.

**Request:**
- Method: `GET`
- URL param: `scan_id` — the `_id` value from a `/history` list item or the `scan_id` returned by `/predict`

**Success Response (200):** same shape as a single item in `/history`'s `scans` array.

**Error Responses:**
- `404` if `scan_id` doesn't exist or is malformed

**Notes for frontend:**
- Once you have a scan's `predicted_class` from this endpoint, you can still call `/disease-info/<predicted_class>?lang=<locale>` to show full disease details on the same detail page — this endpoint only returns what was stored at prediction time, not the full disease info text.

---

## 8. GET `/` (health check)

**Success Response (200):**
```json
{ "status": "ok", "message": "CropGuard backend running" }
```

Useful to verify the backend is reachable before wiring up the rest of the frontend.

---

## General Frontend Integration Notes

- **Typical user flow:** upload image on `/predict` page → on submit, call `POST /predict` AND `POST /gradcam` (can run in parallel, same image file) → navigate to `/results` page, carrying `scan_id` in the URL/state → use returned `predicted_class` to call `GET /disease-info/<predicted_class>?lang=<current_locale>` → display everything together.
- **Language switching:** the frontend's i18n locale (`en`/`hi`/`mr` via next-intl) should map directly to the `lang` query param on `/disease-info`. Keep these in sync — if the UI is in Hindi, disease info should also be fetched in Hindi.
- **History is live** — `/predict` persists every scan to MongoDB automatically and returns `scan_id`. The History page should call `GET /history` on load, and each list item should link to a detail view backed by `GET /history/<scan_id>`.
- **Error handling** — every POST endpoint can return 400 for bad/missing files; every GET can return 404/500. Frontend should handle these gracefully (toast/error state), not just assume success.