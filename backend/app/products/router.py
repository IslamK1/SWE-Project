from fastapi import APIRouter, Depends, HTTPException
from app.products.dao import ProductDAO
from app.products.schemas import SProduct, SProductAdd, SProductUpdate
from app.products.rb import RBProduct

router = APIRouter(prefix='/products', tags=['Product endpoints'])

@router.get("/", summary="Get products", response_model=list[SProduct])
async def get_products(request_body: RBProduct = Depends()):
    return await ProductDAO.get_all(**request_body.to_dict())


@router.get("/{id}", summary="Get one product by id")
async def get_product_by_id(id: int) -> SProduct | dict:
    result = await ProductDAO.get_one_or_none_by_id(id)
    if result:
        return result
    return {'message': f'Product with id {id} not found!'}


@router.get("/by_filter", summary="Get one product by filter")
async def get_product_by_filter(request_body: RBProduct = Depends()) -> SProduct | dict:
    result = await ProductDAO.get_one_or_none(**request_body.to_dict())
    if result:
        return result
    return {'message': 'Product with given filters not found!'}

@router.post("/add")
async def add_product(product: SProductAdd) -> dict:
    result = await ProductDAO.add(**product.model_dump())
    if result:
        return {'message': 'Product added succecfully!', 'product': product}
    return {'message': 'Failed to add product!'}

@router.put("/update/{id}")
async def update(id: int, product: SProductUpdate) -> dict:
    data = product.model_dump()
    filtered_data = {key: value for key, value in data.items() if value is not None}
    if len(filtered_data) == 0:
        raise HTTPException(400, "No fields to update!")
    result = await ProductDAO.update(filter_by={"id": id}, **filtered_data)
    if result:
        return {'message': 'Product sucsessfully updated!'}
    return {'message': 'Product failed to update!'}

@router.delete("/delete/{id}")
async def delete(id: int) -> dict:
    result = await ProductDAO.delete(id=id)
    if result:
        return {'message': f'Product with id {id} deleted succesfully!'}
    return {'message': 'Failed to delete product!'}
