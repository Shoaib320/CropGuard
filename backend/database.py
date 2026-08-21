import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env from backend folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

# Get MongoDB URI
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not configured in backend/.env")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)

# Database
db = client["CropGuard"]

# Collection
scans_collection = db["scans"]


def test_database_connection():
    try:
        client.admin.command("ping")
        print("MongoDB Atlas connected successfully!")
        return True
    except Exception as e:
        print("MongoDB connection failed:", e)
        return False


if __name__ == "__main__":
    test_database_connection()