FROM node:17-alpine

WORKDIR /usr/src/app

COPY package.json .


RUN npm install --production


COPY .  .

RUN apk add speedtest-cli

CMD [ "node", "index.js" ]