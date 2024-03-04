FROM node:10-alpine

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3003

CMD [ "node", "auth.js" ]
