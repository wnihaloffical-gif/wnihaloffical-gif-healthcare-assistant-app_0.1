import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from logger import logger
from typing import Optional, Dict, Any

class MongoDBClient:
    def __init__(self):
        self.mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        self.db_name = os.getenv("MONGODB_DB_NAME", "aarogyaguard")
        self.client: Optional[MongoClient] = None
        self.db = None
    
    def connect(self):
        try:
            self.client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
            self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            logger.info("Connected to MongoDB successfully", 
                       {"db_name": self.db_name}, "DATABASE")
            return True
        except ConnectionFailure as e:
            logger.error("Failed to connect to MongoDB", 
                        {"mongo_uri": self.mongo_uri.split("@")[0] + "@***"}, 
                        "DATABASE", str(e))
            return False
    
    def disconnect(self):
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB", module="DATABASE")
    
    def insert_inference_log(self, log_data: Dict[str, Any]) -> bool:
        try:
            if not self.db:
                return False
            collection = self.db["ml_inference_logs"]
            result = collection.insert_one(log_data)
            logger.debug("Inference log stored", 
                        {"log_id": str(result.inserted_id)}, "DATABASE")
            return True
        except Exception as e:
            logger.error("Failed to store inference log", module="DATABASE", error=str(e))
            return False
    
    def get_consultation(self, consultation_id: str) -> Optional[Dict[str, Any]]:
        try:
            if not self.db:
                return None
            collection = self.db["consultations"]
            return collection.find_one({"_id": consultation_id})
        except Exception as e:
            logger.error("Failed to get consultation", 
                        {"consultation_id": consultation_id}, "DATABASE", str(e))
            return None

# Global database client
db_client = MongoDBClient()
