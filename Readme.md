# Meniscus Medical Dashboard

A full-stack, AI-powered medical prediction platform for meniscus surgery outcome analysis. Deployed locally with Cloudflare Tunnel at **https://medical.noboru.tech**.

---

## Overview

This application provides orthopaedic surgeons and researchers with tools to:

- **Predict post-surgery outcomes** (IKDC/Lysholm scores) using trained Neural Network and XGBoost models
- **Upload & manage clinical CSV datasets** for model training
- **Train custom ML models** directly from the web UI
- **Manage users** with role-based access control (admin/user)
- **Visualise prediction results** with interactive SHAP-based feature importance charts

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Tunnel                            │
│                medical.noboru.tech (HTTPS)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                     ┌─────▼─────┐
                     │   Nginx   │  :80
                     └──┬──┬──┬──┘
            ┌───────────┘  │  └───────────┐
            ▼              ▼              ▼
     ┌────────────┐ ┌───────────┐ ┌─────────────┐
     │  Next.js   │ │  FastAPI  │ │   BentoML   │
     │  Frontend  │ │  Backend  │ │  ML Service  │
     │   :3000    │ │   :8000   │ │    :3000     │
     └────────────┘ └─────┬─────┘ └─────────────┘
                          │
                    ┌─────▼─────┐
                    │  SQLite   │
                    └───────────┘
```

| Service | Technology | Container | Port (host) |
|---------|-----------|-----------|-------------|
| Frontend | Next.js 15, React 19, Tailwind CSS | `next` | 3010 |
| Backend API | FastAPI, SQLAlchemy, Alembic | `fastapi` | 8000 |
| ML Service | BentoML, PyTorch, XGBoost, SHAP | `bentoml-service` | 5010 |
| Reverse Proxy | Nginx | `nginx` | 80 |
| Tunnel | Cloudflare `cloudflared` | `cloudflared` | — |

---

## Project Structure

```
Root-Will-Tear/
├── compose.yaml              # Docker Compose (all services)
├── Makefile                   # Dev shortcuts
├── cloudflared/               # Cloudflare tunnel config & credentials
│   ├── config.yml
│   └── credentials.json       # (gitignored)
├── nginx/
│   └── default.conf           # Reverse proxy config
├── backend/
│   ├── dockerfile             # Multi-stage FastAPI image
│   ├── main.py                # FastAPI app entry point
│   ├── requirements.txt
│   ├── alembic.ini            # Database migration config
│   ├── alembic/               # Migration versions
│   ├── app/
│   │   ├── database/          # SQLite session & table creation
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth2.py       #   Login / Register / Logout / Me
│   │   │   ├── crud_user.py   #   User CRUD (admin)
│   │   │   ├── crud_model.py  #   Model CRUD
│   │   │   ├── crud_CSVfile.py#   CSV upload / list / download
│   │   │   ├── validate.py    #   Neural Network train endpoint
│   │   │   ├── validate_xgboost.py # XGBoost train endpoint
│   │   │   └── torch.py       #   Prediction endpoint
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── security/          # JWT & CSRF handlers
│   │   ├── handlers/          # Data cleaning & augmentation logic
│   │   └── seeds/             # Admin user seeder
│   ├── bentoml/
│   │   ├── Dockerfile         # Multi-stage BentoML image
│   │   ├── service.py         # BentoML service (predict, train, manage)
│   │   ├── train_handler.py   # Training pipeline (NN + XGBoost)
│   │   └── requirements.txt
│   └── model_artifacts/       # Saved model weights (.pth)
└── frontend/
    ├── Dockerfile             # Multi-stage Next.js standalone image
    ├── next.config.mjs        # Next.js config (standalone output)
    ├── middleware.ts           # API proxy middleware
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/page.tsx     # Login page
    │   │   └── register/page.tsx  # Registration page
    │   ├── (dashboard)/
    │   │   ├── page.tsx           # Home / Dashboard
    │   │   ├── machine/page.tsx   # Model management (train, list, delete)
    │   │   ├── prediction/page.tsx# Prediction form & results
    │   │   ├── users/page.tsx     # User management (admin)
    │   │   └── tutorial/page.tsx  # How-to guide
    │   ├── actions/auth.ts        # Server actions (login/logout)
    │   └── api/auth/[...nextauth]/route.ts # NextAuth handler
    ├── components/            # Reusable UI components (shadcn/ui)
    ├── context/UserContext.tsx # Global auth context
    └── lib/
        ├── auth.ts            # NextAuth config
        └── axios.ts           # Axios client with credentials
