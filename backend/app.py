from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Allow calls from your frontend origin
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/upload", methods=["POST"])
def upload_video():
    if 'video' not in request.files:
        return jsonify(error="No video part"), 400

    video = request.files['video']
    data = video.read()  # raw bytes of the .webm blob

    # TODO: run your ML/computation on `data` bytes
    # e.g. save to disk or directly feed into your processing function
    # with open("/tmp/upload.webm", "wb") as f:
    #     f.write(data)
    #
    # result = your_processing_function(data)

    # For demonstration, we just return the size:
    result = {"message": f"Received {len(data)} bytes of video."}
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
