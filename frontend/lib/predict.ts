import type { InferenceSession } from "onnxruntime-web/wasm"

const MODEL_URL = "/best_gru_model.onnx"
const WASM_PATH = "/ort/"
const ROW_WIDTH = 16
const NUM_CLASSES = 10

type OrtModule = typeof import("onnxruntime-web/wasm")

let ortPromise: Promise<OrtModule> | null = null
let sessionPromise: Promise<InferenceSession> | null = null

function getOrt(): Promise<OrtModule> {
  if (!ortPromise) {
    ortPromise = import("onnxruntime-web/wasm").then((ort) => {
      ort.env.wasm.wasmPaths = WASM_PATH
      ort.env.wasm.numThreads = 1
      return ort
    })
  }
  return ortPromise
}

function getSession(ort: OrtModule): Promise<InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    }).catch((err) => {
      sessionPromise = null
      throw err
    })
  }
  return sessionPromise
}

export async function preloadModel(): Promise<void> {
  const ort = await getOrt()
  await getSession(ort)
}

function buildInput(strokes: number[][]): { data: Float32Array; rows: number } {
  const points = strokes.flat()
  if (points.length < 2) {
    throw new Error("Please draw at least one stroke")
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i + 1 < points.length; i += 2) {
    const x = points[i]
    const y = points[i + 1]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const pointCount = Math.floor(points.length / 2)
  const rows = Math.max(1, Math.ceil((pointCount * 2) / ROW_WIDTH))
  const data = new Float32Array(rows * ROW_WIDTH)

  for (let i = 0; i < pointCount; i++) {
    const x = (points[i * 2] - minX) / rangeX
    const y = (points[i * 2 + 1] - minY) / rangeY
    const flatIndex = i * 2
    if (flatIndex < data.length) data[flatIndex] = x
    if (flatIndex + 1 < data.length) data[flatIndex + 1] = y
  }

  return { data, rows }
}

export async function predictDigit(strokes: number[][]): Promise<number> {
  const ort = await getOrt()
  const session = await getSession(ort)
  const { data, rows } = buildInput(strokes)
  const input = new ort.Tensor("float32", data, [1, rows, ROW_WIDTH])
  const output = await session.run({ input })
  const logits = output.logits.data as Float32Array

  let best = 0
  for (let i = 1; i < Math.min(NUM_CLASSES, logits.length); i++) {
    if (logits[i] > logits[best]) best = i
  }
  return best
}
