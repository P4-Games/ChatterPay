#!/bin/bash

# Mover al directorio raíz del proyecto
cd "$(dirname "$0")/.."

# Exportar variables de entorno desde el archivo .env
export $(grep -v '^#' .env | xargs)

# Volver al directorio scripts
cd scripts

# Ejecutar docker build con las variables de entorno como argumentos de compilación
docker build \
  --build-arg APP_ENV="$APP_ENV" \
  --build-arg MONGODB="$MONGODB" \
  --build-arg MONGODB_BOT="$MONGODB_BOT" \
  --build-arg DB_CHATTERPAY_NAME="$DB_CHATTERPAY_NAME" \
  --build-arg RECAPTCHA_API_KEY="$RECAPTCHA_API_KEY" \
  --build-arg NEXT_PUBLIC_RECAPTCHA_SITE_KEY="$NEXT_PUBLIC_RECAPTCHA_SITE_KEY" \
  --build-arg NEXT_PUBLIC_NFT_IMAGE_REPOSITORY="$NEXT_PUBLIC_NFT_IMAGE_REPOSITORY" \
  --build-arg NEXT_PUBLIC_NFT_MARKETPLACE_URL="$NEXT_PUBLIC_NFT_MARKETPLACE_URL" \
  --build-arg BOT_API_TOKEN="$BOT_API_TOKEN" \
  --build-arg BOT_API_URL="$BOT_API_URL" \
  --build-arg BOT_API_WAPP_ENABLED="$BOT_API_WAPP_ENABLED" \
  --build-arg BACKEND_API_URL="$BACKEND_API_URL" \
  --build-arg BACKEND_API_TOKEN="$BACKEND_API_TOKEN" \
  --build-arg NODE_PROVIDER_SEPOLIA_URL="$NODE_PROVIDER_SEPOLIA_URL" \
  --build-arg NODE_PROVIDER_MUMBAI_URL="$NODE_PROVIDER_MUMBAI_URL" \
  --build-arg NODE_PROVIDER_SCROLL_URL="$NODE_PROVIDER_SCROLL_URL" \
  --build-arg HANDLE_VERCEL_FREE_PLAN_TIMEOUT="$HANDLE_VERCEL_FREE_PLAN_TIMEOUT" \
  --build-arg NEXT_PUBLIC_USE_MOCK="$NEXT_PUBLIC_USE_MOCK" \
  --build-arg API3_ENABLED="$API3_ENABLED" \
  --build-arg JWT_SECRET="$JWT_SECRET" \
  --build-arg NEXT_PUBLIC_FROM_ICP="$NEXT_PUBLIC_FROM_ICP" \
  --build-arg NEXT_PUBLIC_UI_URL="$NEXT_PUBLIC_UI_URL" \
  --build-arg NEXT_PUBLIC_ALLOWED_ORIGINS="$NEXT_PUBLIC_ALLOWED_ORIGINS" \
  -t my-nextjs-app ..
