from pathlib import Path
import json
import os

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "model" / "BrainInsight_Final_v2.keras"
METADATA_PATH = ROOT / "model" / "BrainInsight_v2_metadata.json"
DEFAULT_CLASSES = ["Alzheimer", "Multiple Sclerosis", "Normal", "Stroke", "Tumor"]
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "bmp", "webp"}
MAX_BYTES = 20 * 1024 * 1024

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config["MAX_CONTENT_LENGTH"] = MAX_BYTES

_model = None
_metadata = None
_model_error = None


def load_metadata():
    global _metadata
    if _metadata is not None:
        return _metadata
    if METADATA_PATH.exists():
        try:
            _metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
        except Exception:
            _metadata = None
    if _metadata is None:
        _metadata = {"class_names": DEFAULT_CLASSES, "image_size": [224, 224]}
    return _metadata


def get_model():
    global _model, _model_error
    if _model is not None:
        return _model
    if _model_error:
        return None
    if not MODEL_PATH.exists():
        return None
    try:
        import tensorflow as tf
        _model = tf.keras.models.load_model(MODEL_PATH, compile=False)
        return _model
    except Exception as exc:
        _model_error = str(exc)
        return None


def allowed(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@app.get("/api/health")
def health():
    model = get_model()
    if model is not None:
        return jsonify({"status": "ready", "model": "BrainInsight_Final_v2.keras"})
    if _model_error:
        return jsonify({"status": "error", "model": None, "error": _model_error}), 500
    return jsonify({"status": "missing", "model": None})


@app.post("/api/predict")
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No image file was provided."}), 400

    uploaded = request.files["file"]
    if not uploaded.filename:
        return jsonify({"error": "The selected file has no filename."}), 400
    if not allowed(uploaded.filename):
        return jsonify({"error": "Supported formats: JPG, JPEG, PNG, BMP, WEBP."}), 400

    model = get_model()
    if model is None:
        if _model_error:
            return jsonify({"error": "The model could not be loaded.", "details": _model_error}), 500
        return jsonify({
            "error": "BrainInsight_Final_v2.keras is not attached.",
            "details": "Place the model in backend/model/ and restart the backend."
        }), 503

    metadata = load_metadata()
    class_names = metadata.get("class_names", DEFAULT_CLASSES)
    image_size = metadata.get("image_size", [224, 224])

    try:
        image = Image.open(uploaded.stream).convert("RGB")
        image = image.resize((int(image_size[0]), int(image_size[1])))
        array = np.asarray(image, dtype=np.float32)
        array = np.expand_dims(array, axis=0)

        probabilities = model.predict(array, verbose=0)[0]
        predicted_index = int(np.argmax(probabilities))
        prediction = class_names[predicted_index]

        return jsonify({
            "prediction": prediction,
            "confidence": float(probabilities[predicted_index]),
            "probabilities": {
                name: float(probabilities[i])
                for i, name in enumerate(class_names)
            },
            "model": "BrainInsight_Final_v2.keras",
            "input_size": image_size,
        })
    except Exception as exc:
        return jsonify({"error": "Inference failed.", "details": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
