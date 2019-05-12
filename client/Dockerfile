FROM node:11

COPY . /client
WORKDIR /client

RUN apt-get update
RUN yarn install
ENTRYPOINT yarn start
