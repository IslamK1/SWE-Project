from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.products.models import Product
from app.users.models import User
from app.links.models import Link
from app.chat.models import Chat, Message
from app.products.router import router as products_router
from app.users.router import router as users_router
from app.links.router import router as links_router
from app.chat.router import router as chat_router

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

@app.get("/")
def hello_world():
    return {"message": "Hello World!"}


app.include_router(products_router)
app.include_router(users_router)
app.include_router(links_router)
app.include_router(chat_router)
