FROM node:20-alpine

WORKDIR /app

# Install deps first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# App source
COPY src/ ./src/

EXPOSE 3000

USER node

CMD ["node", "src/index.js"]
