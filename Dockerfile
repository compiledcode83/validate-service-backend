FROM node:16-buster

ARG BUILD_APP

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --no-optional && npm cache clean --force

COPY . .

COPY .env.test .env.test

RUN chmod +x node_modules/.bin/nest && npm run build ${BUILD_APP}

VOLUME /app/node_modules

EXPOSE 3000
