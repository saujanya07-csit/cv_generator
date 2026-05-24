"""
CV Generator - Main Flask Application
"""

import os
import logging
from flask import Flask, render_template, request, jsonify, send_file
from dotenv import load_dotenv

from utils.pdf_generator import generate_pdf
from utils.data_processor import process_form_data, validate_cv_data

load_dotenv()

# ── App Setup ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key-change-in-prod")
app.config["OUTPUT_DIR"] = os.path.join(os.path.dirname(__file__), "output")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

os.makedirs(app.config["OUTPUT_DIR"], exist_ok=True)


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Serve the main frontend page."""
    return render_template("index.html")


@app.route("/generate-cv", methods=["POST"])
def generate_cv():
    """
    CV generation endpoint.
    Accepts final CV data, renders HTML template, converts to PDF.
    """
    try:
        cv_data = request.get_json()
        if not cv_data:
            return jsonify({"error": "No CV data provided"}), 400

        errors = validate_cv_data(cv_data)
        if errors:
            return jsonify({"error": "Validation failed", "details": errors}), 422

        template_id = cv_data.get("template", "default")
        template_map = {
            "default": "cv_template_pdf_match.html",
        }
        template_file = template_map.get(template_id, "cv_template_pdf_match.html")

        rendered_html = render_template(template_file, **cv_data)

        output_path = os.path.join(
            app.config["OUTPUT_DIR"],
            f"cv_{cv_data.get('name', 'output').replace(' ', '_')}.pdf"
        )
        generate_pdf(rendered_html, output_path)

        return send_file(
            output_path,
            as_attachment=True,
            download_name="my_cv.pdf",
            mimetype="application/pdf"
        )

    except Exception as e:
        logger.error(f"CV generation error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/preview-cv", methods=["POST"])
def preview_cv():
    """Return rendered HTML for in-browser preview."""
    try:
        cv_data = request.get_json()
        if not cv_data:
            return jsonify({"error": "No data provided"}), 400

        template_id = cv_data.get("template", "default")
        template_map = {
            "default": "cv_template_pdf_match.html",
        }
        template_file = template_map.get(template_id, "cv_template_pdf_match.html")
        rendered_html = render_template(template_file, **cv_data)
        return jsonify({"success": True, "html": rendered_html})

    except Exception as e:
        logger.error(f"Preview error: {e}")
        return jsonify({"error": str(e)}), 500


# ── Entry Point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "true").lower() == "true", port=5000)
