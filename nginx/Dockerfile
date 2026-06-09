FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/lavacar-ph.local.pem /etc/nginx/certs/lavacar-ph.local.pem
COPY certs/lavacar-ph.local-key.pem /etc/nginx/certs/lavacar-ph.local-key.pem

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
