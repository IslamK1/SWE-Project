from pydantic import BaseModel, Field, ConfigDict


class SProduct(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str = Field(...)
    description: str | None = Field(None)
    price: int = Field(..., ge=0)
    quantity: int = Field(..., ge=0)
    supplier_id: int = Field(..., ge=1)


class SProductAdd(BaseModel):
    name: str = Field(...)
    description: str | None = Field(None)
    price: int = Field(..., ge=0)
    quantity: int = Field(..., ge=0)
    supplier_id: int = Field(..., ge=1)


class SProductUpdate(BaseModel):
    name: str | None = Field(None)
    description: str | None = Field(None)
    price: int | None = Field(None, ge=0)
    quantity: int | None = Field(None, ge=0)
