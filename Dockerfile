FROM node:10-alpine

WORKDIR /home/node/app

COPY package*.json ./


RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "node", "mot.js" ]