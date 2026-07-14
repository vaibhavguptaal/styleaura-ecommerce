# StyleAura Fashion

A mobile-first clothing catalogue for a small Indian women's fashion boutique. Customers browse products and place orders via WhatsApp; the owner manages products and enquiries through a lightweight admin dashboard.

## Tech Stack
- Backend: FastAPI, MongoDB (Motor), JWT auth (cookies), Pydantic v2
- Frontend: React 19, React Router 7, TailwindCSS, shadcn/ui, sonner (toasts)
- Deployment: any Node + Python + MongoDB host (not deployed yet)

## Folder Structure
```
/app
├── backend/            FastAPI app
│   ├── server.py       All routes, models, seed
│   ├── requirements.txt
│   ├── .env            (git-ignored)
│   └── .env.example
├── frontend/           React app
│   ├── src/
│   │   ├── App.js      Router + providers
│   │   ├── components/ Navbar, Footer, ProductCard, Layout, WhatsAppFloat, ProductPlaceholder
│   │   ├── context/    AuthContext, WishlistContext
│   │   ├── data/       categories.js
│   │   ├── lib/        api.js, whatsapp.js
│   │   └── pages/      Home, Shop, ProductDetail, Categories, NewArrivals, BestSellers,
│   │                   About, Contact, Wishlist, Policy, NotFound, AdminLogin, AdminDashboard
│   ├── package.json
│   ├── .env            (git-ignored)
│   └── .env.example
├── PRODUCTION_CHECKLIST.md
└── README.md
```

## Local Setup

### Prerequisites
- Python 3.10+, Node 18+, MongoDB running locally on port 27017

### Backend
```bash
cd backend
cp .env.example .env       # then edit values
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
cp .env.example .env       # then edit values
yarn install
yarn start
```

Frontend runs on http://localhost:3000, backend on http://localhost:8001. All API routes are under `/api`.

## Environment Variables

### Backend (`backend/.env`)
| Key | Purpose |
| --- | --- |
| `MONGO_URL` | MongoDB connection URI |
| `DB_NAME` | Database name |
| `CORS_ORIGINS` | Comma-separated allowed origins (`http://localhost:3000` for dev) |
| `COOKIE_SECURE` | `true` in production (HTTPS only), `false` in dev |
| `JWT_SECRET` | Random hex string for signing tokens |
| `ADMIN_EMAIL` | Admin login email (seeded on startup) |
| `ADMIN_PASSWORD` | Admin password (seeded on startup) |
| `SEED_PRODUCTS` | `true` to seed demo products when DB is empty |

### Frontend (`frontend/.env`)
| Key | Purpose |
| --- | --- |
| `REACT_APP_BACKEND_URL` | Base URL of the backend (no trailing `/api`) |
| `REACT_APP_BRAND_NAME` | Displayed brand name |
| `REACT_APP_WHATSAPP_NUMBER` | WhatsApp business number (country code + number, no `+`) |
| `REACT_APP_INSTAGRAM_HANDLE` | Instagram handle without `@` |
| `REACT_APP_CONTACT_EMAIL` | Public contact email |
| `REACT_APP_CURRENCY` | Currency code (default `INR`) |

## Admin Access
- Admin is auto-seeded on backend startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Login at `/admin/login`.
- Dashboard at `/admin` — full product CRUD and enquiry management with status workflow (`new` → `contacted` → `closed`).

## API Highlights
- `GET /api/health` — health probe (DB status + timestamp)
- `GET /api/products?category=&search=&size=&min_price=&max_price=&best_seller=&new_arrival=&sort=&page=&page_size=` — paginated listing
- `GET /api/products/{id}`
- `POST /api/products` / `PUT /api/products/{id}` / `DELETE /api/products/{id}` — admin only
- `POST /api/auth/login` / `POST /api/auth/logout` / `GET /api/auth/me` / `POST /api/auth/refresh`
- `POST /api/enquiries` (public) / `GET /api/enquiries` (admin) / `PATCH /api/enquiries/{id}` (admin, status update)

## Tests
```bash
# backend
cd backend && python -m pytest tests/ -q

# frontend
cd frontend && yarn test --watchAll=false

# production build (smoke)
cd frontend && yarn build
```

## Future Deployment
See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for the exhaustive go-live checklist.

## What is NOT included (intentional)
- Payment gateway, checkout / cart flow, customer accounts, customer order history
- Shipping-provider integration, SMS/OTP, email service
- Cloud image storage (Cloudinary / S3) — images are URL-based for now
- Advanced analytics, recommendation engine, mobile app
