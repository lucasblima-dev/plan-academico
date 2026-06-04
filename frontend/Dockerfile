FROM node:20-alpine

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

EXPOSE 5173

# Vite precisa de --host para aceitar conexões externas dentro do container
CMD ["npm", "run", "dev", "--", "--host"]
