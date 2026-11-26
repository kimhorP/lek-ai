import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono, Noto_Sans_Khmer } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "lek-ai — Khmer Digit Recognition",
  description: "Draw a Khmer handwritten digit (០–៩) and see it recognized with AI. Runs entirely in your browser — no server needed.",
  openGraph: {
    title: "lek-ai — Khmer Digit Recognition",
    description: "Draw a Khmer handwritten digit and see it recognized with AI. Runs entirely in your browser.",
    url: "https://lek-ai.workers.dev",
    siteName: "lek-ai",
    type: "website",
    images: [
      {
        url: "https://lek-ai.workers.dev/icon.svg",
        width: 512,
        height: 512,
        alt: "lek-ai — Khmer Digit Recognition",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "lek-ai — Khmer Digit Recognition",
    description: "Draw a Khmer handwritten digit and see it recognized with AI. Runs entirely in your browser.",
    images: ["https://lek-ai.workers.dev/icon.svg"],
  },
}

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "700"],
  variable: "--font-khmer",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jetbrainsMono.variable} ${notoSansKhmer.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
