FROM node:18

# Устанавливаем OpenSSL
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Копируем из локального контекста (папка backend)
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем схему Prisma из локального контекста
COPY prisma ./prisma

# Генерируем Prisma Client внутри контейнера
RUN npx prisma generate

# Копируем весь код из текущего контекста (папка backend)
COPY . ./

ENV NODE_ENV=development
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run dev"]
