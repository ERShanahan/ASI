from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from io import BytesIO
from PIL import Image
import numpy as np
import cv2
import mediapipe as mp

import torch
import torch.nn as nn

from model import HandPointClassifier

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

device = torch.device("cpu")

model = HandPointClassifier(29).to(device)
model.eval()

weights_path = "./weights/asl_fingerspell_mlp.pth"
state = torch.load(weights_path, map_location=device)
model.load_state_dict(state)

CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'del', 'nothing', 'space']

# ——— MediaPipe Hands setup (Solutions API) ———
mp_hands   = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Create a single, reusable Hands object
hands_detector = mp_hands.Hands(
    static_image_mode=False,       # continuous video
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

@app.route("/upload", methods=["POST"])
def upload_frame():
    data = request.get_json()
    if not data:
        return jsonify(error="No file"), 400

    landmarks = data["landmarks"]
    landmarks = landmarks[0] if len(landmarks) > 0 else []
    print(landmarks)
    print(len(landmarks))
    if len(landmarks) < 21:
        landmarks = landmarks + [{"x": 0.0, "y": 0.0}] * (21 - len(landmarks))
    elif len(landmarks) > 21:
        landmarks = landmarks[:21]

    # build [1, 42] feature tensor
    feat = np.array([coord for pt in landmarks for coord in (pt["x"], pt["y"])], dtype=np.float32)
    print("▶️ feat.shape =", feat.shape)  # should be (42,)
    tensor = torch.from_numpy(feat).unsqueeze(0).to(device)
    print("▶️ tensor.shape =", tuple(tensor.shape))  # should be (1, 42)

    with torch.no_grad():
        logits = model(tensor)
        print(logits)
        probs  = nn.functional.softmax(logits, dim=1)[0]
        idx    = int(probs.argmax())
        prob_list = probs.cpu().tolist()
    
    print(idx)
    print(prob_list)

    return jsonify({
        "prediction": CLASSES[idx],
        "probabilities": prob_list
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
