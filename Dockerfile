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
ARG MONGODB_BOT
ARG BOT_API_TOKEN
ARG BOT_API_URL
ARG BOT_API_WAPP_ENABLED
ARG NODE_PROVIDER_SEPOLIA_URL
ARG NODE_PROVIDER_MUMBAI_URL
ARG NODE_PROVIDER_SCROLL_URL
ARG HANDLE_VERCEL_FREE_PLAN_TIMEOUT
ARG API3_ENABLED
ARG NEXT_PUBLIC_FROM_ICP
ARG NEXT_PUBLIC_USE_MOCK
ARG NEXT_PUBLIC_UI_URL
ARG NEXT_PUBLIC_ALLOWED_ORIGINS

#
# env
ENV NODE_ENV production
ENV APP_ENV $APP_ENV
ENV MONGODB $MONGODB
ENV MONGODB_BOT $MONGODB_BOT 
ENV BOT_API_TOKEN $BOT_API_TOKEN
ENV BOT_API_URL $BOT_API_URL
ENV BOT_API_WAPP_ENABLED $BOT_API_WAPP_ENABLED
ENV NODE_PROVIDER_SEPOLIA_URL $NODE_PROVIDER_SEPOLIA_URL
ENV NODE_PROVIDER_MUMBAI_URL $NODE_PROVIDER_MUMBAI_URL
ENV NODE_PROVIDER_SCROLL_URL $NODE_PROVIDER_SCROLL_URL
ENV HANDLE_VERCEL_FREE_PLAN_TIMEOUT $HANDLE_VERCEL_FREE_PLAN_TIMEOUT
ENV API3_ENABLED $API3_ENABLED
ENV NEXT_PUBLIC_FROM_ICP $NEXT_PUBLIC_FROM_ICP
ENV NEXT_PUBLIC_USE_MOCK $NEXT_PUBLIC_USE_MOCK
ENV NEXT_PUBLIC_UI_URL $NEXT_PUBLIC_UI_URL
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