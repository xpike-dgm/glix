# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS build

WORKDIR /workspace

# Copy manifests first so dependency installation stays cacheable.
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./tsconfig.base.json
COPY apps/client/package.json apps/client/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/shared/tsconfig.json packages/shared/tsconfig.json

RUN npm ci

COPY packages/shared/src packages/shared/src
COPY apps/client/index.html apps/client/vite.config.ts apps/client/tsconfig.json apps/client/
COPY apps/client/src apps/client/src
COPY apps/client/public apps/client/public

RUN npm run build --workspace @glix/shared \
  && npm run build --workspace @glix/client

FROM nginx:1.27-alpine AS runtime

LABEL org.opencontainers.image.title="Glix client" \
      org.opencontainers.image.description="Glix neon arcade party game PWA"

COPY --from=build /workspace/apps/client/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
