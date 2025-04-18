import pymongo
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Connect to MongoDB Atlas
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://vinitshah6315@gmail.com:Syncmaster6515@<cluster>.mongodb.net/notes_sharing_app?retryWrites=true&w=majority")
client = pymongo.MongoClient(MONGODB_URI)
db = client["notes_sharing_app"]
notes_collection = db["notes"]

# Test connection
try:
    client.admin.command('ping')
    print("Successfully connected to MongoDB Atlas!")
except Exception as e:
    print(f"Failed to connect to MongoDB Atlas: {e}")
    exit(1)

# Create indexes for better search performance
notes_collection.create_index([("title", pymongo.TEXT), 
                              ("subject", pymongo.TEXT), 
                              ("number", pymongo.TEXT)])

# Create index for subject filtering
notes_collection.create_index("subject")

# Create index for sorting by upload date
notes_collection.create_index("uploadDate")

=

# Insert the sample data
if notes_collection.count_documents({}) == 0:
    notes_collection.insert_many(sample_notes)
    print("Sample data inserted successfully")
else:
    print("Collection already contains data, skipping sample data insertion")

print("MongoDB Atlas setup completed successfully")
