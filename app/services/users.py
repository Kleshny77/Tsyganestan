from typing import List
from app.domain.entities import User
from app.infra.repo.base import UserRepository
from app.domain.enums import UserRole

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def list_all_users(self) -> List[User]:
        return self.user_repo.list_all()

    def change_user_role(self, target_user_id: int, new_role: UserRole, current_user: User) -> User:
        if current_user.role != UserRole.ADMIN:
            raise PermissionError("Only admin can change roles")
        target = self.user_repo.get_by_id(target_user_id)
        if not target:
            raise ValueError("User not found")
        if target.id == current_user.id:
            raise ValueError("Cannot change your own role")
        return self.user_repo.update_role(target_user_id, new_role)
