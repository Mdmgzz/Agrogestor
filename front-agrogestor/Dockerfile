# front-agrogestor/Dockerfile — usa el servidor de Angular en vez de Nginx
FROM node:18-alpine

WORKDIR /usr/src/app

# 1) Instala Angular CLI y dependencias
COPY package*.json ./
RUN npm install -g @angular/cli \
    && npm ci

# 2) Copia el resto y expón el puerto
COPY . .
EXPOSE 4200

# 3) Arranca el servidor de dev de Angular
CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]
