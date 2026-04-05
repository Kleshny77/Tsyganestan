from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.infra.db import get_db
from app.infra.repo.users import SQLAlchemyUserRepository
from app.services.auth import decode_access_token
from app.domain.entities import User
from app.domain.enums import UserRole

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_repo = SQLAlchemyUserRepository(db)
    user = user_repo.get_by_username(username)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def role_required(allowed_roles: list[UserRole]):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return dependency

# Для guest (неавторизованный) – просто не используем зависимость.
