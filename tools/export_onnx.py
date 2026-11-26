"""Export best_gru_model.pth to ONNX and verify numerical parity.

Usage (from tools/):
    uv run python export_onnx.py

Writes the model straight to frontend/public/ (the browser loads it from
there) with dynamic batch and sequence dimensions and returns (batch, 10)
logits, matching DeepGRUModel.forward.

Note: dynamic int8 quantization is not useful here because the GRU weights
dominate the parameter count and ONNX Runtime leaves them in float32, so the
file stays ~16 MB while predictions drift.
"""

import argparse
import os
from pathlib import Path

import numpy as np
import onnx
import onnxruntime as ort
import torch

from model.load_gru import load_model

INPUT_SIZE = 16
NUM_CLASSES = 10
OPSET = 18


def export(model_path: Path, onnx_path: Path) -> None:
    model = load_model(str(model_path))
    dummy = torch.randn(1, 128, INPUT_SIZE, dtype=torch.float32)

    torch.onnx.export(
        model,
        dummy,
        str(onnx_path),
        input_names=["input"],
        output_names=["logits"],
        opset_version=OPSET,
        dynamo=False,
        dynamic_axes={
            "input": {0: "batch", 1: "sequence"},
            "logits": {0: "batch"},
        },
    )
    onnx.checker.check_model(onnx.load(str(onnx_path)))
    print(f"exported -> {onnx_path} ({onnx_path.stat().st_size / 1e6:.2f} MB)")


def parity(model_path: Path, onnx_path: Path) -> bool:
    model = load_model(str(model_path))
    session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name

    ok = True
    # Varying sequence lengths exercise the dynamic sequence axis.
    for length in (16, 64, 127, 256, 411):
        rng = np.random.default_rng(length)
        x = rng.random((1, length, INPUT_SIZE), dtype=np.float32)

        with torch.no_grad():
            torch_logits = model(torch.from_numpy(x)).numpy()
        ort_logits = session.run(None, {input_name: x})[0]

        max_diff = float(np.max(np.abs(torch_logits - ort_logits)))
        torch_pred = int(np.argmax(torch_logits, axis=1)[0])
        ort_pred = int(np.argmax(ort_logits, axis=1)[0])
        match = torch_pred == ort_pred
        ok &= match and max_diff < 1e-3
        print(
            f"len={length:4d}  max|diff|={max_diff:.2e}  "
            f"torch_argmax={torch_pred}  ort_argmax={ort_pred}  "
            f"{'OK' if match else 'MISMATCH'}"
        )
    return ok


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="best_gru_model.pth")
    parser.add_argument("--output", default="../frontend/public/best_gru_model.onnx")
    args = parser.parse_args()

    model_path = Path(args.model)
    onnx_path = Path(args.output)
    if not model_path.exists():
        raise SystemExit(f"model not found: {model_path} (run from tools/)")

    export(model_path, onnx_path)
    if not parity(model_path, onnx_path):
        raise SystemExit("parity check FAILED")

    print("\nall parity checks passed")


if __name__ == "__main__":
    os.environ.setdefault("OMP_NUM_THREADS", "1")
    main()
