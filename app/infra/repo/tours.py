from typing import Optional, List
from sqlalchemy.orm import Session
from app.domain.entities import Tour
from app.infra.repo.base import TourRepository
from app.infra.models import TourModel

class SQLAlchemyTourRepository(TourRepository):
    def __init__(self, session: Session):
        self.session = session

    def _to_entity(self, model: TourModel) -> Tour:
        return Tour(
            id=model.id,
            title=model.title,
            description=model.description,
            price=model.price,
            location=model.location,
            created_by=model.created_by,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: Tour) -> TourModel:
        return TourModel(
            id=entity.id,
            title=entity.title,
            description=entity.description,
            price=entity.price,
            location=entity.location,
            created_by=entity.created_by,
        )

    def create(self, tour: Tour) -> Tour:
        model = self._to_model(tour)
        self.session.add(model)
        self.session.commit()
        self.session.refresh(model)
        return self._to_entity(model)

    def get_all(self) -> List[Tour]:
        models = self.session.query(TourModel).all()
        return [self._to_entity(m) for m in models]

    def get_by_id(self, tour_id: int) -> Optional[Tour]:
        model = self.session.query(TourModel).filter(TourModel.id == tour_id).first()
        return self._to_entity(model) if model else None

    def update(self, tour: Tour) -> Tour:
        model = self.session.query(TourModel).filter(TourModel.id == tour.id).first()
        if model:
            model.title = tour.title
            model.description = tour.description
            model.price = tour.price
            model.location = tour.location
            self.session.commit()
            self.session.refresh(model)
        return self._to_entity(model)

    def delete(self, tour_id: int) -> None:
        self.session.query(TourModel).filter(TourModel.id == tour_id).delete()
        self.session.commit()

    def get_by_creator(self, user_id: int) -> List[Tour]:
        models = self.session.query(TourModel).filter(TourModel.created_by == user_id).all()
        return [self._to_entity(m) for m in models]
