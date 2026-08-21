export type Locale = 'en' | 'hi' | 'mr'

export type TopPrediction = {
  class: string
  confidence: number
}

export type Prediction = {
  predicted_class: string
  confidence: number
  top3: TopPrediction[]
  scan_id: string
}

export type Gradcam = {
  predicted_class: string
  heatmap_base64: string
}

export type DiseaseInfo = {
  class_name: string
  language: Locale
  name: string
  symptoms: string
  treatment: string
  prevention: string
}

export type Weather = {
  location: string
  temperature_c: number
  humidity: number
  weather: string
  description: string
  disease_spread_risk: 'Low' | 'Medium' | 'High'
}

export type Scan = {
  scan_id: string
  predicted_class: string
  confidence: number
  top3: TopPrediction[]
  timestamp: string
  location: string | null
  image_thumbnail: string | null
  heatmap_base64?: string
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'

export const labels = {
  en: {
    home: 'Overview',
    predict: 'Scan a leaf',
    results: 'Results',
    disease: 'Disease reference',
    weather: 'Weather risk',
    history: 'Scan history',
    scan: 'Scan a leaf',
    learn: 'Learn about diseases',
    fieldNote: 'Field diagnostic tool',
    upload: 'Upload a specimen',
    browse: 'Browse all diseases',
  },

  hi: {
    home: 'अवलोकन',
    predict: 'पत्ती स्कैन करें',
    results: 'नतीजे',
    disease: 'रोग संदर्भ',
    weather: 'मौसम जोखिम',
    history: 'स्कैन इतिहास',
    scan: 'पत्ती स्कैन करें',
    learn: 'रोगों के बारे में जानें',
    fieldNote: 'खेत निदान उपकरण',
    upload: 'नमूना अपलोड करें',
    browse: 'सभी रोग देखें',
  },

  mr: {
    home: 'आढावा',
    predict: 'पान स्कॅन करा',
    results: 'निकाल',
    disease: 'रोग संदर्भ',
    weather: 'हवामान धोका',
    history: 'स्कॅन इतिहास',
    scan: 'पान स्कॅन करा',
    learn: 'रोगांबद्दल जाणून घ्या',
    fieldNote: 'शेत निदान साधन',
    upload: 'नमुना अपलोड करा',
    browse: 'सर्व रोग पहा',
  },
} as const

export function classLabel(value?: string) {
  return (
    value
      ?.split('___')
      .slice(1)
      .join(' ')
      .replaceAll('_', ' ') || 'Unknown specimen'
  )
}

export function cropLabel(value?: string) {
  return value?.split('___')[0] || 'Crop'
}

type LocalizedText = Record<Locale, string>

type ClassTranslation = {
  crop: LocalizedText
  disease: LocalizedText
}

const classTranslations: Record<string, ClassTranslation> = {
  'Apple___Apple_scab': { crop: { en: 'Apple', hi: 'सेब', mr: 'सफरचंद' }, disease: { en: 'Apple Scab', hi: 'सेब की पपड़ी', mr: 'सफरचंद खवली' } },
  'Apple___Black_rot': { crop: { en: 'Apple', hi: 'सेब', mr: 'सफरचंद' }, disease: { en: 'Apple Black Rot', hi: 'सेब का काला सड़न', mr: 'सफरचंद काळी सड' } },
  'Apple___Cedar_apple_rust': { crop: { en: 'Apple', hi: 'सेब', mr: 'सफरचंद' }, disease: { en: 'Cedar Apple Rust', hi: 'सीडर एप्पल रस्ट', mr: 'सिडर ऍपल रस्ट' } },
  'Apple___healthy': { crop: { en: 'Apple', hi: 'सेब', mr: 'सफरचंद' }, disease: { en: 'Healthy Apple', hi: 'स्वस्थ सेब', mr: 'निरोगी सफरचंद' } },
  'Blueberry___healthy': { crop: { en: 'Blueberry', hi: 'ब्लूबेरी', mr: 'ब्लूबेरी' }, disease: { en: 'Healthy Blueberry', hi: 'स्वस्थ ब्लूबेरी', mr: 'निरोगी ब्लूबेरी' } },
  'Cherry_(including_sour)___Powdery_mildew': { crop: { en: 'Cherry (including sour)', hi: 'चेरी (खट्टी सहित)', mr: 'चेरी (आंबट प्रकारासह)' }, disease: { en: 'Cherry Powdery Mildew', hi: 'चेरी चूर्णी फफूंदी', mr: 'चेरी भुरी रोग' } },
  'Cherry_(including_sour)___healthy': { crop: { en: 'Cherry (including sour)', hi: 'चेरी (खट्टी सहित)', mr: 'चेरी (आंबट प्रकारासह)' }, disease: { en: 'Healthy Cherry (including sour)', hi: 'स्वस्थ चेरी (खट्टी सहित)', mr: 'निरोगी चेरी (आंबट प्रकारासह)' } },
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot': { crop: { en: 'Corn (maize)', hi: 'मक्का (मकई)', mr: 'मका' }, disease: { en: 'Corn Gray Leaf Spot', hi: 'मक्का ग्रे लीफ स्पॉट', mr: 'मका करडा ठिपका' } },
  'Corn_(maize)___Common_rust_': { crop: { en: 'Corn (maize)', hi: 'मक्का (मकई)', mr: 'मका' }, disease: { en: 'Corn Common Rust', hi: 'मक्का रस्ट (जंग)', mr: 'मका तांबेरा' } },
  'Corn_(maize)___Northern_Leaf_Blight': { crop: { en: 'Corn (maize)', hi: 'मक्का (मकई)', mr: 'मका' }, disease: { en: 'Corn Northern Leaf Blight', hi: 'मक्का उत्तरी झुलसा', mr: 'मका उत्तरी करपा' } },
  'Corn_(maize)___healthy': { crop: { en: 'Corn (maize)', hi: 'मक्का (मकई)', mr: 'मका' }, disease: { en: 'Healthy Corn (maize)', hi: 'स्वस्थ मक्का (मकई)', mr: 'निरोगी मका' } },
  'Grape___Black_rot': { crop: { en: 'Grape', hi: 'अंगूर', mr: 'द्राक्ष' }, disease: { en: 'Grape Black Rot', hi: 'अंगूर काला सड़न', mr: 'द्राक्ष काळी सड' } },
  'Grape___Esca_(Black_Measles)': { crop: { en: 'Grape', hi: 'अंगूर', mr: 'द्राक्ष' }, disease: { en: 'Grape Esca', hi: 'अंगूर एस्का (ब्लैक मीजल्स)', mr: 'द्राक्ष एस्का' } },
  'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)': { crop: { en: 'Grape', hi: 'अंगूर', mr: 'द्राक्ष' }, disease: { en: 'Grape Leaf Blight', hi: 'अंगूर लीफ ब्लाइट', mr: 'द्राक्ष करपा' } },
  'Grape___healthy': { crop: { en: 'Grape', hi: 'अंगूर', mr: 'द्राक्ष' }, disease: { en: 'Healthy Grape', hi: 'स्वस्थ अंगूर', mr: 'निरोगी द्राक्ष' } },
  'Orange___Haunglongbing_(Citrus_greening)': { crop: { en: 'Orange', hi: 'संतरा', mr: 'संत्री' }, disease: { en: 'Citrus Greening (HLB)', hi: 'सिट्रस ग्रीनिंग', mr: 'सिट्रस ग्रीनिंग' } },
  'Peach___Bacterial_spot': { crop: { en: 'Peach', hi: 'आड़ू', mr: 'आडू' }, disease: { en: 'Peach Bacterial Spot', hi: 'आड़ू बैक्टीरियल स्पॉट', mr: 'पीच जिवाणू ठिपका' } },
  'Peach___healthy': { crop: { en: 'Peach', hi: 'आड़ू', mr: 'आडू' }, disease: { en: 'Healthy Peach', hi: 'स्वस्थ आड़ू', mr: 'निरोगी आडू' } },
  'Pepper,_bell___Bacterial_spot': { crop: { en: 'Bell Pepper', hi: 'शिमला मिर्च', mr: 'भोपळी मिरची' }, disease: { en: 'Bell Pepper Bacterial Spot', hi: 'शिमला मिर्च बैक्टीरियल स्पॉट', mr: 'भोपळी मिरची जिवाणू ठिपका' } },
  'Pepper,_bell___healthy': { crop: { en: 'Bell Pepper', hi: 'शिमला मिर्च', mr: 'भोपळी मिरची' }, disease: { en: 'Healthy Bell Pepper', hi: 'स्वस्थ शिमला मिर्च', mr: 'निरोगी भोपळी मिरची' } },
  'Potato___Early_blight': { crop: { en: 'Potato', hi: 'आलू', mr: 'बटाटा' }, disease: { en: 'Potato Early Blight', hi: 'आलू अगेती झुलसा', mr: 'बटाटा अगेती करपा' } },
  'Potato___Late_blight': { crop: { en: 'Potato', hi: 'आलू', mr: 'बटाटा' }, disease: { en: 'Potato Late Blight', hi: 'आलू पछेती झुलसा', mr: 'बटाटा पछेती करपा' } },
  'Potato___healthy': { crop: { en: 'Potato', hi: 'आलू', mr: 'बटाटा' }, disease: { en: 'Healthy Potato', hi: 'स्वस्थ आलू', mr: 'निरोगी बटाटा' } },
  'Raspberry___healthy': { crop: { en: 'Raspberry', hi: 'रास्पबेरी', mr: 'रास्पबेरी' }, disease: { en: 'Healthy Raspberry', hi: 'स्वस्थ रास्पबेरी', mr: 'निरोगी रास्पबेरी' } },
  'Soybean___healthy': { crop: { en: 'Soybean', hi: 'सोयाबीन', mr: 'सोयाबीन' }, disease: { en: 'Healthy Soybean', hi: 'स्वस्थ सोयाबीन', mr: 'निरोगी सोयाबीन' } },
  'Squash___Powdery_mildew': { crop: { en: 'Squash', hi: 'स्क्वैश', mr: 'स्क्वॅश' }, disease: { en: 'Squash Powdery Mildew', hi: 'स्क्वैश चूर्णी फफूंदी', mr: 'स्क्वाश भुरी रोग' } },
  'Strawberry___Leaf_scorch': { crop: { en: 'Strawberry', hi: 'स्ट्रॉबेरी', mr: 'स्ट्रॉबेरी' }, disease: { en: 'Strawberry Leaf Scorch', hi: 'स्ट्रॉबेरी लीफ स्कॉर्च', mr: 'स्ट्रॉबेरी लीफ स्कॉर्च' } },
  'Strawberry___healthy': { crop: { en: 'Strawberry', hi: 'स्ट्रॉबेरी', mr: 'स्ट्रॉबेरी' }, disease: { en: 'Healthy Strawberry', hi: 'स्वस्थ स्ट्रॉबेरी', mr: 'निरोगी स्ट्रॉबेरी' } },
  'Tomato___Bacterial_spot': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Tomato Bacterial Spot', hi: 'टमाटर बैक्टीरियल स्पॉट', mr: 'टोमॅटो जिवाणू ठिपका' } },
  'Tomato___Early_blight': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Tomato Early Blight', hi: 'टमाटर अगेती झुलसा', mr: 'टोमॅटो अगेती करपा' } },
  'Tomato___Late_blight': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Tomato Late Blight', hi: 'टमाटर पछेती झुलसा', mr: 'टोमॅटो पछेती करपा' } },
  'Tomato___Leaf_Mold': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Tomato Leaf Mold', hi: 'टमाटर लीफ मोल्ड', mr: 'टोमॅटो लीफ मोल्ड' } },
  'Tomato___Septoria_leaf_spot': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Tomato Septoria Leaf Spot', hi: 'टमाटर सेप्टोरिया लीफ स्पॉट', mr: 'टोमॅटो सेप्टोरिया लीफ स्पॉट' } },
  'Tomato___Spider_mites Two-spotted_spider_mite': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Tomato Spider Mites', hi: 'टमाटर स्पाइडर माइट्स', mr: 'टोमॅटो कोळी (स्पायडर माइट्स)' } },
  'Tomato___Target_Spot': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Tomato Target Spot', hi: 'टमाटर टारगेट स्पॉट', mr: 'टोमॅटो टार्गेट स्पॉट' } },
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Tomato Yellow Leaf Curl', hi: 'टमाटर पीला पत्ता मरोड़ वायरस', mr: 'टोमॅटो पिवळी पाने गुंडाळणारा विषाणू' } },
  'Tomato___Tomato_mosaic_virus': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Tomato Mosaic Virus', hi: 'टमाटर मोज़ेक वायरस', mr: 'टोमॅटो मोझॅक विषाणू' } },
  'Tomato___healthy': { crop: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' }, disease: { en: 'Healthy Tomato', hi: 'स्वस्थ टमाटर', mr: 'निरोगी टोमॅटो' } },
}

export function diseaseLabel(value: string | undefined, locale: Locale) {
  return classTranslations[value || '']?.disease[locale] || classLabel(value)
}

export function cropLabelLocalized(value: string | undefined, locale: Locale) {
  return classTranslations[value || '']?.crop[locale] || cropLabel(value)
}

export const diseaseClassCount = Object.keys(classTranslations).length

export function isHealthy(value?: string) {
  return value?.toLowerCase().includes('healthy') ?? false
}

export function formatConfidence(value: number) {
  return `${value.toFixed(2)}%`
}

export function relativeTime(value: string, locale: Locale = 'en') {
  const diff = Math.max(0, Date.now() - new Date(value).getTime())

  const mins = Math.floor(diff / 60000)

  if (mins < 60) {
    return locale === 'hi' ? `${mins} मिनट पहले` : locale === 'mr' ? `${mins} मिनिटांपूर्वी` : `${mins} min ago`
  }

  const hours = Math.floor(mins / 60)

  if (hours < 24) {
    return locale === 'hi' ? `${hours} घंटे पहले` : locale === 'mr' ? `${hours} तासांपूर्वी` : `${hours} hr ago`
  }

  const days = Math.floor(hours / 24)
  return locale === 'hi' ? `${days} दिन पहले` : locale === 'mr' ? `${days} दिवसांपूर्वी` : `${days} days ago`
}

export function friendlyError(error: unknown, locale: Locale = 'en') {
  const message = error instanceof Error ? error.message : ''

  if (
    message.includes('Invalid image') ||
    message.includes('No image')
  ) {
    return locale === 'hi' ? 'इस तस्वीर को पढ़ नहीं सके। एक पत्ती की अधिक स्पष्ट तस्वीर लें।' : locale === 'mr' ? 'हा फोटो वाचता आला नाही. एका पानाचा अधिक स्पष्ट फोटो घ्या.' : 'Couldn’t read that image. Try a clearer photo of a single leaf.'
  }

  if (message.includes('Failed to fetch')) {
    return locale === 'hi' ? 'फील्ड स्टेशन अभी उपलब्ध नहीं है। API कनेक्शन जाँचकर फिर कोशिश करें।' : locale === 'mr' ? 'फील्ड स्टेशन सध्या उपलब्ध नाही. API कनेक्शन तपासून पुन्हा प्रयत्न करा.' : 'The field station is not reachable right now. Check the API connection and try again.'
  }

  return locale === 'hi' ? 'फील्ड रिपोर्ट पढ़ते समय कुछ गलत हुआ। कृपया फिर कोशिश करें।' : locale === 'mr' ? 'फील्ड रिपोर्ट वाचताना काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.' : 'Something went wrong while reading this field report. Please try again.'
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      body.error || `Request failed (${response.status})`
    )
  }

  return body as T
}

