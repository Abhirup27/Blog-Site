FROM node:20-alpine3.19
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD [ "npm", "start"]