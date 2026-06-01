import motor.motor_asyncio
import os
from dotenv import load_dotenv
import ssl


load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")

# Create SSL context that's compatible with Python 3.14
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

client = motor.motor_asyncio.AsyncIOMotorClient(
    MONGO_URL,
    tls=True,
    tlsAllowInvalidCertificates=True
)

db = client[DB_NAME]
tasks_collection = db["tasks"]

