from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Allow calls from your frontend origin
CORS(app, resources={r"/*": {"origins": "*"}})

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

    return jsonify(message=f"Got {len(data)} bytes")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
