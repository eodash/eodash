# Multi-stage Dockerfile for @eodash/mcp-server
# Build context: repository root (.)

# Stage 1: Build MCP bundle and pre-generate metadata
FROM node:26-alpine AS builder

WORKDIR /app

# Copy root and workspace manifests
COPY package.json package-lock.json ./
COPY packages/mcp/package.json ./packages/mcp/
COPY packages/stac/package.json ./packages/stac/

# Install full dependencies for building (ignore root prepare script before sources exist)
RUN npm ci --ignore-scripts --prefer-offline --no-audit

# Copy full source tree required for bundling (@eodash/stac, core, widgets, templates)
COPY . .

# Build MCP server (generates metadata, inlines @eodash/stac, bundles via Vite)
RUN npm run mcp:build

# Stage 2: Install production dependencies
FROM node:26-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/mcp/package.json ./packages/mcp/
COPY packages/stac/package.json ./packages/stac/

RUN npm ci --omit=dev --ignore-scripts --prefer-offline --no-audit

# Stage 3: Minimal hardened runtime image
FROM node:26-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

# Copy production node_modules
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=prod-deps /app/packages/mcp/node_modules ./packages/mcp/node_modules

# Copy package manifests and built artifacts
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/packages/mcp/package.json ./packages/mcp/package.json
COPY --chown=node:node --from=builder /app/packages/mcp/dist ./packages/mcp/dist
COPY --chown=node:node --from=builder /app/packages/mcp/data ./packages/mcp/data
COPY --chown=node:node --from=builder /app/packages/mcp/templates ./packages/mcp/templates

WORKDIR /app/packages/mcp

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

ENTRYPOINT ["node", "dist/index.js"]
