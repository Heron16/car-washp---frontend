# ============================================================
#  Frontend — Dockerfile multi-stage
#  Stage 1: build Vite (React)
#  Stage 2: Nginx serve arquivos estáticos
# ============================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# ARG para variáveis de build-time do Vite
ARG VITE_API_URL=https://meuapp.local/api
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# --- Stage 2: Servir com Nginx ---
FROM nginx:1.25-alpine AS production

# Remove config padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Config para SPA (React Router)
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

# Copia build do React
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
