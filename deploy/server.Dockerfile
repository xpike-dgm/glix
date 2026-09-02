# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build

WORKDIR /workspace

# The repository is a npm-workspaces monorepo; keep the lockfile authoritative.
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/shared/tsconfig.json packages/shared/tsconfig.json

RUN npm ci

COPY packages/shared/src packages/shared/src
COPY apps/server/src apps/server/src
COPY apps/server/tsconfig.json apps/server/tsconfig.json

RUN npm run build --workspace @glix/shared \
  && npm run build --workspace @glix/server

FROM node:22-alpine AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8787

WORKDIR /app

# Install only runtime dependencies. The shared workspace is copied with its
# compiled output so the server can resolve @glix/shared without source files.
COPY package.json package-lock.json ./
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN npm ci --omit=dev \
  && npm cache clean --force

COPY --from=build /workspace/apps/server/dist apps/server/dist
COPY --from=build /workspace/packages/shared/dist packages/shared/dist

USER node

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD wget -qO- http://127.0.0.1:8787/health >/dev/null || exit 1

CMD ["node", "apps/server/dist/index.js"]
