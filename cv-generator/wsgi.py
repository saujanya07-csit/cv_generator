import os

from app import app

# Production default: don't run debug unless explicitly enabled.
app.debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"

