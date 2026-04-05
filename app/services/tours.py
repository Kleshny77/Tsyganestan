from typing import List
from app.domain.entities import Tour, User
from app.infra.repo.base import TourRepository
from app.domain.enums import UserRole

class TourService:
    def __init__(self, tour_repo: TourRepository):
        self.tour_repo = tour_repo

    def create_tour(self, title: str, description: str, price: float, location: str, current_user: User) -> Tour:
        if current_user.role not in (UserRole.TOUR_AGENT, UserRole.ADMIN):
            raise PermissionError("Only tour agents or admins can create tours")
        tour = Tour(id=None, title=title, description=description, price=price, location=location,
                    created_by=current_user.id, created_at=None, updated_at=None)
        return self.tour_repo.create(tour)

    def list_tours(self) -> List[Tour]:
        return self.tour_repo.get_all()

    def get_tour(self, tour_id: int) -> Tour:
        tour = self.tour_repo.get_by_id(tour_id)
        if not tour:
            raise ValueError("Tour not found")
        return tour

    def update_tour(self, tour_id: int, title: str, description: str, price: float, location: str, current_user: User) -> Tour:
        tour = self.tour_repo.get_by_id(tour_id)
        if not tour:
            raise ValueError("Tour not found")
        if current_user.role != UserRole.ADMIN and tour.created_by != current_user.id:
            raise PermissionError("You can only edit your own tours")
        tour.title = title
        tour.description = description
        tour.price = price
        tour.location = location
        return self.tour_repo.update(tour)

    def delete_tour(self, tour_id: int, current_user: User) -> None:
        tour = self.tour_repo.get_by_id(tour_id)
        if not tour:
            raise ValueError("Tour not found")
        if current_user.role != UserRole.ADMIN and tour.created_by != current_user.id:
            raise PermissionError("You can only delete your own tours")
        self.tour_repo.delete(tour_id)
