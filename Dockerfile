# Estágio 1 — build da aplicação Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Heap limitado para o build caber em ambientes Docker com pouca memória
RUN NODE_OPTIONS=--max_old_space_size=768 npm run build

# Estágio 2 — nginx servindo os estáticos e proxeando /api para o backend
FROM nginx:1.27-alpine
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/srm-credit-engine-front/browser /usr/share/nginx/html

# Upstream da API — sobrescreva se o backend não estiver na rede padrão do compose
ENV API_UPSTREAM=http://srm-app:8080

EXPOSE 80