/*
|--------------------------------------------------------------------------
| PREDICTION + GRAD-CAM
|--------------------------------------------------------------------------
|
| IMPORTANT:
| We intentionally run /predict FIRST.
|
| /predict creates the MongoDB scan and returns scan_id.
|
| Then we send that scan_id to /gradcam so the backend
| can save the generated heatmap to the SAME MongoDB scan.
|
*/

export async function predictLeaf(file: File) {
  // STEP 1: Send image to /predict
  const body = new FormData()

  body.append('image', file)

  const prediction = await apiFetch<Prediction>(
    '/predict',
    {
      method: 'POST',
      body,
    }
  )

  // STEP 2: Create a new FormData for Grad-CAM
  const gradcamBody = new FormData()

  gradcamBody.append('image', file)

  // IMPORTANT:
  // Send the scan_id created by /predict
  gradcamBody.append('scan_id', prediction.scan_id)

  // STEP 3: Generate Grad-CAM and save it to MongoDB
  const gradcam = await apiFetch<Gradcam>(
    '/gradcam',
    {
      method: 'POST',
      body: gradcamBody,
    }
  )

  // STEP 4: Combine prediction + Grad-CAM
  return {
    ...prediction,
    ...gradcam,
  }
}

export function encodeClass(value: string) {
  return encodeURIComponent(value)
}