```

---

## API Reference

All API endpoints are served through Nginx at `/api/` and proxied to FastAPI.

### Authentication — `/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/login` | — | Authenticate and receive session cookie |
| POST | `/api/v1/register` | — | Create a new user account |
| POST | `/api/v1/logout` | Cookie | Clear session cookies |
| GET | `/api/v1/me` | Cookie | Get current authenticated user info |

### Users — `/api/v1/users` (Admin only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users` | Admin | List all users |
| GET | `/api/v1/users/{id}` | Admin | Get user by ID |
| PUT | `/api/v1/users/{id}` | Admin | Update user (role, password, status) |
| DELETE | `/api/v1/users/{id}` | Admin | Delete user |

### Models — `/api/v1/model`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/model` | Cookie | List all active models |
| GET | `/api/v1/model/{name}` | Cookie | Get model by name |
| PUT | `/api/v1/model/models/{name}` | Admin | Update model metadata |
| DELETE | `/api/v1/model/{name}` | Admin | Delete model (DB + BentoML store) |

### CSV Data — `/api/v1/csv_files`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/csv_files/upload` | Cookie | Upload & validate a CSV file |
| GET | `/api/v1/csv_files/all` | Cookie | List all uploaded CSV files |
| GET | `/api/v1/csv_files/{id}` | Cookie | Get CSV file details |
| PUT | `/api/v1/csv_files/{id}` | Admin | Update CSV file metadata |
| DELETE | `/api/v1/csv_files/{id}` | Admin | Delete a CSV file |
| GET | `/api/v1/csv_files/download/{id}` | Cookie | Download CSV as file |

### Training — `/api/v1`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/model_train` | Cookie | Train a Neural Network model from CSV |
| POST | `/api/v1/model_train_xg_boost` | Cookie | Train an XGBoost model from CSV |

### Prediction — `/api/v1/nn`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/nn/{model_name}` | Cookie | Run prediction with SHAP explanations |

### BentoML Service — `/ml/` (Internal)

| Endpoint | Description |
|----------|-------------|
| `/ml/predict` | Neural Network inference |
| `/ml/predictxg` | XGBoost inference |
| `/ml/train_model` | Train NN model |
| `/ml/train_model_xg_boost` | Train XGBoost model |
| `/ml/get_all_models` | List all BentoML models |
| `/ml/delete_model` | Delete a model from BentoML store |
| `/ml/healthz` | Health check |

---

## Security

| Feature | Implementation |
|---------|---------------|
| Authentication | HTTP-only session cookies (JWT-signed) |
| CSRF Protection | Per-session CSRF tokens via `fastapi-csrf-protect` |
| Password Rules | Min 8 chars, 1 number, 1 special character |
| Password Hashing | bcrypt |
| CORS | Allowlist-based origins (env-driven) |
| Cookie Domain | Configurable (`.noboru.tech` in production) |
| Proxy Headers | Cloudflare `CF-Connecting-IP` real-IP trust |
| Security Headers | X-Frame-Options, X-Content-Type-Options, XSS-Protection, Referrer-Policy |
| Role-Based Access | `user` vs `admin` — admin-only routes enforce `protected_route` dependency |

---

## Prerequisites

