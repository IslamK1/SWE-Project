from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Link(Base):
    supplier_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    consumer_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    is_approved = Column(Boolean, default=False)

    supplier = relationship(
        "User", 
        foreign_keys=[supplier_id],
        backref="supplier_links"
    )

    consumer = relationship(
        "User", 
        foreign_keys=[consumer_id],
        backref="consumer_links"
    )
