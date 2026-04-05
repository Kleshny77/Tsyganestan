from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.domain.enums import UserRole

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.USER

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    created_at: datetime

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TourCreate(BaseModel):
    title: str
    description: str
    price: float
    location: str

class TourUpdate(BaseModel):
    title: str
    description: str
    price: float
    location: str

class TourResponse(BaseModel):
    id: int
    title: str
    description: str
    price: float
    location: str
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime]

class ChangeRoleRequest(BaseModel):
    user_id: int
    new_role: UserRole
