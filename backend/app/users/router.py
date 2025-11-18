from fastapi import APIRouter, HTTPException, status, Response, Depends
from pydantic import EmailStr

from app.users.auth import get_password_hash, verify_password, create_access_token
from app.users.dao import UserDAO
from app.users.schemas import SUserRegister, SUserAuth, SUserRegisterSM
from app.users.dependecies import get_current_user
from app.users.models import User


router = APIRouter(prefix='/auth', tags=['Auth endpoints'])


@router.post("/register/")
async def register_user(user_data: SUserRegister) -> dict:
    user = await UserDAO.get_one_or_none(email=user_data.email)
    if user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
    user_dict = user_data.model_dump()
    user_dict['password'] = get_password_hash(user_data.password)
    await UserDAO.add(**user_dict)
    return {'message': 'Successfully registered!'}

async def authenticate_user(email: EmailStr, password: str):
    user = await UserDAO.get_one_or_none(email=email)
    if not user or verify_password(plain_password=password, hashed_password=user.password) is False:
        return None
    return user

@router.post("/login/")
async def auth_user(response: Response, user_data: SUserAuth):
    user = await authenticate_user(email=user_data.email, password=user_data.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong email or password!")
    access_token = create_access_token({"sub": str(user.id)})
    response.set_cookie(key="users_access_token", value=access_token, httponly=True)
    return {'access_token': access_token, 'refresh_token': None}

@router.get("/me/")
async def get_me(user_data: User = Depends(get_current_user)):
    return user_data

@router.post("/logout/")
async def logout_user(response: Response):
    response.delete_cookie(key="users_access_token")
    return {'message': 'User successfully left the system!'}


@router.post("/register_supplier_member/")
async def register_supplier_member(user_data: SUserRegisterSM, current_user: User = Depends(get_current_user)) -> dict:
    if not current_user.is_supplier_owner:
        raise HTTPException(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail="Only owners can register members!")

    user = await UserDAO.get_one_or_none(email=user_data.email)
    if user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    user_dict = user_data.model_dump()
    user_dict['password'] = get_password_hash(user_data.password)
    user_dict['supplier_owner_id'] = current_user.id
    user_dict['is_consumer'] = False

    await UserDAO.add(**user_dict)
    return {'message': 'Successfully registered!'}
