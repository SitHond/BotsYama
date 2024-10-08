FROM node:latest

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы проекта, кроме node_modules
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install
RUN npm rebuild sqlite3

# Копируем остальную часть приложения
COPY . .

# Запускаем приложение
CMD ["node", "index.js"]
