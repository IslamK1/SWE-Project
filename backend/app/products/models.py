from sqlalchemy import ForeignKey, text, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base, str_uniq, int_pk, str_null_true
from datetime import date


class Product(Base):
    id: Mapped[int_pk]
    title: Mapped[str]
    description: Mapped[str]
    price: Mapped[int] = mapped_column(nullable=False)
    quantitty: Mapped[int] = mapped_column(nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship("User", back_populates="products")

    def __str__(self):
        return (f"{self.__class__.__name__}(id={self.id}, title={self.title!r}, id={self.id!r})")

    def __repr__(self):
        return str(self)


class User(Base):
    id: Mapped[int_pk]
    first_name: Mapped[str]
    last_name: Mapped[str_null_true]

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id}, first_name={self.first_name!r})"

    def __repr__(self):
        return str(self)
