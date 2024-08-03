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
  --build-arg BOT_API_TOKEN="$BOT_API_TOKEN" \
  --build-arg BOT_API_URL="$BOT_API_URL" \
  --build-arg NODE_PROVIDER_SEPOLIA_URL="$NODE_PROVIDER_SEPOLIA_URL" \
  --build-arg NODE_PROVIDER_MUMBAI_URL="$NODE_PROVIDER_MUMBAI_URL" \
  --build-arg NODE_PROVIDER_SCROLL_URL="$NODE_PROVIDER_SCROLL_URL" \
  --build-arg API3_ENABLED="$API3_ENABLED" \
  --build-arg NEXT_PUBLIC_USE_MOCK="$NEXT_PUBLIC_USE_MOCK" \
  --build-arg NEXT_PUBLIC_UI_URL="$NEXT_PUBLIC_UI_URL" \
  --build-arg NEXT_PUBLIC_ALLOWED_ORIGINS="$NEXT_PUBLIC_ALLOWED_ORIGINS" \
  -t my-nextjs-app ..
