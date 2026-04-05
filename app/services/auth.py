from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.domain.entities import User
from app.infra.repo.base import UserRepository
from app.domain.enums import UserRole

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def register(self, username: str, email: str, password: str, role: UserRole = UserRole.USER) -> User:
        if self.user_repo.get_by_username(username):
            raise ValueError("Username already exists")
        if self.user_repo.get_by_email(email):
            raise ValueError("Email already exists")
        hashed = hash_password(password)
        user = User(id=None, username=username, email=email, hashed_password=hashed, role=role, created_at=datetime.utcnow())
        return self.user_repo.create(user)

    def login(self, username: str, password: str) -> str:
        user = self.user_repo.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid credentials")
        token_data = {"sub": user.username, "role": user.role.value, "user_id": user.id}
        return create_access_token(token_data)
