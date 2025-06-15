# frontend/Dockerfile

# Используем образ Node.js LTS
FROM node:18

# Комментарий с путём (по согласованному шаблону):
# frontend/Dockerfile

WORKDIR /usr/src/app

# Копируем только package.json и package-lock.json, чтобы кэшировать установку зависимостей
COPY frontend/package.json frontend/package-lock.json ./

# Устанавливаем зависимости, пропуская peer-конфликты
RUN npm install --legacy-peer-deps

# Копируем весь фронтенд-код (node_modules уже не возьмётся, благодаря .dockerignore)
COPY frontend/ ./

ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "dev"]
