FROM node:22-alpine AS maxbot

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ENV NODE_EXTRA_CA_CERTS=/app/certs/russian-trusted-root-ca.crt

CMD ["npm", "run", "start:bot"]
