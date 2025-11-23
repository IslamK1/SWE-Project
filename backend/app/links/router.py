from fastapi import APIRouter, Depends
from app.links.dao import LinkDAO
from app.users.dependecies import get_current_user
from app.users.models import User
from app.chat.dao import ChatDAO

router = APIRouter(prefix='/links', tags=['Link endpoints'])

@router.get('/suppliers/')
async def get_linked_suppliers(current_user: User = Depends(get_current_user)):
    if not current_user.is_consumer:
        return {'message': 'This endpoint only for consumers'}
    return await LinkDAO.get_all(consumer_id=current_user.id, is_approved=True)

@router.get('/consumers/')
async def get_linked_consumers(current_user: User = Depends(get_current_user)):
    if current_user.is_consumer:
        return {'message': 'This endpoint only for suppliers'}
    supplier_id = current_user.id
    if current_user.is_supplier_manager or current_user.is_supplier_repr:
        supplier_id = current_user.supplier_owner_id
    return await LinkDAO.get_all(supplier_id=supplier_id, is_approved=True)

@router.get('/sent/')
async def get_sent_links(current_user: User = Depends(get_current_user)):
    if not current_user.is_consumer:
        return {'message': 'This endpoint only for consumers'}
    return await LinkDAO.get_all(consumer_id=current_user.id, is_approved=False)

@router.get('/received/')
async def get_received_linkks(current_user: User = Depends(get_current_user)):
    if current_user.is_consumer:
        return {'message': 'This endpoint only for suppliers'}
    supplier_id = current_user.id
    if current_user.is_supplier_manager or current_user.is_supplier_repr:
        supplier_id = current_user.supplier_owner_id
    return await LinkDAO.get_all(supplier_id=supplier_id, is_approved=False)

@router.post('/send-request/')
async def send_request(supplier_id: int, current_user: User = Depends(get_current_user)):
    if not current_user.is_consumer:
        return {'message': 'Only consumers can send request!'}
    result = await LinkDAO.add(supplier_id=supplier_id, consumer_id=current_user.id)
    if result:
        return {'message': 'Request sent succesffully!'}
    return {'message': 'Request failed to send!'}

@router.put('/approve-request/')
async def approve_request(consumer_id: int, current_user: User = Depends(get_current_user)):
    if current_user.is_consumer or current_user.is_supplier_repr:
        return {'message': 'Only supplier owners or managers can approve requests!'}
    supplier_id = current_user.id
    if current_user.is_supplier_manager:
        supplier_id = current_user.supplier_owner_id
    result = await LinkDAO.update(filter_by={'supplier_id': supplier_id, 'consumer_id': consumer_id}, is_approved=True)
    if result:
        await ChatDAO.add(supplier_id=supplier_id, consumer_id=consumer_id)
        return {'message': 'Request approved succesfully!'}
    return {'message': 'Request failed to approve!'}

@router.delete("/reject-request/")
async def reject_request(consumer_id: int, current_user: User = Depends(get_current_user)):
    if current_user.is_consumer or current_user.is_supplier_repr:
        return {'message': 'Only supplier owners or managers can reject request!'}
    supplier_id = current_user.id
    if current_user.is_supplier_manager:
        supplier_id = current_user.supplier_owner_id
    result = await LinkDAO.delete(supplier_id=supplier_id, consumer_id=consumer_id)
    if result:
        await ChatDAO.delete(supplier_id=supplier_id, consumer_id=consumer_id)
        return {'message': 'Request rejected succesfully!'}
    return {'message': 'Request failed to reject!'}
