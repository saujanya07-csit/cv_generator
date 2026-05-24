"""
Data processing and validation utilities.
Normalises raw form input into a clean dict before passing to AI/templates.
"""

from typing import Any


def process_form_data(raw: dict) -> dict:
    """
    Clean and normalise raw form data from the frontend.
    Handles string → list conversion for multi-value fields.
    """
    return {
        "name":     _str(raw.get("name")),
        "address":  _str(raw.get("address", raw.get("location"))),
        "phone":    _str(raw.get("phone")),
        "email":    _str(raw.get("email")),
        "linkedin": _str(raw.get("linkedin")),
        "github":   _str(raw.get("github")),

        "summary":  _str(raw.get("summary")),

        "experience": _to_experience_list(raw.get("experience")),
        "projects":   _to_project_list(raw.get("projects")),
        "skills":     _to_list(raw.get("skills")),
        "education":  _to_education_list(raw.get("education")),

        "additional": _to_additional_list(raw),

        "template": _str(raw.get("template", "default")),
    }


def validate_cv_data(data: dict) -> list[str]:
    """
    Basic validation. Returns list of error strings (empty = valid).
    """
    errors = []
    if not data.get("name", "").strip():
        errors.append("Name is required.")
    if not data.get("email", "").strip():
        errors.append("Email is required.")
    return errors


# ── Private Helpers ────────────────────────────────────────────────────────────

def _str(val: Any) -> str:
    return str(val).strip() if val is not None else ""


def _to_list(val: Any) -> list:
    if val is None:
        return []
    if isinstance(val, list):
        return [str(v).strip() for v in val if str(v).strip()]
    if isinstance(val, str):
        return [s.strip() for s in val.split(",") if s.strip()]
    return []


def _to_project_list(val: Any) -> list:
    if not val:
        return []
    if isinstance(val, list):
        result = []
        for item in val:
            if isinstance(item, dict):
                bullets = item.get("bullets", item.get("description", ""))
                result.append({
                    "name":    _str(item.get("name", item.get("title"))),
                    "tech":    _str(item.get("tech")),
                    "bullets": _to_lines(bullets),
                })
            elif isinstance(item, str) and item.strip():
                result.append({"name": item.strip(), "tech": "", "bullets": []})
        return result
    if isinstance(val, str):
        return [{"name": val.strip(), "tech": "", "bullets": []}]
    return []


def _to_experience_list(val: Any) -> list:
    if not val:
        return []
    if isinstance(val, list):
        result = []
        for item in val:
            if isinstance(item, dict):
                bullets = item.get("bullets", item.get("description", ""))
                result.append({
                    "company":  _str(item.get("company")),
                    "title":    _str(item.get("title", item.get("role"))),
                    "duration": _str(item.get("duration")),
                    "bullets":  _to_lines(bullets),
                })
        return result
    return []


def _to_education_list(val: Any) -> list:
    if not val:
        return []
    if isinstance(val, list):
        result = []
        for item in val:
            if isinstance(item, dict):
                result.append({
                    "institution": _str(item.get("institution")),
                    "degree":      _str(item.get("degree")),
                    "location":    _str(item.get("location")),
                    "dates":       _str(item.get("dates", item.get("year"))),
                })
        return result
    return []


def _to_lines(val: Any) -> list[str]:
    """
    Accepts:
    - list[str] -> trimmed
    - string with newlines -> split into lines
    - string with commas -> kept as one line (for tech-like fields)
    """
    if val is None:
        return []
    if isinstance(val, list):
        return [str(v).strip() for v in val if str(v).strip()]
    if isinstance(val, str):
        if "\n" in val:
            return [s.strip() for s in val.split("\n") if s.strip()]
        return [val.strip()] if val.strip() else []
    return []


def _to_additional_list(raw: dict) -> list[dict]:
    """
    Builds the template's `additional: [{label, value}]` from either:
    - raw.additional (already in that shape), OR
    - languages/developer_tools/certifications fields from the form.
    """
    existing = raw.get("additional")
    if isinstance(existing, list):
        out = []
        for item in existing:
            if not isinstance(item, dict):
                continue
            label = _str(item.get("label"))
            value = _str(item.get("value"))
            if label or value:
                out.append({"label": label, "value": value})
        if out:
            return out

    out: list[dict] = []
    languages = _str(raw.get("languages"))
    developer_tools = _str(raw.get("developer_tools"))
    certifications = _to_list(raw.get("certifications"))

    if languages:
        out.append({"label": "Languages", "value": languages})
    if developer_tools:
        out.append({"label": "Developer Tools", "value": developer_tools})
    if certifications:
        out.append({"label": "Certifications", "value": ", ".join(certifications)})
    return out