export function scanStorageKey() {
  return 'cropguard-latest-scan'
}

export function readStoredScan():
  (Prediction & Gradcam) | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return JSON.parse(
      sessionStorage.getItem(scanStorageKey()) || 'null'
    )
  } catch {
    return null
  }
}

export function storeScan(value: Prediction & Gradcam) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(
      scanStorageKey(),
      JSON.stringify(value)
    )
  }
}

export const copy = {
  en: {
    heroKicker: 'CropGuard / field notes',
    heroTitle: 'A clearer read on what is happening to your crop.',
    heroBody:
      'Take a photo of one leaf. CropGuard identifies likely disease, shows what the model saw, and gives you a practical next step—in English, Hindi, or Marathi.',
    specimen: 'Specimen report',
    confidence: 'Confidence',
    alternatives: 'Other likely reads',
    symptoms: 'Symptoms',
    treatment: 'Treatment',
    prevention: 'Prevention',
    healthy: 'Healthy plant',
    healthyBody:
      'No disease signal was found in this specimen.',
    checkWeather: 'Check weather risk',
    viewInfo: 'View disease info',
    choosePhoto: 'Choose a leaf photo',
    scan: 'Scan a leaf',
    dropPhoto: 'Drop it here or choose a file',
    location: 'Field location (optional)',
    runScan: 'Run diagnosis',
    scanning: 'Reading specimen…',
    browseReference: 'Browse disease reference',
    privateReport: 'Private field report',
    cropClasses: '38 crop classes',
    specimenReady: 'Specimen 001',
    readyCapture: 'Ready for capture',
    clearLeafPhoto: 'One clear leaf photo',
    howItReads: 'How it reads',
    howItReadsTitle: 'From a photo to a field note.',
    capture: 'Capture',
    captureBody: 'Photograph one leaf in good daylight. A simple, close view gives the model its best chance.',
    understand: 'Understand',
    understandBody: 'See the confidence, alternate readings, and heatmap that shows where the model looked.',
    respond: 'Respond',
    respondBody: 'Read treatment and prevention notes, then check local weather conditions that may spread disease.',
    homeAria: 'CropGuard home',
    language: 'Language',
    predictDescription: 'Use a close, well-lit image of one leaf. The clearer the specimen, the more useful the read.',
    imageSpecimen: 'Image specimen',
    chooseAnotherPhoto: 'Choose another photo',
    fileHint: 'JPG, PNG · one leaf works best',
    locationPlaceholder: 'e.g. Nashik, Maharashtra',
    loadingDetail: 'This usually takes a few seconds.',
    invalidImage: 'Please choose a photo file, such as JPG or PNG.',
    missingPhoto: 'Choose a clear photo of one leaf first.',
    missingLocation: 'Enter a city or field location first.',
    weatherKicker: 'CropGuard / climate note',
    weatherTitle: 'Weather risk',
    weatherDescription: 'Weather can change how quickly disease spreads. Add a nearby city for a current field note.',
    fieldLocation: 'Field location',
    cityPlaceholder: 'e.g. Mumbai',
    check: 'Check',
    currentConditions: 'current conditions',
    spreadRisk: 'spread risk',
    temperature: 'Temperature',
    humidity: 'Humidity',
    weather: 'Weather',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    historyKicker: 'CropGuard / archive',
    historyTitle: 'Scan history',
    historyDescription: 'Past field reports, kept together so you can compare how a crop changes over time.',
    readingArchive: 'Reading the archive…',
    archiveEmptyTitle: 'Your archive starts with one leaf.',
    archiveEmptyBody: 'Run a scan and your field reports will appear here for easy comparison.',
    leafScan: 'Leaf scan',
    leafScanThumbnail: 'Leaf scan thumbnail',
    referenceKicker: 'CropGuard / reference',
    referenceDescription: 'Plain-language notes for identifying, treating, and preventing common crop disease.',
    loadingDiseaseReference: 'Loading disease reference…',
    reportKicker: 'CropGuard / report',
    diagnosisReadout: 'Diagnosis readout',
    fieldReport: 'Field report',
    resultsDescription: 'Read the model output as a guide: confidence is shown alongside the alternate possibilities, not hidden.',
    noSpecimen: 'No specimen selected',
    runFirst: 'Run a leaf scan first to see a field report here.',
    heatmapAlt: 'Grad-CAM heatmap showing areas used for the diagnosis',
    heatmapUnavailable: 'Heatmap unavailable for this report.',
    nextNote: 'Next note',
    healthyNext: 'Keep monitoring this crop and compare new photos over time.',
    diseaseNext: 'Pair this diagnosis with the disease reference and local weather conditions before deciding what to do.',
    loadingFieldReport: 'Loading field report…',
  },

  hi: {
    heroKicker: 'क्रॉपगार्ड / खेत नोट्स',
    heroTitle:
      'आपकी फसल में क्या हो रहा है, इसकी स्पष्ट जानकारी।',
    heroBody:
      'एक पत्ती की तस्वीर लें। क्रॉपगार्ड संभावित रोग पहचानता है और अगला कदम बताता है—अंग्रेज़ी, हिन्दी या मराठी में।',
    specimen: 'नमूना रिपोर्ट',
    confidence: 'विश्वास',
    alternatives: 'अन्य संभावित परिणाम',
    symptoms: 'लक्षण',
    treatment: 'उपचार',
    prevention: 'रोकथाम',
    healthy: 'स्वस्थ पौधा',
    healthyBody:
      'इस नमूने में रोग का संकेत नहीं मिला।',
    checkWeather: 'मौसम जोखिम देखें',
    viewInfo: 'रोग जानकारी देखें',
    choosePhoto: 'पत्ती की तस्वीर चुनें',
    scan: 'पत्ती स्कैन करें',
    dropPhoto: 'यहाँ छोड़ें या फ़ाइल चुनें',
    location: 'खेत का स्थान (वैकल्पिक)',
    runScan: 'निदान शुरू करें',
    scanning: 'नमूना पढ़ा जा रहा है…',
    browseReference: 'रोग संदर्भ देखें',
    privateReport: 'निजी फील्ड रिपोर्ट',
    cropClasses: '38 फसल वर्ग',
    specimenReady: 'नमूना 001',
    readyCapture: 'तस्वीर के लिए तैयार',
    clearLeafPhoto: 'पत्ती की एक स्पष्ट तस्वीर',
    howItReads: 'यह कैसे पढ़ता है',
    howItReadsTitle: 'तस्वीर से फील्ड रिपोर्ट तक।',
    capture: 'तस्वीर लें',
    captureBody: 'अच्छी रोशनी में एक पत्ती की तस्वीर लें। पास से ली गई स्पष्ट तस्वीर मॉडल के लिए सबसे उपयोगी होती है।',
    understand: 'समझें',
    understandBody: 'विश्वास, अन्य संभावित परिणाम और मॉडल द्वारा देखे गए हिस्से का हीटमैप देखें।',
    respond: 'कार्रवाई करें',
    respondBody: 'उपचार और रोकथाम की जानकारी पढ़ें, फिर रोग फैलाने वाले स्थानीय मौसम की जाँच करें।',
    homeAria: 'क्रॉपगार्ड होम',
    language: 'भाषा',
    predictDescription: 'एक पत्ती की पास से ली गई, अच्छी रोशनी वाली तस्वीर का उपयोग करें। नमूना जितना स्पष्ट होगा, परिणाम उतना उपयोगी होगा।',
    imageSpecimen: 'नमूना तस्वीर',
    chooseAnotherPhoto: 'दूसरी तस्वीर चुनें',
    fileHint: 'JPG, PNG · एक पत्ती सबसे अच्छी रहती है',
    locationPlaceholder: 'जैसे नासिक, महाराष्ट्र',
    loadingDetail: 'इसमें आमतौर पर कुछ सेकंड लगते हैं।',
    invalidImage: 'कृपया JPG या PNG जैसी तस्वीर फ़ाइल चुनें।',
    missingPhoto: 'पहले एक पत्ती की स्पष्ट तस्वीर चुनें।',
    missingLocation: 'पहले कोई शहर या खेत का स्थान दर्ज करें।',
    weatherKicker: 'क्रॉपगार्ड / मौसम नोट',
    weatherTitle: 'मौसम जोखिम',
    weatherDescription: 'मौसम रोग के फैलने की गति बदल सकता है। वर्तमान फील्ड रिपोर्ट के लिए पास का शहर जोड़ें।',
    fieldLocation: 'खेत का स्थान',
    cityPlaceholder: 'जैसे मुंबई',
    check: 'जाँचें',
    currentConditions: 'वर्तमान स्थिति',
    spreadRisk: 'फैलाव का जोखिम',
    temperature: 'तापमान',
    humidity: 'नमी',
    weather: 'मौसम',
    low: 'कम',
    medium: 'मध्यम',
    high: 'अधिक',
    historyKicker: 'क्रॉपगार्ड / संग्रह',
    historyTitle: 'स्कैन इतिहास',
    historyDescription: 'पिछली फील्ड रिपोर्ट एक जगह रखें और समय के साथ फसल में बदलाव की तुलना करें।',
    readingArchive: 'संग्रह पढ़ा जा रहा है…',
    archiveEmptyTitle: 'आपका संग्रह एक पत्ती से शुरू होता है।',
    archiveEmptyBody: 'स्कैन चलाएँ और आपकी फील्ड रिपोर्ट आसान तुलना के लिए यहाँ दिखाई देंगी।',
    leafScan: 'पत्ती स्कैन',
    leafScanThumbnail: 'पत्ती स्कैन का थंबनेल',
    referenceKicker: 'क्रॉपगार्ड / संदर्भ',
    referenceDescription: 'सामान्य फसल रोगों की पहचान, उपचार और रोकथाम के लिए सरल जानकारी।',
    loadingDiseaseReference: 'रोग संदर्भ लोड हो रहा है…',
    reportKicker: 'क्रॉपगार्ड / रिपोर्ट',
    diagnosisReadout: 'निदान परिणाम',
    fieldReport: 'फील्ड रिपोर्ट',
    resultsDescription: 'मॉडल के परिणाम को मार्गदर्शन की तरह पढ़ें: विश्वास के साथ अन्य संभावनाएँ भी दिखाई जाती हैं।',
    noSpecimen: 'कोई नमूना नहीं चुना गया',
    runFirst: 'फील्ड रिपोर्ट देखने के लिए पहले पत्ती स्कैन चलाएँ।',
    heatmapAlt: 'निदान के लिए उपयोग किए गए क्षेत्रों का Grad-CAM हीटमैप',
    heatmapUnavailable: 'इस रिपोर्ट के लिए हीटमैप उपलब्ध नहीं है।',
    nextNote: 'अगला नोट',
    healthyNext: 'इस फसल की निगरानी करते रहें और समय के साथ नई तस्वीरों की तुलना करें।',
    diseaseNext: 'निर्णय लेने से पहले इस निदान को रोग संदर्भ और स्थानीय मौसम की जानकारी से मिलाएँ।',
    loadingFieldReport: 'फील्ड रिपोर्ट लोड हो रही है…',
  },

  mr: {
    heroKicker: 'क्रॉपगार्ड / शेत नोंदी',
    heroTitle:
      'तुमच्या पिकाला नेमकं काय होतंय याचा स्पष्ट अंदाज.',
    heroBody:
      'एका पानाचा फोटो घ्या. क्रॉपगार्ड संभाव्य रोग ओळखतो आणि पुढील कृती सांगतो—इंग्रजी, हिंदी किंवा मराठीत.',
    specimen: 'नमुना अहवाल',
    confidence: 'विश्वास',
    alternatives: 'इतर संभाव्य निष्कर्ष',
    symptoms: 'लक्षणे',
    treatment: 'उपचार',
    prevention: 'प्रतिबंध',
    healthy: 'निरोगी पिक',
    healthyBody:
      'या नमुन्यात रोगाचा संकेत आढळला नाही.',
    checkWeather: 'हवामान धोका पहा',
    viewInfo: 'रोग माहिती पहा',
    choosePhoto: 'पानाचा फोटो निवडा',
    scan: 'पान स्कॅन करा',
    dropPhoto: 'इथे टाका किंवा फाइल निवडा',
    location: 'शेताचे ठिकाण (ऐच्छिक)',
    runScan: 'निदान सुरू करा',
    scanning: 'नमुना वाचला जात आहे…',
    browseReference: 'रोग संदर्भ पहा',
    privateReport: 'खासगी शेत अहवाल',
    cropClasses: '३८ पिकांचे वर्ग',
    specimenReady: 'नमुना ००१',
    readyCapture: 'फोटोसाठी तयार',
    clearLeafPhoto: 'पानाचा एक स्पष्ट फोटो',
    howItReads: 'हे कसे वाचते',
    howItReadsTitle: 'फोटोपासून शेत अहवालापर्यंत.',
    capture: 'फोटो घ्या',
    captureBody: 'चांगल्या प्रकाशात एका पानाचा फोटो घ्या. जवळून घेतलेला स्पष्ट फोटो मॉडेलसाठी सर्वात उपयुक्त असतो.',
    understand: 'समजून घ्या',
    understandBody: 'विश्वास, इतर संभाव्य निष्कर्ष आणि मॉडेलने पाहिलेला भाग दाखवणारा हीटमॅप पहा.',
    respond: 'कृती करा',
    respondBody: 'उपचार व प्रतिबंधाच्या नोंदी वाचा, नंतर रोग पसरवू शकणारे स्थानिक हवामान तपासा.',
    homeAria: 'क्रॉपगार्ड होम',
    language: 'भाषा',
    predictDescription: 'एका पानाचा जवळून घेतलेला, चांगल्या प्रकाशातील फोटो वापरा. नमुना जितका स्पष्ट, तितका निष्कर्ष उपयुक्त.',
    imageSpecimen: 'नमुना फोटो',
    chooseAnotherPhoto: 'दुसरा फोटो निवडा',
    fileHint: 'JPG, PNG · एका पानाचा फोटो उत्तम',
    locationPlaceholder: 'उदा. नाशिक, महाराष्ट्र',
    loadingDetail: 'यासाठी साधारण काही सेकंद लागतात.',
    invalidImage: 'कृपया JPG किंवा PNG सारखी फोटो फाइल निवडा.',
    missingPhoto: 'आधी एका पानाचा स्पष्ट फोटो निवडा.',
    missingLocation: 'आधी शहर किंवा शेताचे ठिकाण भरा.',
    weatherKicker: 'क्रॉपगार्ड / हवामान नोंद',
    weatherTitle: 'हवामान धोका',
    weatherDescription: 'हवामानामुळे रोग किती वेगाने पसरतो ते बदलू शकते. सध्याच्या शेत नोंदीसाठी जवळचे शहर जोडा.',
    fieldLocation: 'शेताचे ठिकाण',
    cityPlaceholder: 'उदा. मुंबई',
    check: 'तपासा',
    currentConditions: 'सध्याची स्थिती',
    spreadRisk: 'प्रसाराचा धोका',
    temperature: 'तापमान',
    humidity: 'आर्द्रता',
    weather: 'हवामान',
    low: 'कमी',
    medium: 'मध्यम',
    high: 'जास्त',
    historyKicker: 'क्रॉपगार्ड / संग्रह',
    historyTitle: 'स्कॅन इतिहास',
    historyDescription: 'मागील शेत अहवाल एकत्र ठेवा आणि काळानुसार पिकातील बदलांची तुलना करा.',
    readingArchive: 'संग्रह वाचला जात आहे…',
    archiveEmptyTitle: 'तुमचा संग्रह एका पानापासून सुरू होतो.',
    archiveEmptyBody: 'स्कॅन करा आणि तुलना करण्यासाठी तुमचे शेत अहवाल येथे दिसतील.',
    leafScan: 'पान स्कॅन',
    leafScanThumbnail: 'पान स्कॅनचा थंबनेल',
    referenceKicker: 'क्रॉपगार्ड / संदर्भ',
    referenceDescription: 'सामान्य पिकांच्या रोगांची ओळख, उपचार आणि प्रतिबंध यासाठी सोप्या भाषेतील माहिती.',
    loadingDiseaseReference: 'रोग संदर्भ लोड होत आहे…',
    reportKicker: 'क्रॉपगार्ड / अहवाल',
    diagnosisReadout: 'निदान निष्कर्ष',
    fieldReport: 'शेत अहवाल',
    resultsDescription: 'मॉडेलचा निष्कर्ष मार्गदर्शन म्हणून वाचा: विश्वासासोबत इतर शक्यताही दाखवल्या आहेत.',
    noSpecimen: 'नमुना निवडलेला नाही',
    runFirst: 'शेत अहवाल पाहण्यासाठी आधी पान स्कॅन करा.',
    heatmapAlt: 'निदानासाठी वापरलेल्या भागांचा Grad-CAM हीटमॅप',
    heatmapUnavailable: 'या अहवालासाठी हीटमॅप उपलब्ध नाही.',
    nextNote: 'पुढील नोंद',
    healthyNext: 'या पिकावर लक्ष ठेवत राहा आणि कालांतराने नवीन फोटोंची तुलना करा.',
    diseaseNext: 'काय करायचे ठरवण्यापूर्वी या निदानाची रोग संदर्भ व स्थानिक हवामानाशी तुलना करा.',
    loadingFieldReport: 'शेत अहवाल लोड होत आहे…',
  },
} as const

export function diseaseCopy(locale: Locale) {
  return copy[locale]
}

export function imageFromScan(scan: Scan) {
  return scan.image_thumbnail || undefined
}

export async function getDiseaseInfo(
  className: string,
  lang: Locale
) {
  return apiFetch<DiseaseInfo>(
    `/disease-info/${encodeClass(className)}?lang=${lang}`
  )
}

export async function getDiseaseClasses() {
  return apiFetch<{
    classes: string[]
    count: number
  }>('/disease-info')
}

export async function getWeather(query: string) {
  return apiFetch<Weather>(
    `/weather?city=${encodeURIComponent(query)}`
  )
}

export async function getHistory() {
  return apiFetch<Scan[]>('/history')
}

export async function getScan(id: string) {
  return apiFetch<Scan>(
    `/history/${encodeURIComponent(id)}`
  )
}

export function makePreview(file: File) {
  return URL.createObjectURL(file)
}