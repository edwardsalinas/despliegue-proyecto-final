# Dockerfile para el Backend (Node.js)

# --- Etapa 1: Base ---
# Usamos una imagen oficial de Node.js. La versión 'alpine' es más ligera.
FROM node:20-alpine AS base

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json para aprovechar el caché de Docker
# Si estos archivos no cambian, Docker no volverá a instalar las dependencias
COPY package*.json ./

# --- Etapa 2: Dependencias de Producción ---
# Instalamos solo las dependencias necesarias para producción
FROM base AS production-deps
RUN npm install --omit=dev

# --- Etapa 3: Build Final de Producción ---
FROM base AS production
# Copiamos las dependencias de producción que ya instalamos
COPY --from=production-deps /app/node_modules ./node_modules
# Copiamos el resto del código de la aplicación
COPY . .

# Exponemos el puerto en el que corre la aplicación Express (usaremos el 4000 como ejemplo)
# Asegúrate de que tu app en index.js use este puerto, o cámbialo aquí.
EXPOSE 4000

# Comando para iniciar la aplicación en producción
CMD [ "node", "index.js" ]