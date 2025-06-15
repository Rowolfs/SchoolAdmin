# backend/Dockerfile

# Используем официальный образ Node.js LTS
FROM node:18

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json сначала, чтобы воспользоваться кэшем Docker
COPY backend/package.json backend/package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь остальной код бэкенда
COPY backend/ ./

# Указываем переменную окружения (если нужно)
ENV NODE_ENV=development

# Открываем порт, на котором запускается бэкенд (например, 4000)
EXPOSE 4000

# Запускаем команду "npm run dev"
CMD ["npm", "run", "dev"]
