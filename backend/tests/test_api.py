"""Lightweight API tests. Assumes backend server is running on localhost:8001."""
import os
import requests

BASE = os.environ.get("TEST_BASE_URL", "http://localhost:8001/api")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@styleaura.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")


def test_health():
    r = requests.get(f"{BASE}/health", timeout=5)
    assert r.status_code == 200
    body = r.json()
    assert body["status"] in ("ok", "degraded")
    assert "db" in body


def test_products_list_paginated():
    r = requests.get(f"{BASE}/products?page=1&page_size=5", timeout=5)
    assert r.status_code == 200
    body = r.json()
    assert "items" in body and "total" in body and "page" in body
    assert len(body["items"]) <= 5


def test_product_detail_404():
    r = requests.get(f"{BASE}/products/nonexistent_id", timeout=5)
    assert r.status_code == 404


def test_create_product_requires_auth():
    r = requests.post(f"{BASE}/products", json={"name": "X", "category": "Kurtis", "price": 10}, timeout=5)
    assert r.status_code in (401, 403)


def test_login_wrong_password():
    r = requests.post(f"{BASE}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": "definitely-wrong"}, timeout=5)
    assert r.status_code == 401


def test_login_success_and_admin_flow():
    s = requests.Session()
    r = s.post(f"{BASE}/auth/login",
               json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=5)
    assert r.status_code == 200
    me = s.get(f"{BASE}/auth/me", timeout=5).json()
    assert me["email"] == ADMIN_EMAIL

    # invalid category rejected
    bad = s.post(f"{BASE}/products",
                 json={"name": "Bad", "category": "Not-A-Category", "price": 10}, timeout=5)
    assert bad.status_code == 422

    # discount > price rejected
    bad2 = s.post(f"{BASE}/products",
                  json={"name": "Bad2", "category": "Kurtis", "price": 100,
                        "discount_price": 200}, timeout=5)
    assert bad2.status_code == 422


def test_create_enquiry_public():
    r = requests.post(f"{BASE}/enquiries",
                      json={"name": "Test", "phone": "9999999999", "message": "hi"}, timeout=5)
    assert r.status_code == 200
    assert "id" in r.json()
