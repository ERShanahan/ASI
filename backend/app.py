from flask import Flask, request, jsonify
from flask_cors import CORS
from tokenizer import tokenizer
import torch

app = Flask(__name__)
# Allow calls from your frontend origin
CORS(app, resources={r"/*": {"origins": "*"}})

tokenizer = tokenizer(frame_rate=10, frame_size=(224,224), device='cpu')

@app.route("/upload", methods=["POST"])
def upload_video():
    f = request.files.get('video')
    if not f:
        return jsonify(error="No file"), 400

    data = f.read()
    # metadata
    print(f"Received file: {f.filename}")
    print(f"Content-Type: {f.content_type}")
    print(f"Total bytes: {len(data)}")

    try:
        tokens: torch.Tensor = tokenizer.tokenize(data)
    except ValueError as e:
        return jsonify(error=str(e)), 500
    
    shape = tokens.shape
    tokens = tokens.cpu().numpy().tolist()
    
    return jsonify({
        "shape": list(shape)
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
