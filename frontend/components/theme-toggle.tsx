"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Render a stable placeholder until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className="size-8" aria-label="Toggle theme" />
    )
  }

  const isLight = theme === "light"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="size-8"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  )
}
