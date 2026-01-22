FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine

RUN npm install -g serve

COPY --from=builder /app/dist /app/dist

WORKDIR /app/dist
EXPOSE 3000

CMD ["serve", "-p", "3000", "--single"]
