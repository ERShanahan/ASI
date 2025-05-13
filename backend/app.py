from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
from PIL import Image
from tokenizer import tokenizer
from model import CNNClassifier
import torch
from torchvision import transforms

app = Flask(__name__)
# Allow calls from your frontend origin
CORS(app, resources={r"/*": {"origins": "*"}})

device = torch.device("cpu")

tokenizer = tokenizer(frame_rate=10, frame_size=(224,224), device='cpu')

model = CNNClassifier(num_classes=28, img_size=(224,224))
model.eval()

weights_path = "./weights/cnn_asl_model.pth"
state = torch.load(weights_path, map_location=device)
model.load_state_dict(state)

CLASSES = [
    'A','B','C','D','E','F','G','H','I','J',
    'K','L','M','N','Nothing','O','P','Q','R','S',
    'Space','T','U','V','W','X','Y','Z'
]

@app.route("/upload", methods=["POST"])
def upload_frame():
    f = request.files.get('frame')
    if not f:
        return jsonify(error="No file"), 400

    # data = f.read()
    # # metadata
    # print(f"Received file: {f.filename}")
    # print(f"Content-Type: {f.content_type}")
    # print(f"Total bytes: {len(data)}")

    # try:
    #     tokens: torch.Tensor = tokenizer.tokenize(data)
    # except ValueError as e:
    #     return jsonify(error=str(e)), 500
    
    # shape = tokens.shape
    # tokens = tokens.cpu().numpy().tolist()
    
    # return jsonify({
    #     "shape": list(shape)
    # })

    try:
        img = Image.open(BytesIO(f.read())).convert('RGB')

        x = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std =[0.229, 0.224, 0.225]
            ),
        ])(img).unsqueeze(0)

        with torch.no_grad():
            logits = model(x)
            idx = logits.argmax(dim=1).item()

        text = CLASSES[idx]
        print(text)
        return jsonify(message=text)
    
    except Exception as e:
        return jsonify(error=str(e)), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
