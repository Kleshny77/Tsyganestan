from abc import ABC, abstractmethod
from typing import List, Optional
from ...domain.entities import User, Tour
from ...domain.enums import UserRole

class UserRepository(ABC):
    @abstractmethod
    def get_by_username(self, username: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def create(self, user: User) -> User:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    def list_all(self) -> List[User]:
        pass

    @abstractmethod
    def update_role(self, user_id: int, new_role: UserRole) -> User:
        pass

class TourRepository(ABC):
    @abstractmethod
    def create(self, tour: Tour) -> Tour:
        pass

    @abstractmethod
    def get_all(self) -> List[Tour]:
        pass

    @abstractmethod
    def get_by_id(self, tour_id: int) -> Optional[Tour]:
        pass

    @abstractmethod
    def update(self, tour: Tour) -> Tour:
        pass

    @abstractmethod
    def delete(self, tour_id: int) -> None:
        pass

    @abstractmethod
    def get_by_creator(self, user_id: int) -> List[Tour]:
        pass
