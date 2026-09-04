"""
BhumiSetu — One-command runner for hackathon demo.

Usage:
    python run.py

This will:
1. Install dependencies (if needed)
2. Create SQLite database
3. Seed demo data
4. Start the FastAPI server

No Docker, PostgreSQL, or Redis required!
"""

import subprocess
import sys
import os


def main():
    print("=" * 60)
    print("  BhumiSetu — Land Record Digitization Platform")
    print("  Starting in DEMO mode...")
    print("=" * 60)

    project_root = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_root)

    print("\nStep 1: Checking dependencies...")
    try:
        import fastapi  # noqa: F401
        import sqlalchemy  # noqa: F401
        print("  [OK] Dependencies already installed")
    except ImportError:
        print("  Installing dependencies...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r",
            os.path.join("backend", "requirements.txt"), "-q"
        ])
        print("  [OK] Dependencies installed")

    print("\nStep 2: Seeding demo database...")
    subprocess.check_call([
        sys.executable, "-m", "backend.services.demo_data"
    ])

    print("\nStep 3: Starting BhumiSetu API server...")
    print("  API Docs:  http://localhost:8000/docs")
    print("  Health:    http://localhost:8000/health")
    print("  Records:   http://localhost:8000/api/v1/records/")
    print("")
    print("  Press Ctrl+C to stop the server")
    print("=" * 60)

    subprocess.check_call([
        sys.executable, "-m", "uvicorn",
        "backend.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload",
    ])


if __name__ == "__main__":
    main()
