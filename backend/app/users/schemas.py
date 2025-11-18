from pydantic import BaseModel, EmailStr, Field


class SUserRegister(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=6)
    first_name: str = Field(...)
    last_name: str | None = Field(None)
    is_consumer: bool = Field(True)
    is_supplier_owner: bool = Field(False)


class SUserAuth(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=6)


class SUserRegisterSM(BaseModel):
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=6)
    first_name: str = Field(...)
    last_name: str | None = Field(None)
    is_supplier_manager: bool = Field(...)
    is_supplier_repr: bool = Field(...)
