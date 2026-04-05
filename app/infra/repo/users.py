from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.entities import User
from app.infra.repo.base import UserRepository
from app.domain.enums import UserRole
from app.infra.models import UserModel

class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: Session):
        self.session = session

    def _to_entity(self, model: UserModel) -> User:
        return User(
            id=model.id,
            username=model.username,
            email=model.email,
            hashed_password=model.hashed_password,
            role=model.role,
            created_at=model.created_at,
        )

    def _to_model(self, entity: User) -> UserModel:
        return UserModel(
            id=entity.id,
            username=entity.username,
            email=entity.email,
            hashed_password=entity.hashed_password,
            role=entity.role,
        )

    def get_by_username(self, username: str) -> Optional[User]:
        model = self.session.query(UserModel).filter(UserModel.username == username).first()
        return self._to_entity(model) if model else None

    def get_by_email(self, email: str) -> Optional[User]:
        model = self.session.query(UserModel).filter(UserModel.email == email).first()
        return self._to_entity(model) if model else None

    def create(self, user: User) -> User:
        model = self._to_model(user)
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return self._to_entity(model)

    def get_by_id(self, user_id: int) -> Optional[User]:
        model = self.session.query(UserModel).filter(UserModel.id == user_id).first()
        return self._to_entity(model) if model else None

    def list_all(self) -> List[User]:
        models = self.session.query(UserModel).all()
        return [self._to_entity(m) for m in models]

    def update_role(self, user_id: int, new_role: UserRole) -> User:
        model = self.session.query(UserModel).filter(UserModel.id == user_id).first()
        if model:
            model.role = new_role
            self.session.commit()
            self.session.refresh(model)
        return self._to_entity(model)
