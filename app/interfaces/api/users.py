from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infra.db import get_db
from app.infra.repo.users import SQLAlchemyUserRepository
from app.services.users import UserService
from app.interfaces.dependencies import role_required
from app.interfaces.schemas import UserResponse, ChangeRoleRequest
from app.domain.entities import User
from app.domain.enums import UserRole

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserResponse])
def list_users(
    current_user: User = Depends(role_required([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    repo = SQLAlchemyUserRepository(db)
    service = UserService(repo)
    users = service.list_all_users()
    return [
        UserResponse(id=u.id, username=u.username, email=u.email, role=u.role, created_at=u.created_at)
        for u in users
    ]

@router.patch("/role", response_model=UserResponse)
def change_role(
    req: ChangeRoleRequest,
    current_user: User = Depends(role_required([UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    repo = SQLAlchemyUserRepository(db)
    service = UserService(repo)
    try:
        updated = service.change_user_role(req.user_id, req.new_role, current_user)
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=403 if isinstance(e, PermissionError) else 400, detail=str(e))
    return UserResponse(id=updated.id, username=updated.username, email=updated.email, role=updated.role, created_at=updated.created_at)
