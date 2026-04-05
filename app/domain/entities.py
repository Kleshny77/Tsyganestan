from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from .enums import UserRole

@dataclass
class User:
    id: Optional[int]
    username: str
    email: str
    hashed_password: str
    role: UserRole
    created_at: datetime

@dataclass
class Tour:
    id: Optional[int]
    title: str
    description: str
    price: float
    location: str
    created_by: int  # user_id
    created_at: datetime
    updated_at: Optional[datetime]
