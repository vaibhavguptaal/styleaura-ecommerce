from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import re
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, HttpUrl, field_validator, model_validator

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ['JWT_SECRET']
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
CORS_ORIGINS_RAW = os.environ.get("CORS_ORIGINS", "*")
LOGIN_MAX_ATTEMPTS = 5
LOGIN_LOCKOUT_MIN = 15


# ---------- auth helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(hours=8)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "type": "refresh",
               "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
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


# ---------- models ----------
ALLOWED_CATEGORIES = {"Kurtis", "Dresses", "Tops", "Co-ord Sets", "Ethnic Wear", "Western Wear", "Accessories"}
ALLOWED_STOCK = {"in_stock", "low_stock", "out_of_stock"}
ALLOWED_ENQ_STATUS = {"new", "contacted", "closed"}
URL_RE = re.compile(r"^https?://[^\s<>]+$")


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    category: str
    description: str = Field(default="", max_length=4000)
    price: float = Field(ge=0)
    discount_price: Optional[float] = Field(default=None, ge=0)
    thumbnail_url: Optional[str] = None
    image_urls: List[str] = Field(default_factory=list)
    fabric: str = Field(default="", max_length=200)
    sku: Optional[str] = Field(default=None, max_length=64)
    stock_quantity: int = Field(default=0, ge=0)
    sizes: List[str] = Field(default_factory=list)
    colors: List[str] = Field(default_factory=list)
    stock_status: str = "in_stock"
    is_best_seller: bool = False
    is_new_arrival: bool = False
    is_active: bool = True
    delivery_note: str = "Ships within 3-5 business days across India."
    care_instructions: str = "Hand wash cold. Do not bleach. Dry in shade."

    @field_validator("category")
    @classmethod
    def _cat(cls, v):
        if v not in ALLOWED_CATEGORIES:
            raise ValueError(f"Invalid category. Allowed: {sorted(ALLOWED_CATEGORIES)}")
        return v

    @field_validator("stock_status")
    @classmethod
    def _stock(cls, v):
        if v not in ALLOWED_STOCK:
            raise ValueError(f"Invalid stock_status. Allowed: {sorted(ALLOWED_STOCK)}")
        return v

    @field_validator("thumbnail_url")
    @classmethod
    def _thumb(cls, v):
        if v in (None, ""):
            return None
        if not URL_RE.match(v):
            raise ValueError("thumbnail_url must be http(s) URL")
        return v

    @field_validator("image_urls")
    @classmethod
    def _imgs(cls, v):
        for u in v:
            if not URL_RE.match(u):
                raise ValueError("image_urls entries must be http(s) URLs")
        return v

    @model_validator(mode="after")
    def _discount_lte_price(self):
        if self.discount_price is not None and self.discount_price > self.price:
            raise ValueError("discount_price cannot exceed price")
        return self


class EnquiryIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(min_length=6, max_length=20)
    product_name: Optional[str] = Field(default="", max_length=200)
    size: Optional[str] = Field(default="", max_length=40)
    message: str = Field(default="", max_length=2000)


class EnquiryStatusIn(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def _st(cls, v):
        if v not in ALLOWED_ENQ_STATUS:
            raise ValueError(f"Invalid status. Allowed: {sorted(ALLOWED_ENQ_STATUS)}")
        return v


# ---------- serialization ----------
def _p(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "category": doc["category"],
        "description": doc.get("description", ""),
        "price": doc["price"],
        "discount_price": doc.get("discount_price"),
        "thumbnail_url": doc.get("thumbnail_url"),
        "image_urls": doc.get("image_urls", []),
        "fabric": doc.get("fabric", ""),
        "sku": doc.get("sku"),
        "stock_quantity": doc.get("stock_quantity", 0),
        "sizes": doc.get("sizes", []),
        "colors": doc.get("colors", []),
        "stock_status": doc.get("stock_status", "in_stock"),
        "is_best_seller": doc.get("is_best_seller", False),
        "is_new_arrival": doc.get("is_new_arrival", False),
        "is_active": doc.get("is_active", True),
        "delivery_note": doc.get("delivery_note", ""),
        "care_instructions": doc.get("care_instructions", ""),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


# ---------- app ----------
app = FastAPI(title="StyleAura Fashion API", version="1.1")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "StyleAura Fashion API", "version": "1.1"}


@api_router.get("/health")
async def health():
    try:
        await db.command("ping")
        db_ok = True
    except Exception:
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "db": db_ok,
            "time": datetime.now(timezone.utc).isoformat()}


# ---------- auth ----------
async def _record_failed(identifier: str):
    await db.login_attempts.update_one(
        {"identifier": identifier},
        {"$inc": {"count": 1}, "$set": {"last": datetime.now(timezone.utc)}},
        upsert=True,
    )


async def _is_locked(identifier: str) -> bool:
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if not doc:
        return False
    if doc.get("count", 0) < LOGIN_MAX_ATTEMPTS:
        return False
    last = doc.get("last")
    if not last:
        return False
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) - last < timedelta(minutes=LOGIN_LOCKOUT_MIN)


@api_router.post("/auth/login")
async def login(payload: LoginPayload, request: Request, response: Response):
    email = payload.email.lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    if await _is_locked(identifier):
        raise HTTPException(status_code=429, detail="Too many attempts. Try again later.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await _record_failed(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    user_id = str(user["_id"])
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    response.set_cookie("access_token", access, httponly=True, secure=COOKIE_SECURE,
                        samesite="lax", max_age=8 * 3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=COOKIE_SECURE,
                        samesite="lax", max_age=7 * 24 * 3600, path="/")
    return {"id": user_id, "email": email, "name": user.get("name", "Admin"),
            "role": user.get("role", "admin")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"],
            "name": user.get("name", "Admin"), "role": user.get("role", "admin")}


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    tok = request.cookies.get("refresh_token")
    if not tok:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(tok, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")
        access = create_access_token(payload["sub"], payload.get("email", ""))
        response.set_cookie("access_token", access, httponly=True, secure=COOKIE_SECURE,
                            samesite="lax", max_age=8 * 3600, path="/")
        return {"message": "refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------- products ----------
@api_router.get("/products")
async def list_products(
    category: Optional[str] = None,
    search: Optional[str] = Query(None, max_length=100),
    size: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    best_seller: Optional[bool] = None,
    new_arrival: Optional[bool] = None,
    featured: Optional[bool] = None,
    active: Optional[bool] = True,
    sort: Optional[str] = Query("new"),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=60),
):
    query: dict = {}
    if active is not None:
        query["is_active"] = active
    if category and category.lower() != "all":
        query["category"] = category
    if search:
        # escape regex special chars to avoid ReDoS / injection
        query["name"] = {"$regex": re.escape(search), "$options": "i"}
    if size:
        query["sizes"] = size
    if best_seller:
        query["is_best_seller"] = True
    if new_arrival:
        query["is_new_arrival"] = True
    if featured:
        query["$or"] = [{"is_best_seller": True}, {"is_new_arrival": True}]
    pr: dict = {}
    if min_price is not None:
        pr["$gte"] = min_price
    if max_price is not None:
        pr["$lte"] = max_price
    if pr:
        query["price"] = pr

    total = await db.products.count_documents(query)
    cursor = db.products.find(query)
    if sort == "price_asc":
        cursor = cursor.sort("price", 1)
    elif sort == "price_desc":
        cursor = cursor.sort("price", -1)
    elif sort == "best_sellers":
        cursor = cursor.sort([("is_best_seller", -1), ("created_at", -1)])
    else:
        cursor = cursor.sort("created_at", -1)
    docs = await cursor.skip((page - 1) * page_size).limit(page_size).to_list(page_size)
    return {"items": [_p(d) for d in docs], "total": total,
            "page": page, "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size)}


@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = await db.products.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return _p(doc)


@api_router.post("/products")
async def create_product(payload: ProductIn, _a: dict = Depends(require_admin)):
    doc = payload.model_dump()
    now = datetime.now(timezone.utc).isoformat()
    doc["created_at"] = now
    doc["updated_at"] = now
    r = await db.products.insert_one(doc)
    doc["_id"] = r.inserted_id
    return _p(doc)


@api_router.put("/products/{product_id}")
async def update_product(product_id: str, payload: ProductIn, _a: dict = Depends(require_admin)):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")
    updates = payload.model_dump()
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    r = await db.products.update_one({"_id": oid}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = await db.products.find_one({"_id": oid})
    return _p(doc)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, _a: dict = Depends(require_admin)):
    try:
        oid = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Product not found")
    r = await db.products.delete_one({"_id": oid})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Deleted"}


# ---------- enquiries ----------
@api_router.post("/enquiries")
async def create_enquiry(payload: EnquiryIn, request: Request):
    ip = request.client.host if request.client else "unknown"
    # simple per-IP rate limit: max 8/hour
    since = datetime.now(timezone.utc) - timedelta(hours=1)
    recent = await db.enquiries.count_documents({"ip": ip, "created_at": {"$gte": since.isoformat()}})
    if recent >= 8:
        raise HTTPException(status_code=429, detail="Too many enquiries, please try again later")
    doc = payload.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "new"
    doc["ip"] = ip
    r = await db.enquiries.insert_one(doc)
    return {"id": str(r.inserted_id), "message": "Enquiry submitted"}


@api_router.get("/enquiries")
async def list_enquiries(status: Optional[str] = None, _a: dict = Depends(require_admin),
                         page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200)):
    q = {}
    if status and status in ALLOWED_ENQ_STATUS:
        q["status"] = status
    total = await db.enquiries.count_documents(q)
    docs = await db.enquiries.find(q).sort("created_at", -1)\
        .skip((page - 1) * page_size).limit(page_size).to_list(page_size)
    return {
        "items": [{
            "id": str(d["_id"]), "name": d.get("name", ""), "phone": d.get("phone", ""),
            "product_name": d.get("product_name", ""), "size": d.get("size", ""),
            "message": d.get("message", ""), "status": d.get("status", "new"),
            "created_at": d.get("created_at", ""),
        } for d in docs],
        "total": total, "page": page, "page_size": page_size,
    }


@api_router.patch("/enquiries/{eid}")
async def update_enquiry(eid: str, payload: EnquiryStatusIn, _a: dict = Depends(require_admin)):
    try:
        oid = ObjectId(eid)
    except Exception:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    r = await db.enquiries.update_one({"_id": oid}, {"$set": {"status": payload.status}})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"message": "Updated", "status": payload.status}


# ---------- startup ----------
SAMPLE_PRODUCTS = [
    {"name": "Rose Bloom Anarkali Kurti", "category": "Kurtis", "price": 1899, "discount_price": 1299,
     "description": "A flowing anarkali silhouette adorned with delicate rose motifs.", "fabric": "Rayon blend",
     "sku": "SA-KUR-001", "stock_quantity": 12,
     "sizes": ["S", "M", "L", "XL"], "colors": ["Blush", "Ivory", "Terracotta"],
     "is_best_seller": True, "is_new_arrival": True},
    {"name": "Ivory Whisper Co-ord Set", "category": "Co-ord Sets", "price": 2499, "discount_price": 1899,
     "description": "Relaxed cropped top with wide leg trousers.", "fabric": "Lightweight muslin",
     "sku": "SA-COR-002", "stock_quantity": 8,
     "sizes": ["S", "M", "L"], "colors": ["Ivory", "Sage"],
     "is_best_seller": True, "is_new_arrival": False},
    {"name": "Terracotta Twirl Dress", "category": "Dresses", "price": 2199,
     "description": "Midi dress with a flattering wrap fit.", "fabric": "Crepe with satin trim",
     "sku": "SA-DRS-003", "stock_quantity": 15,
     "sizes": ["S", "M", "L", "XL"], "colors": ["Terracotta", "Charcoal"], "is_new_arrival": True},
    {"name": "Sage Meadow Cotton Kurti", "category": "Kurtis", "price": 1299, "discount_price": 999,
     "description": "Everyday cotton kurti with hand-block inspired prints.", "fabric": "100% Pure Cotton",
     "sku": "SA-KUR-004", "stock_quantity": 20,
     "sizes": ["S", "M", "L", "XL", "XXL"], "colors": ["Sage", "Mustard", "Ivory"], "is_best_seller": True},
    {"name": "Golden Hour Ethnic Set", "category": "Ethnic Wear", "price": 3499, "discount_price": 2799,
     "description": "Three-piece ethnic ensemble with dupatta.", "fabric": "Chanderi silk blend",
     "sku": "SA-ETH-005", "stock_quantity": 4, "stock_status": "low_stock",
     "sizes": ["M", "L", "XL"], "colors": ["Gold", "Wine"],
     "is_best_seller": True, "is_new_arrival": True},
    {"name": "Linen Breeze Western Top", "category": "Tops", "price": 999,
     "description": "Minimalist linen top with pleats and boat neckline.", "fabric": "Pure Linen",
     "sku": "SA-TOP-006", "stock_quantity": 18,
     "sizes": ["S", "M", "L"], "colors": ["Ivory", "Blush", "Charcoal"], "is_new_arrival": True},
    {"name": "Mocha Field Denim Jacket", "category": "Western Wear", "price": 1899, "discount_price": 1499,
     "description": "Relaxed-fit denim jacket in a rich mocha wash.", "fabric": "Denim",
     "sku": "SA-WST-007", "stock_quantity": 6,
     "sizes": ["S", "M", "L", "XL"], "colors": ["Mocha"], "is_new_arrival": True},
    {"name": "Blush Petal Saree", "category": "Ethnic Wear", "price": 2999, "discount_price": 2299,
     "description": "Chiffon saree with all-over petal motif.", "fabric": "Chiffon with satin border",
     "sku": "SA-ETH-008", "stock_quantity": 10,
     "sizes": ["Free Size"], "colors": ["Blush", "Ivory"], "is_best_seller": True},
]


async def seed_admin():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password),
                                   "name": "StyleAura Admin", "role": "admin",
                                   "created_at": datetime.now(timezone.utc).isoformat()})
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})


async def seed_products():
    if os.environ.get("SEED_PRODUCTS", "true").lower() != "true":
        return
    if await db.products.count_documents({}) > 0:
        return
    now = datetime.now(timezone.utc).isoformat()
    docs = []
    for p in SAMPLE_PRODUCTS:
        d = dict(p)
        d.setdefault("delivery_note", "Ships within 3-5 business days across India.")
        d.setdefault("care_instructions", "Hand wash cold. Do not bleach. Dry in shade.")
        d.setdefault("is_active", True)
        d.setdefault("thumbnail_url", None)
        d.setdefault("image_urls", [])
        d["created_at"] = now
        d["updated_at"] = now
        docs.append(d)
    await db.products.insert_many(docs)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("category")
    await db.products.create_index("created_at")
    await db.enquiries.create_index("created_at")
    await seed_admin()
    await seed_products()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# generic error handler for unexpected exceptions -> JSON
@app.exception_handler(Exception)
async def any_error(_req, exc):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    logging.exception("Unhandled error")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS_RAW.split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
