FROM node:22-alpine AS maxbot

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npx prisma generate

ENV NODE_EXTRA_CA_CERTS=/app/certs/russian-trusted-root-ca.crt

CMD ["sh", "-c", "export DATABASE_URL=\"${DATABASE_URL:-postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}}\" && npx prisma migrate deploy && npm run start:bot"]
