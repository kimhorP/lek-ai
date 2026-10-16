"use client"

import { useState } from "react"
import { Github } from "lucide-react"
import { CanvasDrawing } from "@/components/canvas-drawing"
import { PredictionDisplay } from "@/components/prediction-display"
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
    <main className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-[32px] font-bold leading-[1.2] tracking-[0.01em] text-primary">
            &gt; lek-ai
          </h1>
          <p className="text-muted-foreground">
            // Draw a Khmer handwritten digit to see predictions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left side - Canvas */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-lg font-bold text-primary">--- draw ---</h2>
            <CanvasDrawing strokes={strokes} onStrokesChange={setStrokes} />

            <Button
              onClick={handlePredict}
              disabled={loading || strokes.length === 0}
              className="mt-4 w-full font-semibold"
              size="lg"
            >
              {loading ? "> predicting..." : "> Predict"}
            </Button>
          </div>

          {/* Right side - Results */}
          <div className="flex flex-col">
            <h2 className="mb-4 text-lg font-bold text-primary">--- result ---</h2>
            <PredictionDisplay result={result} loading={loading} error={error} />
          </div>
        </div>

        <footer className="mt-12 flex items-center justify-center text-muted-foreground">
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
