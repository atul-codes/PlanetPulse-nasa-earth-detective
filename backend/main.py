"""
Vercel entrypoint shim for FastAPI service.
Imports the FastAPI application instance from app.main.
"""
import os
import sys

# Ensure the backend directory is in sys.path regardless of execution root
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

