from flask import Blueprint, request, jsonify
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
import io
import sys
import os
import base64
import cv2
import numpy as np

# --------------------------------------------------
# Import segmentation utility
# --------------------------------------------------

sys.path.append(
    os.path.join(os.path.dirname(__file__), "..", "utils")
)

from segmentation import segment_leaf


# --------------------------------------------------
# Import MongoDB connection
# --------------------------------------------------

sys.path.append(
    os.path.join(os.path.dirname(__file__), "..")
)

from database import scans_collection
from bson import ObjectId


# --------------------------------------------------
# Flask Blueprint
# --------------------------------------------------

gradcam_bp = Blueprint("gradcam", __name__)


# --------------------------------------------------
# Device
# --------------------------------------------------

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# --------------------------------------------------
# Model
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
# Image transformation
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
# Grad-CAM hooks
# --------------------------------------------------

target_layer = model.features[18][0]

activations = None
gradients = None


def forward_hook(module, input, output):
    global activations
    activations = output.detach()


def backward_hook(module, grad_input, grad_output):
    global gradients
    gradients = grad_output[0].detach()


target_layer.register_forward_hook(
    forward_hook
)

target_layer.register_full_backward_hook(
    backward_hook
)


# --------------------------------------------------
# Generate Grad-CAM
# --------------------------------------------------

def generate_gradcam(input_tensor, class_idx):

    global activations, gradients

    model.zero_grad()

    output = model(input_tensor)

    score = output[0, class_idx]

    score.backward()

    # Global average pooling of gradients
    weights = gradients.mean(
        dim=(2, 3),
        keepdim=True
    )

    # Weighted combination of activation maps
    cam = (
        weights * activations
    ).sum(
        dim=1,
        keepdim=True
    )

    cam = F.relu(cam)

    cam = F.interpolate(
        cam,
        size=(224, 224),
        mode="bilinear",
        align_corners=False
    )

    cam = cam.squeeze().cpu().numpy()

    # Normalize to 0-1
    cam = cam - cam.min()

    cam = cam / (
        cam.max() + 1e-8
    )

    return cam


# --------------------------------------------------
# Grad-CAM API
# --------------------------------------------------

@gradcam_bp.route("/gradcam", methods=["POST"])
def gradcam():

    # ----------------------------------------------
    # Check image
    # ----------------------------------------------

    if "image" not in request.files:
        return jsonify({
            "error": "No image file provided"
        }), 400

    file = request.files["image"]

    image_bytes = file.read()

    # ----------------------------------------------
    # Convert image to OpenCV
    # ----------------------------------------------

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

    # ----------------------------------------------
    # Segment leaf
    # ----------------------------------------------

    segmented_bgr = segment_leaf(
        img_bgr
    )

    segmented_rgb = cv2.cvtColor(
        segmented_bgr,
        cv2.COLOR_BGR2RGB
    )

    pil_image = Image.fromarray(
        segmented_rgb
    )

    # ----------------------------------------------
    # Prepare model input
    # ----------------------------------------------

    input_tensor = (
        inference_transform(pil_image)
        .unsqueeze(0)
        .to(device)
    )

    input_tensor.requires_grad = False

    # ----------------------------------------------
    # Get predicted class
    # ----------------------------------------------

    with torch.no_grad():

        outputs = model(
            input_tensor
        )

        predicted_idx = (
            outputs.argmax(dim=1).item()
        )

    predicted_class = class_names[
        predicted_idx
    ]

    # ----------------------------------------------
    # Generate Grad-CAM
    # ----------------------------------------------

    cam = generate_gradcam(
        input_tensor,
        predicted_idx
    )

    # ----------------------------------------------
    # Prepare overlay
    # ----------------------------------------------

    base_img = cv2.resize(
        segmented_rgb,
        (224, 224)
    )

    heatmap = (
        cam * 255
    ).astype(np.uint8)

    heatmap_color = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    heatmap_color = cv2.cvtColor(
        heatmap_color,
        cv2.COLOR_BGR2RGB
    )

    # ----------------------------------------------
    # Debug images
    # ----------------------------------------------

    cv2.imwrite(
        "debug_raw_heatmap.png",
        cv2.cvtColor(
            heatmap_color,
            cv2.COLOR_RGB2BGR
        )
    )

    cv2.imwrite(
        "debug_base_img.png",
        cv2.cvtColor(
            base_img,
            cv2.COLOR_RGB2BGR
        )
    )

    # ----------------------------------------------
    # Create overlay
    # ----------------------------------------------

    overlay = cv2.addWeighted(
        base_img,
        0.5,
        heatmap_color,
        0.5,
        0
    )

    # ----------------------------------------------
    # Convert overlay to Base64
    # ----------------------------------------------

    overlay_bgr = cv2.cvtColor(
        overlay,
        cv2.COLOR_RGB2BGR
    )

    _, buffer = cv2.imencode(
        ".png",
        overlay_bgr
    )

    overlay_base64 = base64.b64encode(
        buffer
    ).decode("utf-8")

    # ----------------------------------------------
    # SAVE HEATMAP TO MONGODB
    # ----------------------------------------------

    scan_id = request.form.get("scan_id")

    if scan_id:

        try:

            scans_collection.update_one(
                {
                    "_id": ObjectId(scan_id)
                },
                {
                    "$set": {
                        "heatmap_base64": (
                            f"data:image/png;base64,"
                            f"{overlay_base64}"
                        )
                    }
                }
            )

            print(
                f"Heatmap saved for scan: {scan_id}"
            )

        except Exception as e:

            print(
                "Failed to save heatmap:",
                e
            )

    # ----------------------------------------------
    # Return response
    # ----------------------------------------------

    return jsonify({
        "predicted_class": predicted_class,
        "heatmap_base64": (
            f"data:image/png;base64,"
            f"{overlay_base64}"
        )
    })