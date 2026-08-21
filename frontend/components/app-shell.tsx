'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Languages } from 'lucide-react'
import { LocaleProvider, useLocale } from '@/components/locale-provider'
import { diseaseCopy, labels, type Locale } from '@/lib/cropguard'

function Shell({ children }: { children: React.ReactNode }) { const path = usePathname(); const { locale, setLocale } = useLocale(); const copy = diseaseCopy(locale); const nav = [['/', labels[locale].home], ['/predict', labels[locale].predict], ['/disease-info', labels[locale].disease], ['/weather', labels[locale].weather], ['/history', labels[locale].history]]; return <div className="min-h-screen bg-background"><header className="report-header"><Link href="/" className="brand" aria-label={copy.homeAria}><span className="brand-mark"><Leaf /></span><span>CropGuard</span></Link><nav aria-label={labels[locale].home} className="hidden items-center gap-5 md:flex">{nav.map(([href, label]) => <Link key={href} href={href} className={path === href ? 'nav-link active' : 'nav-link'}>{label}</Link>)}</nav><label className="locale-control"><Languages aria-hidden="true" /><span className="sr-only">{copy.language}</span><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={copy.language}><option value="en">EN</option><option value="hi">हि</option><option value="mr">मरा</option></select></label></header><main>{children}</main><footer className="site-footer"><span>CropGuard / {labels[locale].fieldNote}</span><span className="font-mono">v0.1 / 2026</span></footer></div> }
export function AppShell({ children }: { children: React.ReactNode }) { return <LocaleProvider><Shell>{children}</Shell></LocaleProvider> }
