FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./ 
RUN apk add --no-cache libc6-compat && npm ci
#
FROM node:18-alpine AS builder
WORKDIR /app
#
# args
ARG APP_ENV
ARG MONGODB
ARG CLERK_SECRET_KEY
ARG BOT_API_TOKEN
ARG NEXT_PUBLIC_USE_MOCK
ARG NEXT_PUBLIC_UI_URL
ARG NEXT_PUBLIC_BOT_API_URL
ARG NEXT_PUBLIC_ALLOWED_ORIGINS

#
# env
ENV NODE_ENV production
ENV APP_ENV $APP_ENV
ENV MONGODB $MONGODB
ENV BOT_API_TOKEN $BOT_API_TOKEN
ENV NEXT_PUBLIC_USE_MOCK $NEXT_PUBLIC_USE_MOCK
ENV NEXT_PUBLIC_UI_URL $NEXT_PUBLIC_UI_URL
ENV NEXT_PUBLIC_BOT_API_URL $NEXT_PUBLIC_BOT_API_URL
ENV NEXT_PUBLIC_ALLOWED_ORIGINS $NEXT_PUBLIC_ALLOWED_ORIGINS
#
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN echo "***********************"
RUN env
RUN echo "***********************"
RUN npm run build
#
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
#
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]