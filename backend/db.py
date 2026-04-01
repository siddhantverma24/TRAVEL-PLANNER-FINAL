import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

MONGO_URI = "mongodb+srv://siddhant:Ver1970@cluster0.kd1gh2r.mongodb.net/travel_planner?retryWrites=true&w=majority"
MONGO_DB_NAME = "travel_planner"

_client = None
_db = None

def connect_db():
    """Initialize MongoDB connection."""
    global _client, _db
    
    if _client is None:
        try:
            _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
            # Test connection
            _client.admin.command('ping')
            _db = _client[MONGO_DB_NAME]
            print(f"✅ Connected to MongoDB: {MONGO_DB_NAME}")
            return _db
        except (ServerSelectionTimeoutError, ConnectionFailure) as e:
            print(f"❌ MongoDB connection failed: {e}")
            print(f"   MONGO_URI: {MONGO_URI}")
            print(f"   DB_NAME: {MONGO_DB_NAME}")
            raise


def get_db():
    """
    Get the MongoDB database object.
    
    Returns:
        pymongo.database.Database: The travel_planner database object
        
    Example:
        db = get_db()
        users = db['users']
        user = users.find_one({'_id': 'user123'})
    """
    global _db
    if _db is None:
        connect_db()
    return _db


def get_collection(name):
    """
    Get a MongoDB collection by name.
    
    Args:
        name (str): Collection name (e.g. 'itineraries', 'users', 'bookings')
        
    Returns:
        pymongo.collection.Collection: The requested collection
        
    Example:
        itineraries = get_collection('itineraries')
        itinerary = itineraries.find_one({'_id': ObjectId(itinerary_id)})
    """
    db = get_db()
    return db[name]


def close_db():
    """Close the MongoDB connection."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
        print("✅ MongoDB connection closed")


# ═══════════════════════════════════════════════════════════════════════════
# EXAMPLE USAGE (uncomment to test)
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    # Test connection
    try:
        db = get_db()
        print(f"Database name: {db.name}")
        print(f"Collections: {db.list_collection_names()}")
        
        # Example: Insert a test document
        test_col = get_collection('test')
        result = test_col.insert_one({'message': 'Hello MongoDB!', 'timestamp': 'now'})
        print(f"Inserted document ID: {result.inserted_id}")
        
        # Example: Find the document
        doc = test_col.find_one({'_id': result.inserted_id})
        print(f"Retrieved document: {doc}")
        
        close_db()
    except Exception as e:
        print(f"Error: {e}")
