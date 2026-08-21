from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# --------------------------------------------------
# Load environment variables from backend/.env
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)


# --------------------------------------------------
# Create Flask application
# --------------------------------------------------

app = Flask(__name__)


# --------------------------------------------------
# Enable CORS for frontend
# --------------------------------------------------

CORS(app)


# --------------------------------------------------
# Register route blueprints
# --------------------------------------------------

from routes.predict import predict_bp
from routes.gradcam import gradcam_bp
from routes.disease_info import disease_info_bp
from routes.weather import weather_bp
from routes.history import history_bp

app.register_blueprint(predict_bp)
app.register_blueprint(gradcam_bp)
app.register_blueprint(disease_info_bp)
app.register_blueprint(weather_bp)
app.register_blueprint(history_bp)


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.route("/")
def health_check():
    return {
        "status": "ok",
        "message": "CropGuard backend running"
    }


# --------------------------------------------------
# Start Flask server
# --------------------------------------------------

if __name__ == "__main__":
    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )