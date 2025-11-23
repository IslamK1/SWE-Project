from sqlalchemy import Column, Integer, ForeignKey, VARCHAR
from sqlalchemy.orm import relationship
from app.database import Base


class Chat(Base):
    id = Column(Integer, primary_key=True)
    supplier_id = Column(Integer, ForeignKey('users.id'))
    consumer_id = Column(Integer, ForeignKey('users.id'))

    supplier = relationship("User", foreign_keys=[supplier_id], backref="supplier_chats")
    consumer = relationship("User", foreign_keys=[consumer_id], backref="consumer_chats")


class Message(Base):
    id = Column(Integer, primary_key=True)
    chat_id = Column(Integer, ForeignKey('chats.id'))
    sender_id = Column(Integer, ForeignKey('users.id'))
    content = Column(VARCHAR)

    chat = relationship("Chat", foreign_keys=[chat_id], backref="messages")
    sender = relationship("User", foreign_keys=[sender_id], backref="send_messages")
