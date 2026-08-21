from flask import Blueprint, request, jsonify

import torch
import torch.nn as nn
from torchvision import models, transforms

from PIL import Image
import io
import sys
import os
import cv2
import numpy as np

from datetime import datetime, timezone
import base64

# --------------------------------------------------
# Import segmentation function
# --------------------------------------------------

sys.path.append(
    os.path.join(os.path.dirname(__file__), "..", "utils")
)

from segmentation import segment_leaf

# --------------------------------------------------
# Import MongoDB collection
# --------------------------------------------------

sys.path.append(
    os.path.join(os.path.dirname(__file__), "..")
)

from database import scans_collection


# --------------------------------------------------
# Blueprint
# --------------------------------------------------

predict_bp = Blueprint("predict", __name__)


# --------------------------------------------------
# Device
# --------------------------------------------------

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"Prediction device: {device}")


# --------------------------------------------------
# Load trained model
# --------------------------------------------------

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "models",
    "cropguard_seg_aug.pt"
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=False
)

class_names = checkpoint["class_names"]
num_classes = len(class_names)


model = models.mobilenet_v2(weights=None)

model.classifier[1] = nn.Linear(
    model.last_channel,
    num_classes
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(device)
model.eval()


# --------------------------------------------------
# Image preprocessing
# --------------------------------------------------

inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])


# --------------------------------------------------
# Create small thumbnail for MongoDB
# --------------------------------------------------

def create_thumbnail(image):
    """
    Create a small JPEG thumbnail and return it
    as a base64 string.

    We store a thumbnail instead of the original
    high-resolution image to save MongoDB storage.
    """

    image = image.copy()

    # Keep thumbnail small
    image.thumbnail((256, 256))

    buffer = io.BytesIO()

    image.save(
        buffer,
        format="JPEG",
        quality=70,
        optimize=True
    )

    encoded_image = base64.b64encode(
        buffer.getvalue()
    ).decode("utf-8")

    return encoded_image


# --------------------------------------------------
# Prediction endpoint
# --------------------------------------------------

@predict_bp.route("/predict", methods=["POST"])
def predict():

    # --------------------------------------------------
    # Check image
    # --------------------------------------------------

    if "image" not in request.files:
        return jsonify({
            "error": "No image file provided"
        }), 400

    file = request.files["image"]

    image_bytes = file.read()

    # --------------------------------------------------
    # Decode image
    # --------------------------------------------------

    nparr = np.frombuffer(
        image_bytes,
        np.uint8
    )

    img_bgr = cv2.imdecode(
        nparr,
        cv2.IMREAD_COLOR
    )

    if img_bgr is None:
        return jsonify({
            "error": "Invalid image file"
        }), 400

    # --------------------------------------------------
    # Segment leaf
    # --------------------------------------------------

    segmented_bgr = segment_leaf(img_bgr)

    # --------------------------------------------------
    # Convert BGR → RGB → PIL
    # --------------------------------------------------

    segmented_rgb = cv2.cvtColor(
        segmented_bgr,
        cv2.COLOR_BGR2RGB
    )

    pil_image = Image.fromarray(
        segmented_rgb
    )

    # --------------------------------------------------
    # Prepare model input
    # --------------------------------------------------

    input_tensor = (
        inference_transform(pil_image)
        .unsqueeze(0)
        .to(device)
    )

    # --------------------------------------------------
    # Model prediction
    # --------------------------------------------------

    with torch.no_grad():

        outputs = model(input_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )[0]

        confidence, predicted_idx = torch.max(
            probabilities,
            dim=0
        )

    predicted_class = class_names[
        predicted_idx.item()
    ]

    # --------------------------------------------------
    # Top 3 predictions
    # --------------------------------------------------

    top3_prob, top3_idx = torch.topk(
        probabilities,
        3
    )

    top3 = [
        {
            "class": class_names[idx.item()],
            "confidence": round(
                prob.item() * 100,
                2
            )
        }
        for prob, idx in zip(
            top3_prob,
            top3_idx
        )
    ]

    confidence_percent = round(
        confidence.item() * 100,
        2
    )

    # --------------------------------------------------
    # Optional location
    # --------------------------------------------------

    location = request.form.get(
        "location"
    )

    # --------------------------------------------------
    # Create thumbnail
    # --------------------------------------------------

    thumbnail = create_thumbnail(
        pil_image
    )

    # --------------------------------------------------
    # Create MongoDB document
    # --------------------------------------------------

    scan_document = {
        "predicted_class": predicted_class,

        "confidence": confidence_percent,

        "top3": top3,

        "timestamp": datetime.now(
            timezone.utc
        ),

        "location": location,

        "image_thumbnail": thumbnail
    }

    # --------------------------------------------------
    # Save prediction to MongoDB
    # --------------------------------------------------

    try:

        result = scans_collection.insert_one(
            scan_document
        )

        scan_id = str(
            result.inserted_id
        )

    except Exception as e:

        print(
            "MongoDB save error:",
            e
        )

        return jsonify({
            "error": "Prediction successful, but failed to save scan history",
            "predicted_class": predicted_class,
            "confidence": confidence_percent,
            "top3": top3
        }), 500

    # --------------------------------------------------
    # Return result
    # --------------------------------------------------

    return jsonify({

        "scan_id": scan_id,

        "predicted_class": predicted_class,

        "confidence": confidence_percent,

        "top3": top3

    }), 200