- **Docker** (v20+) and **Docker Compose** (v2+)
- **cloudflared** (Cloudflare Tunnel CLI) — only for tunnel deployment
- For local dev without Docker: Node.js 18+, pnpm, Python 3.12+

---

## Quick Start — Docker (Production)

### 1. Clone and configure environment files

```bash
git clone <repo-url>
cd Root-Will-Tear
```

Create the following `.env` files (see `.env.example` in each directory):

**`backend/.env`**
```env
DATABASE_URL=sqlite:///./data/sql_app.db
SECRET_KEY=<generate-with-python-secrets>
ALGORITHM=HS256
NEXTAUTH_SECRET=<same-as-frontend>
CSRF_SECRET_KEY=<random-secret>
COOKIE_NAME=session_token
CSRF_COOKIE_NAME=csrf_token
COOKIE_DOMAIN=.noboru.tech
ALLOWED_ORIGINS=https://medical.noboru.tech
ENVIRONMENT=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>
BENTOML_HOST=http://bentoml-service:3000/
```

**`backend/bentoml/.env`**
```env
SECRET_KEY=<same-as-backend>
ALGORITHM=HS256
ENVIRONMENT=production
```

**`frontend/.env`**
```env
NEXTAUTH_URL=https://medical.noboru.tech
NEXTAUTH_SECRET=<same-as-backend>
NEXT_PUBLIC_BACKEND_URL=https://medical.noboru.tech
BACKEND_URL=http://fastapi:8000
AUTH_TRUST_HOST=true
```

### 2. Build and start services

```bash
docker compose build --parallel
docker compose up -d
```

### 3. Seed the admin user

```bash
docker exec fastapi python -m app.seeds.seed_admin
```

### 4. Verify

```bash
docker compose ps                          # All containers healthy
curl https://medical.noboru.tech/healthz   # 200 ok
```

---

## Quick Start — Local Dev (Without Docker)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Copy .env.example to .env and configure
make migration    # Run Alembic migrations
make seed         # Seed admin user
make server       # Start FastAPI on :8000
```

### BentoML Service

```bash
cd backend/bentoml
pip install -r requirements.txt
make b2           # Start BentoML on :5010
```

### Frontend

```bash
cd frontend
pnpm install
# Copy .env.example to .env and configure
make client       # Start Next.js dev server on :3000
```

---

## Cloudflare Tunnel Setup

The project uses Cloudflare Tunnel to expose local services at `https://medical.noboru.tech`.

```bash
# One-time setup (already done):
cloudflared tunnel create medical-noboru
cloudflared tunnel route dns medical-noboru medical.noboru.tech

# Credentials are stored in:
# cloudflared/credentials.json  (gitignored)
# cloudflared/config.yml        (ingress rules → nginx:80)
```

The tunnel runs as a Docker container (`cloudflared`) and routes `medical.noboru.tech` → `nginx:80` → individual services.

---

## Nginx Routing

| Path | Target | Behaviour |
|------|--------|-----------|
| `/` | Next.js `next:3000` | Frontend (WebSocket-ready for HMR) |
| `/api/*` | FastAPI `fastapi:8000` | Full path preserved (`/api/v1/...`) |
| `/ml/*` | BentoML `bentoml-service:3000` | Path rewritten (strips `/ml/` prefix) |
| `/healthz` | Nginx | Returns `200 ok` for monitoring |

Max upload size: **50 MB** (for CSV files).

---

## Docker Build Optimisation

All Dockerfiles use **multi-stage builds** for fast rebuilds and small images:

| Image | Stages | Final Size |
|-------|--------|-----------|
| Frontend | `deps` → `builder` → `runner` (standalone) | ~95 MB |
| FastAPI | `builder` → `runner` | ~264 MB |
| BentoML | `builder` → `runner` (no gcc at runtime) | ~3.5 GB (PyTorch) |

- **Dependency layers are cached** — only rebuilds when `requirements.txt` or `pnpm-lock.yaml` changes
- **Next.js standalone mode** — no `node_modules` in production image, 40ms cold start
- **Builder stages** install compilers (gcc, python3-dev) that are not included in the final image

