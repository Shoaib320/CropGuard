'use client'

import { useRef, useState } from 'react'
import { Camera, ImagePlus, LoaderCircle, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { useLabels } from '@/components/locale-provider'
import { friendlyError, makePreview, predictLeaf, storeScan } from '@/lib/cropguard'

function PredictContent() {
  const { locale, copy } = useLabels()
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const choose = (next: File | undefined) => {
    if (!next) return
    if (!next.type.startsWith('image/')) {
      setError(copy.invalidImage)
      return
    }
    setError('')
    setFile(next)
    setPreview(makePreview(next))
  }

  const submit = async () => {
    if (!file) {
      setError(copy.missingPhoto)
      return
    }
    setLoading(true)
    setError('')
    try {
      const scan = await predictLeaf(file)
      storeScan(scan)
      router.push(`/results?scan_id=${scan.scan_id}`)
    } catch (err) {
      setError(friendlyError(err, locale))
      setLoading(false)
    }
  }

  return (
    <div className="route-main">
      <div className="route-head">
        <div>
          <p className="eyebrow">{copy.specimen}</p>
          <h1 className="page-title">{copy.choosePhoto}</h1>
        </div>
        <p>{copy.predictDescription}</p>
      </div>
      <div className="report-panel report-stack" style={{ marginTop: 34 }}>
        <div>
          <span className="field-label">{copy.imageSpecimen}</span>
          {preview ? (
            <div>
              <img className="preview-image" src={preview} alt={copy.clearLeafPhoto} />
              <button className="text-link" style={{ marginTop: 12 }} onClick={() => input.current?.click()}>
                {copy.chooseAnotherPhoto}
              </button>
            </div>
          ) : (
            <button
              className="dropzone"
              onClick={() => input.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                choose(event.dataTransfer.files[0])
              }}
            >
              <span>
                <ImagePlus aria-hidden="true" />
                <p>{copy.dropPhoto}</p>
                <small>{copy.fileHint}</small>
              </span>
            </button>
          )}
          <input ref={input} hidden type="file" accept="image/*" capture="environment" onChange={(event) => choose(event.target.files?.[0])} />
        </div>
        <div>
          <label className="field-label" htmlFor="location">
            <MapPin aria-hidden="true" style={{ width: 13, display: 'inline' }} /> {copy.location}
          </label>
          <input id="location" className="field-input" placeholder={copy.locationPlaceholder} value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>
        {error && <p className="error-note" role="alert">{error}</p>}
        {loading ? (
          <p className="loading-note">
            <LoaderCircle className="animate-spin" style={{ width: 16, display: 'inline', marginRight: 8 }} />
            {copy.scanning} {copy.loadingDetail}
          </p>
        ) : (
          <button className="button button-primary" onClick={submit}>
            <Camera aria-hidden="true" /> {copy.runScan}
          </button>
        )}
      </div>
    </div>
  )
}

export default function PredictPage() {
  return <AppShell><PredictContent /></AppShell>
}
