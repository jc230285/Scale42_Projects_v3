# Node container for Next.js
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm install || true
COPY . .
EXPOSE 3000
CMD ["npm","run","dev"]
