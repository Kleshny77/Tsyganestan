from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.infra.db import get_db
from app.infra.repo.tours import SQLAlchemyTourRepository
from app.services.tours import TourService
from app.interfaces.dependencies import get_current_user, role_required
from app.interfaces.schemas import TourCreate, TourUpdate, TourResponse
from app.domain.entities import User
from app.domain.enums import UserRole

router = APIRouter(prefix="/tours", tags=["tours"])

@router.post("/", response_model=TourResponse)
def create_tour(
    tour_data: TourCreate,
    current_user: User = Depends(role_required([UserRole.TOUR_AGENT, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    repo = SQLAlchemyTourRepository(db)
    service = TourService(repo)
    try:
        tour = service.create_tour(tour_data.title, tour_data.description, tour_data.price, tour_data.location, current_user)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    return TourResponse(
        id=tour.id, title=tour.title, description=tour.description,
        price=tour.price, location=tour.location, created_by=tour.created_by,
        created_at=tour.created_at, updated_at=tour.updated_at
    )

@router.get("/", response_model=list[TourResponse])
def list_tours(db: Session = Depends(get_db)):
    repo = SQLAlchemyTourRepository(db)
    service = TourService(repo)
    tours = service.list_tours()
    return [
        TourResponse(
            id=t.id, title=t.title, description=t.description,
            price=t.price, location=t.location, created_by=t.created_by,
            created_at=t.created_at, updated_at=t.updated_at
        ) for t in tours
    ]

@router.get("/{tour_id}", response_model=TourResponse)
def get_tour(tour_id: int, db: Session = Depends(get_db)):
    repo = SQLAlchemyTourRepository(db)
    service = TourService(repo)
    try:
        tour = service.get_tour(tour_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return TourResponse(
        id=tour.id, title=tour.title, description=tour.description,
        price=tour.price, location=tour.location, created_by=tour.created_by,
        created_at=tour.created_at, updated_at=tour.updated_at
    )

@router.put("/{tour_id}", response_model=TourResponse)
def update_tour(
    tour_id: int,
    tour_data: TourUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repo = SQLAlchemyTourRepository(db)
    service = TourService(repo)
    try:
        tour = service.update_tour(tour_id, tour_data.title, tour_data.description, tour_data.price, tour_data.location, current_user)
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=403 if isinstance(e, PermissionError) else 404, detail=str(e))
    return TourResponse(
        id=tour.id, title=tour.title, description=tour.description,
        price=tour.price, location=tour.location, created_by=tour.created_by,
        created_at=tour.created_at, updated_at=tour.updated_at
    )

@router.delete("/{tour_id}")
def delete_tour(tour_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    repo = SQLAlchemyTourRepository(db)
    service = TourService(repo)
    try:
        service.delete_tour(tour_id, current_user)
    except (ValueError, PermissionError) as e:
        raise HTTPException(status_code=403 if isinstance(e, PermissionError) else 404, detail=str(e))
    return {"message": "Tour deleted"}
