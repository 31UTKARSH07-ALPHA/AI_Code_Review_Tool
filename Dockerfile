FROM node:25-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 8000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]