---

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make server` | Start FastAPI dev server (:8000) |
| `make client` | Start Next.js dev server |
| `make b2` | Start BentoML service (:5010, reload mode) |
| `make seed` | Seed admin user into database |
| `make table` | Create database tables |
| `make migration` | Run Alembic migrations |
| `make alembic` | Generate + apply new Alembic migration |
| `make power` | Auto-generate + apply smart migration |

---

## Database

- **Engine**: SQLite (file-based, stored on a persistent Docker volume at `/app/data/sql_app.db`)
- **ORM**: SQLAlchemy 2.0 with `DeclarativeBase`
- **Migrations**: Alembic

### Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (id, username, password hash, role, is_active) |
| `csv_files` | Uploaded dataset metadata (id, length, architecture, timestamp) |
| `csv_data` | Individual data rows from uploaded CSVs (all clinical features) |
| `models` | Trained model registry (name, architecture, loss, bentoml_tag, path) |
| `sents` | Prediction/submission records linking users, models, and CSV data |

---

## ML Features

### Input Features (14 clinical variables)

| Feature | Type | Description |
|---------|------|-------------|
| `sex` | int | Patient sex |
| `age` | int | Patient age |
| `side` | int | Affected knee side |
| `BW` | float | Body weight (kg) |
| `Ht` | float | Height (cm) |
| `IKDC_pre` | float | Pre-operative IKDC score |
| `Lysholm_pre` | float | Pre-operative Lysholm score |
| `Pre_KL_grade` | float | Pre-operative KL grade |
| `MM_extrusion_pre` | float | Meniscus extrusion (pre-op) |
| `MM_gap` | float | Meniscus gap measurement |
| `Degenerative_meniscus` | float | Degenerative status |
| `medial_femoral_condyle` | float | Medial femoral condyle grade |
| `medial_tibial_condyle` | float | Medial tibial condyle grade |
| `lateral_femoral_condyle` | float | Lateral femoral condyle grade |

### Supported Model Architectures

- **Neural Network** — PyTorch fully-connected regression network, trained with SMOGN for imbalanced data handling
- **XGBoost** — Gradient boosted trees, saved/served via BentoML

### Prediction Output

- Predicted IKDC/Lysholm post-operative scores
- SHAP feature importance values for model interpretability

---

## Fixes & Improvements Log

A summary of all production fixes and improvements applied to this project.

### Infrastructure & Deployment

| # | Issue | Root Cause | Fix | Files Changed |
|---|-------|-----------|-----|---------------|
| 1 | **Full Docker Compose deployment** | Project had no unified deployment config | Created 5-service `compose.yaml` (frontend, fastapi, bentoml-service, nginx, cloudflared), nginx reverse proxy, Cloudflare tunnel config | `compose.yaml`, `nginx/default.conf`, `cloudflared/config.yml` |
| 2 | **Multi-stage Docker build optimisation** | Large images, slow builds | Implemented multi-stage Dockerfiles for all 3 services. Frontend 312 MB → 95 MB, startup 340 ms → 40 ms | `frontend/Dockerfile`, `backend/dockerfile`, `backend/bentoml/Dockerfile` |
| 3 | **Database not persistent across container restarts** | `DATABASE_URL=sqlite:///./sql_app.db` wrote to ephemeral container filesystem | Changed to `sqlite:///./data/sql_app.db` mapped to the `backend-data` Docker volume | `backend/.env` |
| 4 | **Host Error after Docker daemon restart** | Container IPs changed but nginx cached stale DNS | Run `docker exec nginx nginx -s reload` after container recreation | `nginx/default.conf` (documented) |
| 5 | **Disk space exhaustion during builds** | Docker build cache grew to 20 GB+ | Periodic `docker system prune -af --volumes` needed; documented in Troubleshooting | — |

