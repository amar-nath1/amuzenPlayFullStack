# amuzenPlay Backend

Minimal Express backend for the amuzenPlay demo.

Features:
- User signup / signin (JWT)
- Create Razorpay orders (server-side) and verify payments
- Simple file-based storage (`server/data.json`)

Setup:

1. Copy `.env.example` to `.env` and fill values (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `JWT_SECRET`).
2. Install dependencies:

```bash
cd server
npm install
```

3. Run server:

```bash
npm run dev
```

API endpoints (brief):
- `POST /api/auth/signup` { name, email, password }
- `POST /api/auth/signin` { email, password }
- `POST /api/orders/order` (auth) { amount, selectedNumber }
- `POST /api/orders/verify` (auth) { razorpay_payment_id, razorpay_order_id, razorpay_signature }
- `POST /api/orders/webhook` (raw) - configure in Razorpay dashboard
- `GET /api/user/cards` (auth) - list purchased cards for user

Notes:
- This is a demo minimal backend. For production use a real DB, proper error handling and security hardening.
