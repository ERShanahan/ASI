from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

import torch
import torch.nn as nn

from model import HandPointClassifier

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

device = torch.device("cpu")

model = HandPointClassifier(29).to(device)
model.eval()

weights_path = "./asl_fingerspell_mlp.pth"
state = torch.load(weights_path, map_location=device)
model.load_state_dict(state)

CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'del', 'nothing', 'space']

@app.route("/upload", methods=["POST"])
def upload_frame():
    data = request.get_json()
    if not data:
        return jsonify(error="No file"), 400

    landmarks = data["landmarks"]
    landmarks = landmarks[0] if len(landmarks) > 0 else []
    if len(landmarks) < 21:
        landmarks = landmarks + [{"x": 0.0, "y": 0.0}] * (21 - len(landmarks))
    elif len(landmarks) > 21:
        landmarks = landmarks[:21]

    # build [1, 42] feature tensor
    feat = np.array([coord for pt in landmarks for coord in (pt["x"], pt["y"])], dtype=np.float32)
    tensor = torch.from_numpy(feat).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs  = nn.functional.softmax(logits, dim=1)[0]
        idx    = int(probs.argmax())
        prob_list = probs.cpu().tolist()
    
    return jsonify({
        "prediction": CLASSES[idx],
        "probabilities": prob_list
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