### Security

| # | Issue | Root Cause | Fix | Files Changed |
|---|-------|-----------|-----|---------------|
| 6 | **Hardcoded secrets & debug mode in production** | Default `SECRET_KEY` and `debug=True` | Environment-driven secrets, `debug=False`, production-safe defaults | `backend/main.py`, `backend/.env` |
| 7 | **CORS misconfiguration** | Wildcard `*` origin or missing allowed origins | Allowlist-based CORS from `ALLOWED_ORIGINS` env variable | `backend/main.py` |
| 8 | **Insecure cookie settings** | Cookies lacked `domain`, `secure`, `samesite` flags | Configurable `COOKIE_DOMAIN`, `secure=True` in production, `samesite=lax` | `backend/app/routes/auth2.py` |
| 9 | **JWT timezone issues** | Naive `datetime.utcnow()` caused token expiry drift | Switched to timezone-aware `datetime.now(timezone.utc)` | `backend/app/security/jwt_handler.py` |

### API & Routing

| # | Issue | Root Cause | Fix | Files Changed |
|---|-------|-----------|-----|---------------|
| 10 | **"Failed to fetch models" on Manage Model page** | FastAPI 307 redirect on trailing slash generated `http://` URLs behind HTTPS proxy | Added dual route decorators `@router.get("")` + `@router.get("/")` and `--proxy-headers` to uvicorn | `backend/app/routes/crud_model.py`, `backend/app/routes/crud_user.py` |

### ML Training Pipeline

| # | Issue | Root Cause | Fix | Files Changed |
|---|-------|-----------|-----|---------------|
| 11 | **"Failed to train model" — BentoML tuple returns** | `service.py` returned Python tuples `(dict, status_code)` which BentoML serialised as JSON arrays `[dict, code]` with HTTP 200; FastAPI then crashed with `list indices must be integers or slices, not str` | Removed all 16 tuple-style returns; each endpoint now returns a plain dict | `backend/bentoml/service.py` |
| 12 | **Training crash on CSVs with missing columns** | `df.drop(columns=DROP_COLUMNS)` raised `KeyError` when CSV lacked some expected columns | Changed to `df.drop(columns=[c for c in DROP_COLUMNS if c in df.columns], errors='ignore')` in both NN and XGBoost pipelines | `backend/bentoml/train_handler.py` |
| 13 | **Training timeout (30 s too short)** | Large datasets or slow hardware exceeded the 30 s httpx + BentoML traffic timeout | Increased to 600 s in httpx clients and BentoML `traffic.timeout` config | `backend/app/routes/validate.py`, `backend/app/routes/validate_xgboost.py`, `backend/bentoml/service.py` |
| 14 | **BentoML error responses not handled** | FastAPI blindly accessed `response["bentoml_tag"]` without checking for error payloads | Added type checking: if BentoML returns a list (legacy tuple) or a dict with `"error"` key, return the error to the client | `backend/app/routes/validate.py`, `backend/app/routes/validate_xgboost.py` |
| 15 | **Training fails with names like "Aj.woon" or "For Aj.woon"** | BentoML tags require lowercase alphanumeric + `_-.` and must start/end with alphanumeric; spaces and uppercase are invalid | Added `sanitize_tag_name()` helper: lowercases, replaces spaces with `_`, strips invalid chars via regex `[^a-z0-9_\-.]` | `backend/bentoml/service.py` |

### Prediction Pipeline

| # | Issue | Root Cause | Fix | Files Changed |
|---|-------|-----------|-----|---------------|
| 16 | **Prediction returns 404 — model name trailing whitespace** | Training form submitted names with trailing spaces (e.g. `"Demo for Ar.woon "`) stored in DB, but prediction URLs sent names without trailing space → exact `Model.name` match failed | Added `name.strip()` / `model_name.strip()` in training and prediction endpoints | `backend/app/routes/validate.py`, `backend/app/routes/validate_xgboost.py`, `backend/app/routes/torch.py` |
| 17 | **Prediction fails: "StandardScaler expecting 9 features, got 14"** | Training drops columns (BMI, lateral tibial condyle, etc.) before fitting the scaler, so model expects 9 features. Prediction always sent all 14 features | Training now returns and saves `feature_columns` in BentoML `custom_objects`. Prediction loads them and extracts only the matching features | `backend/bentoml/train_handler.py`, `backend/bentoml/service.py` |

