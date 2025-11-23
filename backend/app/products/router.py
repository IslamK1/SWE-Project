from fastapi import APIRouter, Depends, HTTPException
from app.products.dao import ProductDAO
from app.products.schemas import SProduct, SProductAdd, SProductUpdate
from app.products.rb import RBProduct
from app.users.models import User
from app.users.dependecies import get_current_user
from app.links.dao import LinkDAO

router = APIRouter(prefix='/products', tags=['Product endpoints'])

@router.get("/supplier/{supplier_id}/", summary="Get products")
async def get_products(supplier_id: int, request_body: RBProduct = Depends(), current_user: User = Depends(get_current_user)):
    if current_user.id == supplier_id or current_user.supplier_owner_id == supplier_id:
    	return await ProductDAO.get_all(**request_body.to_dict())
    link = await LinkDAO.get_one_or_none(supplier_id=supplier_id, consumer_id=current_user.id)
    if link:
        return await ProductDAO.get_all(**request_body.to_dict())
    return {'message': 'Access denied!'}



@router.get("/{id}", summary="Get one product by id")
async def get_product_by_id(id: int, current_user: User = Depends(get_current_user)) -> SProduct | dict:
    result = await ProductDAO.get_one_or_none_by_id(id)
    if result:
        supplier_id = result.supplier_id
        if current_user.id == supplier_id or current_user.supplier_owner_id == supplier_id:
            return result
        link = await LinkDAO.get_one_or_none(supplier_id=supplier_id, consumer_id=current_user.id)
        if link:
            return result
        return {'message': 'Access denied!'}
    return {'message': f'Product with id {id} not found!'}

@router.post("/add")
async def add_product(product: SProductAdd, current_user: User = Depends(get_current_user)) -> dict:
    if current_user.is_consumer or current_user.is_supplier_repr:
        return {'meesage': 'Only supplier owners or managers can create product!'}
    supplier_id = current_user.id
    if current_user.is_supplier_manager:
        supplier_id = current_user.supplier_owner_id
    product_dict = product.model_dump()
    product_dict['supplier_id'] = supplier_id
    result = await ProductDAO.add(**product_dict)
    if result:
        return {'message': 'Product added succecfully!', 'product': product}
    return {'message': 'Failed to add product!'}

@router.put("/update/{id}")
async def update(id: int, product: SProductUpdate, current_user: User = Depends(get_current_user)) -> dict:
    if current_user.is_consumer or current_user.is_supplier_repr:
        return {'meesage': 'Only supplier owners or managers can update products!'}
    supplier_id = current_user.id
    if current_user.is_supplier_manager:
        supplier_id = current_user.supplier_owner_id
    p = await ProductDAO.get_one_or_none(id=id)
    if p and p.supplier_id != supplier_id:
        return {'message': 'Only supplier owners or managers can update product!'}
    data = product.model_dump()
    filtered_data = {key: value for key, value in data.items() if value is not None}
    if len(filtered_data) == 0:
        raise HTTPException(400, "No fields to update!")
    result = await ProductDAO.update(filter_by={"id": id}, **filtered_data)
    if result:
        return {'message': 'Product sucsessfully updated!'}
    return {'message': 'Product failed to update!'}

@router.delete("/delete/{id}")
async def delete(id: int, current_user: User = Depends(get_current_user)) -> dict:
    if current_user.is_consumer or current_user.is_supplier_repr:
        return {'meesage': 'Only supplier owners or managers can delete products!'}
    supplier_id = current_user.id
    if current_user.is_supplier_manager:
        supplier_id = current_user.supplier_owner_id
    p = await ProductDAO.get_one_or_none(id=id)
    if p and p.supplier_id != supplier_id:
        return {'message': 'Only supplier owners or managers can delete product!'}
    result = await ProductDAO.delete(id=id)
    if result:
        return {'message': f'Product with id {id} deleted succesfully!'}
    return {'message': 'Failed to delete product!'}
