'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ResultsView } from '@/components/results-view'
import { useLabels } from '@/components/locale-provider'
import { friendlyError, getScan, readStoredScan } from '@/lib/cropguard'
export default function ResultsClient() { const { locale, copy } = useLabels(); const params = useSearchParams(); const id = params.get('scan_id'); const [scan, setScan] = useState<any>(null); const [error, setError] = useState(''); useEffect(() => { let active = true; (async () => { try { if (id) { const loaded = await getScan(id); if (active) setScan(loaded) } else if (active) setScan(readStoredScan()) } catch (err) { if (active) setError(friendlyError(err, locale)) } })(); return () => { active = false } }, [id, locale]); return <div className="route-main"><div className="route-head"><div><p className="eyebrow">{copy.reportKicker}</p><h1 className="page-title">{scan ? copy.diagnosisReadout : copy.fieldReport}</h1></div><p>{copy.resultsDescription}</p></div><div style={{ marginTop: 34 }}><ResultsView scan={scan} error={error} /></div></div> }
