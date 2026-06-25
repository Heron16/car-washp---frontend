FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/meuapp.local.pem /etc/nginx/certs/meuapp.local.pem
COPY certs/meuapp.local-key.pem /etc/nginx/certs/meuapp.local-key.pem
COPY certs/lavacar-ph.local.pem /etc/nginx/certs/lavacar-ph.local.pem
COPY certs/lavacar-ph.local-key.pem /etc/nginx/certs/lavacar-ph.local-key.pem

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
