'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLabels } from '@/components/locale-provider'
import {
  cropLabelLocalized,
  diseaseLabel,
  friendlyError,
  getDiseaseClasses,
  getDiseaseInfo,
  type DiseaseInfo,
} from '@/lib/cropguard'

export default function DiseaseInfoClient() {
  const { locale, copy } = useLabels()
  const params = useSearchParams()
  const selected = params.get('class')

  const [info, setInfo] = useState<DiseaseInfo | null>(null)
  const [classes, setClasses] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setError('')

    ;(async () => {
      try {
        if (selected) {
          const result = await getDiseaseInfo(selected, locale)

          if (active) {
            setInfo(result)
          }
        } else {
          const result = await getDiseaseClasses()

          if (active) {
            setClasses(result.classes)
          }
        }
      } catch (err) {
        if (active) {
          setError(friendlyError(err, locale))
        }
      }
    })()

    return () => {
      active = false
    }
  }, [selected, locale])

  return (
    <div className="route-main">
      <div className="route-head">
        <div>
          <p className="eyebrow">
            {copy.referenceKicker}
          </p>

          <h1 className="page-title">
            {selected ? diseaseLabel(selected, locale) : copy.viewInfo}
          </h1>
        </div>

        <p>
          {copy.referenceDescription}
        </p>
      </div>

      <div style={{ marginTop: 34 }}>
        {error && (
          <p className="error-note" role="alert">
            {error}
          </p>
        )}

        {info ? (
          <div className="detail-grid">
            <section className="report-panel">
              <p className="eyebrow">01</p>

              <h3>{copy.symptoms}</h3>

              <p>{info.symptoms}</p>
            </section>

            <section className="report-panel">
              <p className="eyebrow">02</p>

              <h3>{copy.treatment}</h3>

              <p>{info.treatment}</p>
            </section>

            <section className="report-panel">
              <p className="eyebrow">03</p>

              <h3>{copy.prevention}</h3>

              <p>{info.prevention}</p>
            </section>
          </div>
        ) : (
          <div className="history-list">
            {classes.map((item) => (
              <a
                className="history-item"
                key={item}
                href={`/disease-info?class=${encodeURIComponent(item)}`}
              >
                <span className="brand-mark">
                  <span>{item.slice(0, 1)}</span>
                </span>

                <div>
                  <h3>{diseaseLabel(item, locale)}</h3>

                  <p>{cropLabelLocalized(item, locale)}</p>
                </div>

                <span className="font-mono">→</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}