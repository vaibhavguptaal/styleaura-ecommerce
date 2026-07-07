from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr, BeforeValidator


# ------------------------------------------------------------------
# DB setup
# ------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']


# ------------------------------------------------------------------
# Auth helpers
# ------------------------------------------------------------------
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ------------------------------------------------------------------
# Models
# ------------------------------------------------------------------
class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class ProductIn(BaseModel):
    name: str
    category: str
    price: float
    discount_price: Optional[float] = None
    description: str = ""
    fabric: str = ""
    sizes: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    stock_status: str = "in_stock"  # in_stock | out_of_stock | low_stock
    is_best_seller: bool = False
    is_new_arrival: bool = False
    delivery_note: str = "Ships within 3-5 business days across India."
    care_instructions: str = "Hand wash cold. Do not bleach. Dry in shade."


class Product(ProductIn):
    id: str
    created_at: str


class EnquiryIn(BaseModel):
    name: str
    phone: str
    product_name: Optional[str] = ""
    size: Optional[str] = ""
    message: str = ""


# ------------------------------------------------------------------
# App + Router
# ------------------------------------------------------------------
app = FastAPI(title="StyleAura Fashion API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "StyleAura Fashion API", "version": "1.0"}


# ---------------- Auth routes ----------------
@api_router.post("/auth/login")
async def login(payload: LoginPayload, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)

    response.set_cookie("access_token", access, httponly=True, secure=False,
                        samesite="lax", max_age=8 * 3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False,
                        samesite="lax", max_age=7 * 24 * 3600, path="/")

    return {
        "id": user_id,
        "email": email,
        "name": user.get("name", "Admin"),
        "role": user.get("role", "admin"),
        "access_token": access,
    }


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "id": user["_id"],
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": user.get("role", "admin"),
    }


# ---------------- Products routes ----------------
def product_to_dict(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "category": doc["category"],
        "price": doc["price"],
        "discount_price": doc.get("discount_price"),
        "description": doc.get("description", ""),
        "fabric": doc.get("fabric", ""),
        "sizes": doc.get("sizes", []),
        "colors": doc.get("colors", []),
        "stock_status": doc.get("stock_status", "in_stock"),
        "is_best_seller": doc.get("is_best_seller", False),
        "is_new_arrival": doc.get("is_new_arrival", False),
        "delivery_note": doc.get("delivery_note", ""),
        "care_instructions": doc.get("care_instructions", ""),
        "created_at": doc.get("created_at", ""),
    }


@api_router.get("/products")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    size: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    best_seller: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    sort: Optional[str] = Query(None, description="new|price_asc|price_desc|best_sellers"),
):
    query: dict = {}
    if category and category.lower() != "all":
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if size:
        query["sizes"] = size
    if best_seller:
        query["is_best_seller"] = True
    if new_arrival:
        query["is_new_arrival"] = True
    price_q: dict = {}
    if min_price is not None:
        price_q["$gte"] = min_price
    if max_price is not None:
        price_q["$lte"] = max_price
    if price_q:
        query["price"] = price_q

    cursor = db.products.find(query)
    if sort == "price_asc":
        cursor = cursor.sort("price", 1)
    elif sort == "price_desc":
        cursor = cursor.sort("price", -1)
    elif sort == "best_sellers":
        cursor = cursor.sort("is_best_seller", -1)
    else:
        cursor = cursor.sort("created_at", -1)

    docs = await cursor.to_list(500)
    return [product_to_dict(d) for d in docs]


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = await db.products.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_dict(doc)


@api_router.post("/products")
async def create_product(payload: ProductIn, _admin: dict = Depends(require_admin)):
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.products.insert_one(doc)
    doc["_id"] = result.inserted_id
    return product_to_dict(doc)


@api_router.put("/products/{product_id}")
async def update_product(product_id: str, payload: ProductIn,
                         _admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")
    updates = payload.model_dump()
    result = await db.products.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = await db.products.find_one({"_id": oid})
    return product_to_dict(doc)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, _admin: dict = Depends(require_admin)):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")
    result = await db.products.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Deleted"}


# ---------------- Enquiries routes ----------------
@api_router.post("/enquiries")
async def create_enquiry(payload: EnquiryIn):
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.enquiries.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Enquiry submitted"}


