'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { labels, diseaseCopy, type Locale } from '@/lib/cropguard'

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void }
const LocaleContext = createContext<LocaleContextValue>({ locale: 'en', setLocale: () => {} })
export function LocaleProvider({ children }: { children: React.ReactNode }) { const [locale, setLocaleState] = useState<Locale>('en'); useEffect(() => { const saved = window.localStorage.getItem('cropguard-locale') as Locale | null; if (saved === 'en' || saved === 'hi' || saved === 'mr') setLocaleState(saved) }, []); const setLocale = (next: Locale) => { setLocaleState(next); window.localStorage.setItem('cropguard-locale', next) }; return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider> }
export function useLocale() { return useContext(LocaleContext) }
export function useLabels() { const { locale } = useLocale(); return { locale, ...labels[locale], copy: diseaseCopy(locale) } }
