'use client'

import { useState } from 'react'
import { CloudSun, Droplets, LoaderCircle, MapPin, Thermometer } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useLabels } from '@/components/locale-provider'
import { friendlyError, getWeather, type Weather } from '@/lib/cropguard'

function WeatherContent() {
  const { locale, copy } = useLabels()
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<Weather | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!city.trim()) {
      setError(copy.missingLocation)
      return
    }
    setLoading(true)
    setError('')
    try {
      setWeather(await getWeather(city.trim()))
    } catch (err) {
      setError(friendlyError(err, locale))
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const risk = weather?.disease_spread_risk
  const riskText = risk === 'Low' ? copy.low : risk === 'Medium' ? copy.medium : copy.high

  return (
    <div className="route-main">
      <div className="route-head">
        <div>
          <p className="eyebrow">{copy.weatherKicker}</p>
          <h1 className="page-title">{copy.weatherTitle}</h1>
        </div>
        <p>{copy.weatherDescription}</p>
      </div>
      <div className="report-panel" style={{ marginTop: 34 }}>
        <label className="field-label" htmlFor="city">
          <MapPin aria-hidden="true" style={{ width: 13, display: 'inline' }} /> {copy.fieldLocation}
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input id="city" className="field-input" placeholder={copy.cityPlaceholder} value={city} onChange={(event) => setCity(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') search() }} />
          <button className="button button-primary" onClick={search} disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" /> : <CloudSun />} {copy.check}
          </button>
        </div>
        {error && <p className="error-note" style={{ marginTop: 18 }}>{error}</p>}
      </div>
      {weather && (
        <div className="report-panel" style={{ marginTop: 24 }}>
          <div className="readout">
            <div>
              <p className="eyebrow">{weather.location} / {copy.currentConditions}</p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, fontWeight: 500, margin: 0 }}>{weather.description}</h2>
            </div>
            <span className={`risk-badge risk-${risk?.toLowerCase()}`}>{riskText} {copy.spreadRisk}</span>
          </div>
          <div className="detail-grid">
            <div><Thermometer style={{ color: 'var(--rust)' }} /><p className="field-label">{copy.temperature}</p><strong className="font-mono">{weather.temperature_c.toFixed(1)}°C</strong></div>
            <div><Droplets style={{ color: 'var(--primary)' }} /><p className="field-label">{copy.humidity}</p><strong className="font-mono">{weather.humidity}%</strong></div>
            <div><CloudSun style={{ color: 'var(--amber)' }} /><p className="field-label">{copy.weather}</p><strong>{weather.weather}</strong></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function WeatherPage() {
  return <AppShell><WeatherContent /></AppShell>
}
