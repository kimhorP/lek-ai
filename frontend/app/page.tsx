"use client"

import { useState } from "react"
import { Github } from "lucide-react"
import { CanvasDrawing } from "@/components/canvas-drawing"
import { PredictionDisplay } from "@/components/prediction-display"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface PredictionResult {
  predicted_digit: string
}

export default function Home() {
  const [strokes, setStrokes] = useState<number[][]>([])
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePredict = async () => {
    if (strokes.length === 0) {
      setError("Please draw at least one stroke")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const coordinates = strokes.flat()
      const response = await fetch(`${API_URL}/predict/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setResult({
        predicted_digit: String.fromCharCode(0x17e0 + data.prediction),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get prediction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background p-4 sm:p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <div className="mb-6 flex items-start justify-between sm:mb-8">
          <div>
            <h1 className="mb-2 text-[32px] font-bold leading-[1.2] tracking-[0.01em] text-primary">
              lek-ai
            </h1>
            <p className="text-muted-foreground">
              Draw a Khmer handwritten digit to see predictions
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left side - Canvas */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-lg font-bold text-primary">Draw a Digit</h2>
            <CanvasDrawing strokes={strokes} onStrokesChange={setStrokes} />

            <Button
              onClick={handlePredict}
              disabled={loading || strokes.length === 0}
              className="mt-4 w-full font-semibold"
              size="lg"
            >
              {loading ? "Predicting..." : "Predict"}
            </Button>
          </div>

          {/* Right side - Results */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-lg font-bold text-primary">Prediction Results</h2>
            <PredictionDisplay result={result} loading={loading} error={error} />
          </div>
        </div>

        <footer className="mt-auto flex items-center justify-center pt-12 text-muted-foreground">
          <a
            href="https://github.com/kimhorP/lek-ai"
            target="_blank"
            rel="noopener noreferrer"
            title="lek-ai on GitHub"
            aria-label="lek-ai on GitHub"
            className="hover:text-primary"
          >
            <Github className="size-5" />
          </a>
        </footer>
      </div>
    </main>
  )
}
