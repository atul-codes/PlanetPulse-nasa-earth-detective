import os
from dotenv import load_dotenv

load_dotenv()

NASA_API_KEY = os.getenv("NASA_API_KEY")

PYTHON_BACKEND_URL = os.getenv(
    "PYTHON_BACKEND_URL",
    "http://127.0.0.1:8000"
)

if not NASA_API_KEY:
    raise ValueError("NASA_API_KEY is missing from .env")