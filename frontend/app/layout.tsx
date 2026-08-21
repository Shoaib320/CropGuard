import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const serif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = { title: 'CropGuard — Field diagnosis from a leaf photo', description: 'CropGuard identifies likely crop disease from a leaf photo and explains what to do next.', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'light', themeColor: '#F5F0E6', userScalable: true }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${inter.variable} ${serif.variable} ${mono.variable}`}><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html> }
