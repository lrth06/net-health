FROM node:16-alpine as build

WORKDIR /usr/src/app

COPY package.json ./

COPY *lock.json ./

RUN yarn install

COPY . .

RUN yarn build

FROM nginx:mainline-alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]