FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=https://meuapp.local/api
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

FROM nginx:1.25-alpine AS production

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
