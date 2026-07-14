# StyleAura — Production Go-Live Checklist

Only tasks that must be completed **before** launching to real customers.

## Domain & Hosting
- [ ] Purchase real domain and configure DNS
- [ ] Deploy backend (FastAPI) — Fly.io / Railway / Render / DigitalOcean / etc.
- [ ] Deploy frontend (React build) — Vercel / Netlify / Cloudflare Pages / etc.
- [ ] Enable HTTPS on both frontend and backend (Let's Encrypt or platform-provided)

## Environment Variables (production values)
- [ ] `MONGO_URL` — real MongoDB Atlas / self-hosted URI
- [ ] `DB_NAME` — production DB name
- [ ] `JWT_SECRET` — freshly generated 64-char hex
- [ ] `ADMIN_EMAIL` + `ADMIN_PASSWORD` — strong unique credentials
- [ ] `COOKIE_SECURE=true`
- [ ] `CORS_ORIGINS` — set to the exact production frontend origin (no wildcards)
- [ ] `SEED_PRODUCTS=false` after first prod boot
- [ ] Frontend `REACT_APP_BACKEND_URL` — https URL of the deployed backend
- [ ] Frontend `REACT_APP_WHATSAPP_NUMBER` — real business number
- [ ] Frontend `REACT_APP_INSTAGRAM_HANDLE`, `REACT_APP_CONTACT_EMAIL` — real values

## Content
- [ ] Replace demo products with real inventory (via admin dashboard)
- [ ] Upload real product images (host on Cloudinary / S3 / any CDN, paste URLs)
- [ ] Update About page copy with real story
- [ ] Update Contact page with real address, email, WhatsApp number
- [ ] Review and adapt policy pages (Shipping / Returns / Privacy / Terms) to actual practice
- [ ] Update Instagram handle and social links in Footer

## Security
- [ ] Rotate `JWT_SECRET` and admin password
- [ ] Force HTTPS everywhere; set `COOKIE_SECURE=true`
- [ ] Restrict CORS to production origin only
- [ ] Review admin login lockout thresholds
- [ ] Enable a WAF / rate-limiting layer at the platform level

## Optional Add-ons (only if needed)
- [ ] Email service (Resend / SendGrid) for admin enquiry notifications
- [ ] Cloud image storage (Cloudinary / S3) if uploads instead of URLs are needed
- [ ] Payment gateway (Razorpay / Stripe) — requires cart + checkout flow
- [ ] Shipping provider integration (Delhivery / Shiprocket)
- [ ] Analytics (Plausible / GA4)
- [ ] Error monitoring (Sentry)
- [ ] Uptime monitoring (UptimeRobot / Better Uptime)

## Backup & Recovery
- [ ] Enable automated MongoDB backups
- [ ] Document restore procedure

## SEO
- [ ] Add real `<title>` and `<meta description>` per page (basics already in place)
- [ ] Submit sitemap to Google Search Console
- [ ] Set robots policy appropriately (currently permissive for dev)

## Legal
- [ ] Review policy pages with a professional if needed
- [ ] Add GST / business registration details to Footer if applicable
