import os
import sys
from pathlib import Path

# Add the backend directory to Python path so tests can import modules
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Set OS environment to test mode so EnvironmentManager uses test environment
os.environ["OS"] = "test"

# Set environment variables for testing if not already set
if not os.getenv("MONGODB_URI"):
    os.environ["MONGODB_URI"] = "mongodb://localhost:27017/test_db"

if not os.getenv("DATABASE_NAME"):
    os.environ["DATABASE_NAME"] = "test_db"

if not os.getenv("OTP_SECRET"):
    os.environ["OTP_SECRET"] = "base32base32base32"

if not os.getenv("SECRET_KEY"):
    os.environ["SECRET_KEY"] = "test_secret_key_for_testing_only"

if not os.getenv("EMAIL"):
    os.environ["EMAIL"] = "test@example.com"

if not os.getenv("EMAIL_PASSWORD"):
    os.environ["EMAIL_PASSWORD"] = "test_password"

if not os.getenv("ALGORITHM"):
    os.environ["ALGORITHM"] = "HS256"

if not os.getenv("CONNECTION_STRING"):
    os.environ["CONNECTION_STRING"] = "mongodb://localhost:27017/test_db"
