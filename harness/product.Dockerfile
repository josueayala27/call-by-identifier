# syntax=docker/dockerfile:1
# Purpose: the product's one image for the tests, built from the checkout; its dependencies installed here, once per lockfile, never at a run
FROM node:22-bookworm-slim
ENV CI=1 COREPACK_ENABLE_DOWNLOAD_PROMPT=0 WRANGLER_SEND_METRICS=false NO_UPDATE_NOTIFIER=1
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=cbi-pnpm-store,target=/pnpm-store \
    corepack install && pnpm install --frozen-lockfile --store-dir /pnpm-store --package-import-method copy
COPY . .
EXPOSE 8787
CMD ["pnpm", "run", "--silent", "entry"]