@api_router.get("/enquiries")
async def list_enquiries(_admin: dict = Depends(require_admin)):
    docs = await db.enquiries.find().sort("created_at", -1).to_list(500)
    return [
        {
            "id": str(d["_id"]),
            "name": d.get("name", ""),
            "phone": d.get("phone", ""),
            "product_name": d.get("product_name", ""),
            "size": d.get("size", ""),
            "message": d.get("message", ""),
            "created_at": d.get("created_at", ""),
        }
        for d in docs
    ]


# ------------------------------------------------------------------
# Startup: indexes, admin seed, and demo products
# ------------------------------------------------------------------
SAMPLE_PRODUCTS = [
    {"name": "Rose Bloom Anarkali Kurti", "category": "Kurtis", "price": 1899, "discount_price": 1299,
     "description": "A flowing anarkali silhouette adorned with delicate rose motifs. Perfect for festive occasions.",
     "fabric": "Rayon blend with soft cotton lining",
     "sizes": ["S", "M", "L", "XL"], "colors": ["Blush", "Ivory", "Terracotta"],
     "stock_status": "in_stock", "is_best_seller": True, "is_new_arrival": True},
    {"name": "Ivory Whisper Co-ord Set", "category": "Co-ord Sets", "price": 2499, "discount_price": 1899,
     "description": "Relaxed cropped top with wide leg trousers in a soft ivory palette.",
     "fabric": "Lightweight muslin",
     "sizes": ["S", "M", "L"], "colors": ["Ivory", "Sage"],
     "stock_status": "in_stock", "is_best_seller": True, "is_new_arrival": False},
    {"name": "Terracotta Twirl Dress", "category": "Dresses", "price": 2199, "discount_price": None,
     "description": "A midi dress with a flattering wrap fit and a subtle side twirl detail.",
     "fabric": "Crepe with satin trim",
     "sizes": ["S", "M", "L", "XL"], "colors": ["Terracotta", "Charcoal"],
     "stock_status": "in_stock", "is_best_seller": False, "is_new_arrival": True},
    {"name": "Sage Meadow Cotton Kurti", "category": "Kurtis", "price": 1299, "discount_price": 999,
     "description": "Everyday cotton kurti with hand-block inspired prints.",
     "fabric": "100% Pure Cotton",
     "sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["Sage", "Mustard", "Ivory"],
     "stock_status": "in_stock", "is_best_seller": True, "is_new_arrival": False},
    {"name": "Golden Hour Ethnic Set", "category": "Ethnic Wear", "price": 3499, "discount_price": 2799,
     "description": "A three-piece ethnic ensemble with dupatta, hand-detailed with subtle zari.",
     "fabric": "Chanderi silk blend",
     "sizes": ["M", "L", "XL"], "colors": ["Gold", "Wine"],
     "stock_status": "low_stock", "is_best_seller": True, "is_new_arrival": True},
    {"name": "Linen Breeze Western Top", "category": "Tops", "price": 999, "discount_price": None,
     "description": "A minimalist linen top with subtle pleats and a boat neckline.",
     "fabric": "Pure Linen",
     "sizes": ["S", "M", "L"], "colors": ["Ivory", "Blush", "Charcoal"],
     "stock_status": "in_stock", "is_best_seller": False, "is_new_arrival": True},
    {"name": "Mocha Field Denim Jacket", "category": "Western Wear", "price": 1899, "discount_price": 1499,
     "description": "A relaxed-fit denim jacket in a rich mocha wash.",
     "fabric": "Denim (98% cotton, 2% elastane)",
     "sizes": ["S", "M", "L", "XL"], "colors": ["Mocha"],
     "stock_status": "in_stock", "is_best_seller": False, "is_new_arrival": True},
    {"name": "Blush Petal Saree", "category": "Ethnic Wear", "price": 2999, "discount_price": 2299,
     "description": "A gossamer chiffon saree with an all-over petal motif and satin border.",
     "fabric": "Chiffon with satin border",
     "sizes": ["Free Size"], "colors": ["Blush", "Ivory"],
     "stock_status": "in_stock", "is_best_seller": True, "is_new_arrival": False},
]


async def seed_admin():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "StyleAura Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    docs = []
    for p in SAMPLE_PRODUCTS:
        p2 = dict(p)
        p2.setdefault("delivery_note", "Ships within 3-5 business days across India.")
        p2.setdefault("care_instructions", "Hand wash cold. Do not bleach. Dry in shade.")
        p2["created_at"] = datetime.now(timezone.utc).isoformat()
        docs.append(p2)
    await db.products.insert_many(docs)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    await db.products.create_index("created_at")
    await seed_admin()
    await seed_products()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
