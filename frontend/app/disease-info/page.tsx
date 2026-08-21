import { Suspense } from 'react'
import DiseaseInfoClient from './disease-info-client'
import { AppShell } from '@/components/app-shell'
import { LocalizedLoading } from '@/components/localized-loading'
export default function DiseaseInfoPage() { return <AppShell><Suspense fallback={<LocalizedLoading kind="diseaseReference" />}><DiseaseInfoClient /></Suspense></AppShell> }
