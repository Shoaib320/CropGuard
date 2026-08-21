'use client'

import Link from 'next/link'
import { History as HistoryIcon, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useLabels } from '@/components/locale-provider'
import { cropLabelLocalized, diseaseLabel, formatConfidence, friendlyError, getHistory, relativeTime, type Scan } from '@/lib/cropguard'

function HistoryContent() {
  const { locale, copy } = useLabels()
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getHistory()
      .then((result) => setScans(result))
      .catch((err) => setError(friendlyError(err, locale)))
      .finally(() => setLoading(false))
  }, [locale])

  return (
    <div className="route-main">
      <div className="route-head">
        <div>
          <p className="eyebrow">{copy.historyKicker}</p>
          <h1 className="page-title">{copy.historyTitle}</h1>
        </div>
        <p>{copy.historyDescription}</p>
      </div>
      {loading ? (
        <p className="loading-note"><LoaderCircle className="animate-spin" style={{ width: 16, display: 'inline', marginRight: 8 }} />{copy.readingArchive}</p>
      ) : error ? (
        <p className="error-note" role="alert">{error}</p>
      ) : scans.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 34 }}>
          <HistoryIcon />
          <h2>{copy.archiveEmptyTitle}</h2>
          <p>{copy.archiveEmptyBody}</p>
          <Link className="button button-primary" href="/predict">{copy.scan}</Link>
        </div>
      ) : (
        <div className="history-list">
          {scans.map((scan) => (
            <Link className="history-item" href={`/results?scan_id=${scan.scan_id}`} key={scan.scan_id}>
              {scan.image_thumbnail ? (
                <img className="scan-thumb" src={`data:image/jpeg;base64,${scan.image_thumbnail}`} alt={copy.leafScanThumbnail} />
              ) : (
                <span className="scan-thumb" style={{ background: 'var(--muted)', display: 'grid', placeItems: 'center' }}>
                  <HistoryIcon />
                </span>
              )}
              <div>
                <h3>{diseaseLabel(scan.predicted_class, locale)}</h3>
                <p>{cropLabelLocalized(scan.predicted_class, locale)} · {relativeTime(scan.timestamp, locale)}</p>
              </div>
              <span className="font-mono">{formatConfidence(scan.confidence)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  return <AppShell><HistoryContent /></AppShell>
}
