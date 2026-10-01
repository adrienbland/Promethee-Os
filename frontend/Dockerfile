FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# On expose sur 3000 dans le conteneur, mappé sur 3005 par docker-compose
EXPOSE 3000

CMD ["npm", "run", "dev"]
