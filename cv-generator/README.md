# CV Generator

A production-ready web application that generates and exports a professional CV as PDF.

---

## ✨ Features

| Feature | Details |
|---|---|
| **CV Template** | Single A4 template matching your provided PDF design |
| **Live Preview** | Iframe preview before downloading |
| **PDF Export** | WeasyPrint → pdfkit → Chromium fallback chain |
| **Plug-in Templates** | Drop your own Jinja2 `.html` into `/templates` |

---

## 🏗️ Architecture

```
Browser (HTML/CSS/JS)
       │  fetch /preview-cv    ──→  Flask  ──→  Jinja2 render
       │  fetch /generate-cv   ──→  Flask  ──→  Jinja2 + WeasyPrint  ──→  PDF
```

**Key design decisions:**
- PDF generation has a 3-level fallback: WeasyPrint → pdfkit → Chromium
- Templates are plain Jinja2 HTML — designers can build new ones without touching Python
- `data_processor.py` normalises all input before it hits templates

---

## 📁 Project Structure

```
cv-generator/
├── app.py                        ← Flask routes
├── requirements.txt
├── .env.example                  ← Copy to .env
│
├── templates/
│   ├── index.html                ← Frontend SPA
│   └── cv_template_pdf_match.html ← Production CV template
│
├── static/
│   ├── css/style.css
│   └── js/script.js
│
├── utils/
│   ├── pdf_generator.py          ← WeasyPrint / pdfkit / Chromium
│   └── data_processor.py        ← Input normalisation & validation
│
└── output/                       ← Generated PDFs (gitignored)
```

---

## 🚀 Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd cv-generator
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env
```

### 4. Run

```bash
python app.py
# Open http://localhost:5000
```

---

## 🧱 Production

Use a WSGI server instead of `python app.py`.

Example (Windows-friendly):

```bash
pip install waitress
waitress-serve --listen=0.0.0.0:5000 wsgi:app
```

---

## 🎨 Adding Your Own CV Template

1. Create `templates/cv_template_myname.html`
2. Use these Jinja2 variables:

```jinja2
{{ name }}           {{ email }}         {{ phone }}
{{ linkedin }}       {{ github }}        {{ summary }}
{{ skills }}         {# list of strings #}
{{ experience }}     {# list: title, company, duration, bullets[] #}
{{ projects }}       {# list: name, tech, bullets[] #}
{{ education }}      {# list: institution, degree, location, dates #}
{{ additional }}     {# list: {label, value} #}
```

3. Register it in `app.py` → `template_map` dict
4. Add the option to `<select id="templateSelect">` in `index.html`

---

## 🛠️ PDF Generation

The app tries these in order:

1. **WeasyPrint** (recommended) — `pip install weasyprint`
   - Best CSS support, handles fonts, colours, print layouts
2. **pdfkit** — `pip install pdfkit` + install `wkhtmltopdf`
   - `sudo apt install wkhtmltopdf` / `brew install wkhtmltopdf`
3. **Chromium headless** — automatic fallback if installed

---

## 🔒 Production Checklist

- [ ] Set `FLASK_DEBUG=false`
- [ ] Set a strong `SECRET_KEY`
- [ ] Run behind gunicorn: `gunicorn -w 4 app:app`
- [ ] Add HTTPS (nginx / Caddy reverse proxy)
- [ ] Clean up `output/` periodically (add a cron job)
- [ ] Rate-limit `/generate-cv` endpoint

---

## 📄 License

MIT — free to use and modify.
