# front-agrogestor/Dockerfile — usa el servidor de Angular en vez de Nginx
FROM node:18-alpine

WORKDIR /usr/src/app

# 1) Copia los package.json y los configs de Tailwind/PostCSS antes de instalar
COPY package*.json tailwind.config.js postcss.config.js ./

# 2) Instala Angular CLI y dependencias (ahora sí leerá tus configs)
RUN npm install -g @angular/cli \
    && npm ci

# 3) Copia el resto de la app
COPY . .

EXPOSE 4200

# 4) Arranca el servidor de dev de Angular
CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]
