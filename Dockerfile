# Usamos Node.js
FROM node:20-alpine

# Seteamos la carpeta de trabajo DIRECTAMENTE en el frontend
WORKDIR /app/front-proformas

# Copiamos primero solo los archivos de dependencias
# (Esto permite que Docker use su caché y no reinstale si no hay cambios)
COPY front-proformas/package.json front-proformas/package-lock.json* ./

# Instalamos durante la construcción de la imagen (¡Mucho más rápido!)
RUN npm install

# Copiamos el resto del código
COPY front-proformas/ .

# Exponemos el puerto
EXPOSE 5173

# Arrancamos el servidor
CMD ["npm", "run", "dev", "--", "--host"]