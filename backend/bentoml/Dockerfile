# ── Stage 1: Install system + Python dependencies ──
FROM python:3.12.3-slim AS builder
WORKDIR /app

RUN apt-get update && \
    apt-get install -y gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: Production runner (minimal) ──
FROM python:3.12.3-slim AS runner
WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends libgomp1 curl && \
    rm -rf /var/lib/apt/lists/*

# Copy pre-built Python packages from builder (gcc not needed at runtime)
COPY --from=builder /install /usr/local

COPY . .

EXPOSE 3000
CMD ["bentoml", "serve", "service:DynamicRegressionService", "--production"]