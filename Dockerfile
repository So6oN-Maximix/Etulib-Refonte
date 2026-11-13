FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate --generator client

COPY . .

RUN npm run build

EXPOSE 5173

CMD ["sh", "-c", "npx prisma migrate deploy && node build"]