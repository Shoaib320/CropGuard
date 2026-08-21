'use client'

import Link from 'next/link'
import { ArrowUpRight, Camera, CloudSun, FileText, Leaf, ShieldCheck } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useLabels } from '@/components/locale-provider'

function HomeContent() {
	const { copy } = useLabels()

	return <div className="page-wrap"><section className="hero-grid"><div className="hero-copy"><p className="eyebrow">{copy.heroKicker}</p><h1>{copy.heroTitle}</h1><p className="hero-lede">{copy.heroBody}</p><div className="hero-actions"><Link className="button button-primary" href="/predict">{copy.scan} <ArrowUpRight aria-hidden="true" /></Link><Link className="text-link" href="/disease-info">{copy.browseReference}</Link></div><div className="hero-meta"><span><ShieldCheck aria-hidden="true" /> {copy.privateReport}</span><span><Leaf aria-hidden="true" /> {copy.cropClasses}</span></div></div><div className="specimen-hero"><div className="specimen-label"><span>{copy.specimenReady}</span><span>{copy.readyCapture}</span></div><div className="leaf-illustration"><Leaf aria-hidden="true" /></div><div className="specimen-caption"><span>{copy.clearLeafPhoto}</span><span className="font-mono">EN / HI / MR</span></div></div></section><section className="report-section"><div className="section-heading"><p className="eyebrow">{copy.howItReads}</p><h2>{copy.howItReadsTitle}</h2></div><div className="process-grid"><article><Camera aria-hidden="true" /><span className="step-number">01</span><h3>{copy.capture}</h3><p>{copy.captureBody}</p></article><article><FileText aria-hidden="true" /><span className="step-number">02</span><h3>{copy.understand}</h3><p>{copy.understandBody}</p></article><article><CloudSun aria-hidden="true" /><span className="step-number">03</span><h3>{copy.respond}</h3><p>{copy.respondBody}</p></article></div></section></div>
}

export default function Page() { return <AppShell><HomeContent /></AppShell> }
