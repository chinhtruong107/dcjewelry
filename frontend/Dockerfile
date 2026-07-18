FROM node:20-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci


FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

# Chỉ giữ dòng này nếu dự án có thư mục public
COPY --from=builder /app/public ./public

EXPOSE 3002

CMD ["npm", "run", "start", "--", "-p", "3002"]