"""
PDF Generation Utility.
Tries WeasyPrint first (best CSS support), falls back to pdfkit.
"""

import os
import logging
import subprocess
import tempfile

logger = logging.getLogger(__name__)

_WEASY_AVAILABLE = False
_PDFKIT_AVAILABLE = False

try:
    from weasyprint import HTML as WeasyHTML
    _WEASY_AVAILABLE = True
except ImportError:
    pass

try:
    import pdfkit
    _PDFKIT_AVAILABLE = True
except ImportError:
    pass


def generate_pdf(html_content: str, output_path: str) -> str:
    """
    Convert HTML string to PDF file at output_path.
    Returns the output_path on success, raises on failure.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    if _WEASY_AVAILABLE:
        return _generate_with_weasyprint(html_content, output_path)
    elif _PDFKIT_AVAILABLE:
        return _generate_with_pdfkit(html_content, output_path)
    else:
        return _generate_with_chromium(html_content, output_path)


def _generate_with_weasyprint(html_content: str, output_path: str) -> str:
    from weasyprint import HTML as WeasyHTML
    WeasyHTML(string=html_content).write_pdf(output_path)
    logger.info(f"PDF generated via WeasyPrint → {output_path}")
    return output_path


def _generate_with_pdfkit(html_content: str, output_path: str) -> str:
    options = {
        "page-size": "A4",
        "margin-top": "0mm",
        "margin-right": "0mm",
        "margin-bottom": "0mm",
        "margin-left": "0mm",
        "encoding": "UTF-8",
        "enable-local-file-access": None,
    }
    pdfkit.from_string(html_content, output_path, options=options)
    logger.info(f"PDF generated via pdfkit → {output_path}")
    return output_path


def _generate_with_chromium(html_content: str, output_path: str) -> str:
    """Last resort: headless Chromium/Chrome."""
    # Windows default encoding can be a non-UTF8 "charmap" which breaks for
    # typographic characters. Always write HTML as UTF-8.
    with tempfile.NamedTemporaryFile(suffix=".html", mode="w", delete=False, encoding="utf-8") as tmp:
        tmp.write(html_content)
        tmp_path = tmp.name

    chromium_cmds = [
        "chromium-browser", "chromium", "google-chrome", "google-chrome-stable"
    ]
    for cmd in chromium_cmds:
        try:
            subprocess.run(
                [
                    cmd,
                    "--headless",
                    "--disable-gpu",
                    "--no-sandbox",
                    f"--print-to-pdf={output_path}",
                    tmp_path,
                ],
                check=True,
                capture_output=True,
            )
            os.unlink(tmp_path)
            logger.info(f"PDF generated via {cmd} → {output_path}")
            return output_path
        except (subprocess.CalledProcessError, FileNotFoundError):
            continue

    os.unlink(tmp_path)
    raise RuntimeError(
        "No PDF generator available. Install WeasyPrint (`pip install weasyprint`) "
        "or install wkhtmltopdf (for pdfkit), or ensure Chrome/Chromium is installed "
        "and available on PATH."
    )
