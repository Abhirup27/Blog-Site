FROM node:20-alpine3.19
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install nodemon
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD [ "npm", "start"]