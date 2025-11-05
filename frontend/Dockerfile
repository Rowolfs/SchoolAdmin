FROM node:18

WORKDIR /usr/src/app

# Копируем из локального контекста (папка frontend)
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем весь код из текущего контекста (папка frontend)
COPY . ./

ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]
