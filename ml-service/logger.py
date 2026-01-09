import json
from datetime import datetime
from typing import Optional, Dict, Any
import os

class Logger:
    def __init__(self):
        self.debug_mode = os.getenv("DEBUG", "false").lower() == "true"
    
    def _format_log(self, level: str, module: str, action: str, message: str, 
                   data: Optional[Dict[str, Any]] = None, error: Optional[str] = None) -> str:
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "module": module,
            "action": action,
            "message": message,
        }
        if data:
            log_entry["data"] = data
        if error:
            log_entry["error"] = error
        return json.dumps(log_entry)
    
    def info(self, message: str, data: Optional[Dict[str, Any]] = None, module: str = "ML_SERVICE"):
        log_str = self._format_log("info", module, "INFO", message, data)
        print(log_str)
    
    def error(self, message: str, data: Optional[Dict[str, Any]] = None, module: str = "ML_SERVICE", 
             error: Optional[str] = None):
        log_str = self._format_log("error", module, "ERROR", message, data, error)
        print(log_str)
    
    def warn(self, message: str, data: Optional[Dict[str, Any]] = None, module: str = "ML_SERVICE"):
        log_str = self._format_log("warn", module, "WARN", message, data)
        print(log_str)
    
    def debug(self, message: str, data: Optional[Dict[str, Any]] = None, module: str = "ML_SERVICE"):
        if self.debug_mode:
            log_str = self._format_log("debug", module, "DEBUG", message, data)
            print(log_str)

logger = Logger()