### Authentication

| # | Issue | Root Cause | Fix | Files Changed |
|---|-------|-----------|-----|---------------|
| 18 | **"Invalid credentials" for admin login** | Database was empty — no users seeded after container recreation wiped ephemeral SQLite | Moved DB to persistent volume (fix #3) and re-ran `python -m app.seeds.seed_admin` | `backend/.env`, `backend/app/seeds/seed_admin.py` |

### Frontend

| # | Issue | Root Cause | Fix | Files Changed |
|---|-------|-----------|-----|---------------|
| 19 | **`next.config.mjs` overriding `next.config.ts`** | Both config files existed; `.mjs` took precedence and lacked `output: 'standalone'` | Deleted `next.config.ts`, consolidated all config into `next.config.mjs` with standalone output | `frontend/next.config.mjs` |
| 20 | **Frontend environment not pointing to internal services** | `BACKEND_URL` defaulted to localhost | Set `BACKEND_URL=http://fastapi:8000` for server-side calls within Docker network | `frontend/.env` |

---

## Troubleshooting

### Docker build uses stale cache

If `docker compose build` doesn't pick up code changes:

```bash
# Force a no-cache rebuild for a specific service
docker build --no-cache --target runner -t root-will-tear-bentoml-service:latest ./backend/bentoml
docker compose up -d --force-recreate bentoml-service

# Verify the fix is deployed inside the container
docker exec bentoml-service grep -c 'sanitize_tag_name' /app/service.py
```

### "Host Error" on medical.noboru.tech

After restarting Docker or recreating containers, nginx may cache stale upstream IPs:

```bash
docker exec nginx nginx -s reload
```

### Admin user missing after container recreation

The SQLite database is persisted on the `backend-data` volume at `/app/data/sql_app.db`. If the volume is pruned, re-seed:

```bash
docker exec fastapi python -m app.seeds.seed_admin
```

### Disk space exhaustion during Docker builds

Docker build cache can grow to 20 GB+. Free it with:

```bash
docker system prune -af --volumes
docker compose build --parallel
docker compose up -d
```

### Training fails with small datasets

StratifiedKFold cross-validation requires sufficient samples per class. If your CSV has fewer than ~20 rows, training may fail with:

```
n_splits=4 cannot be greater than the number of members in each class
```

Use a larger dataset or reduce `n_splits` in the training handler.

### Model name rejected by BentoML

BentoML tags must be lowercase alphanumeric with `_`, `-`, or `.` only. Names with spaces or uppercase (e.g. "For Aj.woon") are automatically sanitised to valid tags (e.g. `for_aj.woon`). If training still fails, check the model name contains at least one alphanumeric character.

---

## Known Limitations

- **SQLite** is not suitable for high-concurrency production workloads; consider PostgreSQL for multi-user deployments
- **BentoML image is ~3.5 GB** due to PyTorch CPU; GPU support would require `nvidia/cuda` base image
- **No automated tests** — all validation is manual via the web UI and API calls
- **Single-node deployment** — not horizontally scalable without container orchestration (Kubernetes, etc.)
- **CSV column names must match expected features** — the training pipeline silently drops missing columns but requires the target column (`IKDC 2 Y`) to be present
- **Models trained before fix #17 lack `feature_columns` metadata** — prediction falls back to sending all 14 features, which will fail if the model's scaler expects fewer. Retrain the model to resolve

---

## Contributing

Made by Song.

## License

This project is licensed under the Chula License.
