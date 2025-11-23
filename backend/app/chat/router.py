from fastapi import APIRouter, Depends
from app.chat.dao import ChatDAO, MessageDAO
from app.users.dependecies import get_current_user
from app.users.models import User

router = APIRouter(prefix="/chat", tags=["Chat endpoints"])

@router.get("/")
async def get_all_chats(current_user: User = Depends(get_current_user)):
    if current_user.is_consumer:
        consumer_id = current_user.id
        return await ChatDAO.get_all(consumer_id=consumer_id)
    
    supplier_id = current_user.id
    if current_user.is_supplier_manager or current_user.is_supplier_repr:
        supplier_id = current_user.supplier_owner_id
    return await ChatDAO.get_all(supplier_id=supplier_id)

@router.get("/{chat_id}/")
async def get_chat_contents(chat_id: int, current_user: User = Depends(get_current_user)):
    return await MessageDAO.get_all(chat_id=chat_id)

@router.post("/{chat_id}/")
async def send_message(chat_id: int, content: str, current_user: User = Depends(get_current_user)):
    chat = await ChatDAO.get_one_or_none_by_id(chat_id)
    if not chat:
        return {'message': 'Chat not found'}

    if current_user.id not in [chat.supplier_id, chat.consumer_id]:
        return {'message': 'Access denied'}

    result = await MessageDAO.add(chat_id=chat_id, sender_id=current_user.id, content=content)
    if result:
        return {'message': 'Message sent successfully!'}
    return {'message': 'Failed to send message'}
