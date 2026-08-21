from flask import Blueprint, jsonify, request
import json
import os

disease_info_bp = Blueprint("disease_info", __name__)

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "disease_info.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    disease_data = json.load(f)


@disease_info_bp.route("/disease-info/<class_name>", methods=["GET"])
def get_disease_info(class_name):
    lang = request.args.get("lang", "en")  # default English

    if class_name not in disease_data:
        return jsonify({
            "error": f"No info available for class '{class_name}'",
            "available_classes": list(disease_data.keys())
        }), 404

    entry = disease_data[class_name]

    if lang not in entry:
        return jsonify({
            "error": f"Language '{lang}' not available for this class",
            "available_languages": list(entry.keys())
        }), 404

    return jsonify({
        "class_name": class_name,
        "language": lang,
        **entry[lang]
    })


@disease_info_bp.route("/disease-info", methods=["GET"])
def list_all_diseases():
    return jsonify({
        "classes": list(disease_data.keys()),
        "count": len(disease_data)
    })