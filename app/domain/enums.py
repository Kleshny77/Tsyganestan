from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    TOUR_AGENT = "tour_agent"
    ADMIN = "admin"
