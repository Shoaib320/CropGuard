import { Suspense } from 'react'
import ResultsClient from './results-client'
import { AppShell } from '@/components/app-shell'
import { LocalizedLoading } from '@/components/localized-loading'

export default function ResultsPage() { return <AppShell><Suspense fallback={<LocalizedLoading kind="fieldReport" />}><ResultsClient /></Suspense></AppShell> }
