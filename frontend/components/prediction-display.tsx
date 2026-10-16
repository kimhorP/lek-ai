"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PredictionResult {
  predicted_digit: string
}

interface PredictionDisplayProps {
  result: PredictionResult | null
  loading: boolean
  error: string | null
}

export function PredictionDisplay({ result, loading, error }: PredictionDisplayProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Predicting...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-center text-destructive text-sm">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Draw a Khmer digit and click Predict to see results</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary bg-primary/5">
      <CardHeader>
        <CardTitle className="text-center text-6xl">{result.predicted_digit}</CardTitle>
      </CardHeader>
    </Card>
  )
}
