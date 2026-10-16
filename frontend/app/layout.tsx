import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono, Noto_Sans_Khmer } from "next/font/google"
import "./globals.css"

export const metadata: Metadata = {
  title: "lek-ai",
  description: "Draw a Khmer handwritten digit and recognize it with AI",
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
    <html lang="en" className={`${jetbrainsMono.variable} ${notoSansKhmer.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
