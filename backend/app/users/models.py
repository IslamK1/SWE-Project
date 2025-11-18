from sqlalchemy import ForeignKey, text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base, str_uniq, int_pk, str_null_true


class User(Base):
    id: Mapped[int_pk]
    first_name: Mapped[str]
    last_name: Mapped[str_null_true]
    email: Mapped[str_uniq]
    password: Mapped[str]

    products: Mapped[list["Product"]] = relationship("Product", back_populates="supplier")

    is_consumer: Mapped[bool] = mapped_column(default=True, server_default=text('true'), nullable=False)
    is_supplier_owner: Mapped[bool] = mapped_column(default=False, server_default=text('false'), nullable=False)
    is_supplier_manager: Mapped[bool] = mapped_column(default=False, server_default=text('false'), nullable=False)
    is_supplier_repr: Mapped[bool] = mapped_column(default=False, server_default=text('false'), nullable=False)
    
    supplier_owner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    supplier_owner: Mapped["User"] = relationship("User", remote_side="User.id", back_populates="team_members")
    
    team_members: Mapped[list["User"]] = relationship("User", back_populates="supplier_owner")
