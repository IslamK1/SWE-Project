from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.products.models import Product
from app.users.models import User
from app.products.router import router as products_router
from app.users.router import router as users_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database...")
    await init_db()
    yield

app = FastAPI(root_path="/api", lifespan=lifespan)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

@app.get("/hello-world")
def hello_world():
    return {"response": "nurbek chert"}


app.include_router(products_router)
app.include_router(users_router)
