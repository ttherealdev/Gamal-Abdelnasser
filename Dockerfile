# syntax=docker/dockerfile:1

FROM oven/bun:1-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
# NOTE: package.json's postinstall runs `prisma generate`, but prisma/schema.prisma
# isn't copied into this stage — only package.json/bun.lock are, at this point.
# Running it here would fail the build. The builder stage below runs
# `bunx prisma generate` explicitly once the real schema is present.
RUN bun install --frozen-lockfile --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NOTE: real DATABASE_URL/BETTER_AUTH_* only exist at container runtime
# (injected by Dokploy/compose), not during this build step — env.ts's
# createEnv() would otherwise throw immediately on missing required vars.
ENV SKIP_ENV_VALIDATION=1
RUN bunx prisma generate
RUN bun run build

# NOTE: dedicated migration image — runs as a short-lived one-off Compose
# service, never as part of the app's own boot sequence. It keeps the FULL
# node_modules from the builder stage (not the standalone-pruned copy the
# runner uses below), because the `prisma` CLI needs its own transitive
# dependency tree (schema-engine, internals, fetch-engine, ...) that Next's
# standalone tracing deliberately strips out since the running app itself
# never imports the CLI. Cherry-picking a few node_modules folders into the
# slim runner and running migrate deploy there is fragile and breaks the
# moment the CLI needs a package that wasn't hand-copied.
FROM base AS migrator
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
CMD ["bunx", "prisma", "migrate", "deploy"]

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["bun", "server.js"]
