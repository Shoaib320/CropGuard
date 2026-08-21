from flask import Blueprint, jsonify
from bson import ObjectId

from database import scans_collection


history_bp = Blueprint("history", __name__)


# ---------------------------------------------------------
# GET ALL SCANS
# ---------------------------------------------------------

@history_bp.route("/history", methods=["GET"])
def get_history():

    try:
        scans = scans_collection.find().sort("timestamp", -1)

        history = []

        for scan in scans:

            history.append({
                "scan_id": str(scan["_id"]),
                "predicted_class": scan.get("predicted_class"),
                "confidence": scan.get("confidence"),
                "top3": scan.get("top3", []),
                "timestamp": scan.get("timestamp"),
                "location": scan.get("location"),
                "image_thumbnail": scan.get("image_thumbnail"),

                # Grad-CAM heatmap
                "heatmap_base64": scan.get("heatmap_base64")
            })

        return jsonify(history), 200

    except Exception as e:

        return jsonify({
            "error": "Failed to fetch scan history",
            "details": str(e)
        }), 500


# ---------------------------------------------------------
# GET ONE SCAN BY ID
# ---------------------------------------------------------

@history_bp.route("/history/<scan_id>", methods=["GET"])
def get_single_scan(scan_id):

    try:

        # Convert string ID into MongoDB ObjectId
        try:

            object_id = ObjectId(scan_id)

        except Exception:

            return jsonify({
                "error": "Invalid scan ID"
            }), 400

        # Find scan
        scan = scans_collection.find_one({
            "_id": object_id
        })

        if scan is None:

            return jsonify({
                "error": "Scan not found"
            }), 404

        # Build response
        result = {

            "scan_id": str(scan["_id"]),

            "predicted_class": scan.get(
                "predicted_class"
            ),

            "confidence": scan.get(
                "confidence"
            ),

            "top3": scan.get(
                "top3",
                []
            ),

            "timestamp": scan.get(
                "timestamp"
            ),

            "location": scan.get(
                "location"
            ),

            "image_thumbnail": scan.get(
                "image_thumbnail"
            ),

            # Grad-CAM heatmap
            "heatmap_base64": scan.get(
                "heatmap_base64"
            )
        }

        return jsonify(result), 200

    except Exception as e:

        return jsonify({
            "error": "Failed to fetch scan",
            "details": str(e)
        }), 500