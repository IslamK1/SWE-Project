from app.base.dao import BaseDAO
from app.chat.models import Chat, Message


class ChatDAO(BaseDAO):
    model = Chat


class MessageDAO(BaseDAO):
    model = Message
