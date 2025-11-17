from sqlalchemy import ForeignKey, text, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base, str_uniq, int_pk, str_null_true
from datetime import date


class Product(Base):
    id: Mapped[int_pk]
    name: Mapped[str]
    description: Mapped[str]
    price: Mapped[int] = mapped_column(nullable=False)
    quantity: Mapped[int] = mapped_column(nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    supplier: Mapped["User"] = relationship("User", back_populates="products")

    def __str__(self):
        return (f"{self.__class__.__name__}(id={self.id}, name={self.name!r}, id={self.id!r})")

    def __repr__(self):
        return str(self)


class User(Base):
    id: Mapped[int_pk]
    first_name: Mapped[str]
    last_name: Mapped[str_null_true]
    products: Mapped[list["Product"]] = relationship("Product", back_populates="supplier")

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id}, first_name={self.first_name!r})"

    def __repr__(self):
        return str(self)
